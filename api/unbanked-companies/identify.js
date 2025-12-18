/**
 * API Route para identificar empresas não bancarizadas ou subexploradas
 * Processa fontes de dados e identifica empresas CNPJ
 */
const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sourceConfigs } = req.body
    const userId = req.headers['x-user-id']

    if (!sourceConfigs || !Array.isArray(sourceConfigs) || sourceConfigs.length === 0) {
      return res.status(400).json({ error: 'sourceConfigs array is required' })
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const adminClient = getAdminClient()
    const identifiedCompanies = []

    // Processar cada fonte de dados
    for (const sourceConfig of sourceConfigs) {
      let companies = []

      try {
        if (sourceConfig.sourceType === 'upload') {
          // Buscar dados do upload
          const { data: uploadData, error: uploadError } = await adminClient
            .from('data_sources_new')
            .select('*')
            .eq('id', sourceConfig.sourceId)
            .single()

          if (uploadError) {
            console.error('Error fetching upload:', uploadError)
            continue
          }

          // Simular extração de empresas CNPJ do arquivo
          // Em produção, processar o arquivo real
          companies = extractCompaniesFromUpload(uploadData, sourceConfig.fieldMapping)
        } else if (sourceConfig.sourceType === 'database') {
          // Buscar dados da conexão de banco
          const { data: connectionData, error: connError } = await adminClient
            .from('data_connections')
            .select('*')
            .eq('id', sourceConfig.sourceId)
            .single()

          if (connError) {
            console.error('Error fetching connection:', connError)
            continue
          }

          // Simular consulta ao banco externo
          // Em produção, conectar ao banco e fazer query real
          companies = extractCompaniesFromDatabase(connectionData, sourceConfig.tableMapping)
        } else if (sourceConfig.sourceType === 'external_api') {
          // Buscar dados de API externa
          companies = await extractCompaniesFromAPI(sourceConfig)
        }

        // Processar cada empresa identificada
        for (const companyData of companies) {
          const cnpj = companyData.cnpj
          if (!cnpj) continue

          // Verificar se já existe
          const { data: existing } = await adminClient
            .from('unbanked_companies')
            .select('*')
            .eq('cnpj', cnpj)
            .maybeSingle()

          if (existing) {
            // Atualizar fonte de dados se necessário
            const dataSources = existing.data_sources || []
            if (!dataSources.some(ds => ds.sourceId === sourceConfig.sourceId)) {
              dataSources.push({
                sourceType: sourceConfig.sourceType,
                sourceId: sourceConfig.sourceId,
                identifiedAt: new Date().toISOString()
              })
              await adminClient
                .from('unbanked_companies')
                .update({ data_sources: dataSources })
                .eq('id', existing.id)
            }
            continue
          }

          // Verificar se é cliente do banco
          const { data: existingClient } = await adminClient
            .from('companies')
            .select('*')
            .eq('cnpj', cnpj)
            .maybeSingle()

          const bankingStatus = existingClient 
            ? (existingClient.products_contracted?.length <= 1 ? 'partial' : 'fully_banked')
            : 'not_banked'

          // Se já é cliente totalmente bancarizado, pular
          if (bankingStatus === 'fully_banked') continue

          // Calcular score de identificação
          const identificationScore = calculateIdentificationScore(companyData, bankingStatus)

          // Determinar produtos potenciais
          const potentialProducts = determinePotentialProducts(companyData, bankingStatus)

          // Criar empresa não bancarizada
          const { data: newCompany, error: insertError } = await adminClient
            .from('unbanked_companies')
            .insert({
              cnpj,
              company_name: companyData.company_name || companyData.name || 'Nome não informado',
              trade_name: companyData.trade_name || companyData.fantasy_name || null,
              company_type: companyData.company_type || null,
              banking_status: bankingStatus,
              products_contracted: existingClient?.products_contracted || [],
              potential_products: potentialProducts,
              identification_score: identificationScore,
              revenue_estimate: companyData.revenue || companyData.annual_revenue || null,
              employee_count: companyData.employee_count || companyData.employees || 0,
              industry: companyData.industry || companyData.sector || null,
              contact_info: {
                email: companyData.email || null,
                phone: companyData.phone || null,
                address: companyData.address || {}
              },
              data_sources: [{
                sourceType: sourceConfig.sourceType,
                sourceId: sourceConfig.sourceId,
                identifiedAt: new Date().toISOString()
              }],
              status: 'identified',
              priority: Math.floor(identificationScore / 10),
              created_by: userId
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error inserting company:', insertError)
            continue
          }

          identifiedCompanies.push(newCompany)
        }
      } catch (error) {
        console.error('Error processing source:', error)
        continue
      }
    }

    return res.status(200).json({
      success: true,
      identified: identifiedCompanies.length,
      companies: identifiedCompanies
    })
  } catch (error) {
    console.error('Error identifying companies:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to identify companies'
    })
  }
}

// Funções auxiliares

function extractCompaniesFromUpload(uploadData, fieldMapping) {
  // Simular extração de empresas de um arquivo CSV/Excel
  // Em produção, processar o arquivo real usando a biblioteca apropriada
  const mockCompanies = []
  
  // Exemplo: se o arquivo tem dados mockados
  if (uploadData.data && Array.isArray(uploadData.data)) {
    uploadData.data.forEach(row => {
      if (row[fieldMapping?.cnpj || 'cnpj']) {
        mockCompanies.push({
          cnpj: row[fieldMapping?.cnpj || 'cnpj'],
          company_name: row[fieldMapping?.company_name || 'company_name'],
          trade_name: row[fieldMapping?.trade_name || 'trade_name'],
          company_type: row[fieldMapping?.company_type || 'company_type'],
          email: row[fieldMapping?.email || 'email'],
          phone: row[fieldMapping?.phone || 'phone'],
          revenue: row[fieldMapping?.revenue || 'revenue'],
          employee_count: row[fieldMapping?.employee_count || 'employee_count'],
          industry: row[fieldMapping?.industry || 'industry']
        })
      }
    })
  }

  return mockCompanies
}

function extractCompaniesFromDatabase(connectionData, tableMapping) {
  // Simular consulta a banco de dados externo
  // Em produção, conectar ao banco e fazer query real
  return []
}

async function extractCompaniesFromAPI(sourceConfig) {
  // Simular chamada a API externa
  // Em produção, fazer chamada real à API
  return []
}

function calculateIdentificationScore(companyData, bankingStatus) {
  let score = 0

  // Fatores de score:
  // 1. Receita estimada (peso 0.30)
  const revenue = companyData.revenue || companyData.annual_revenue || 0
  score += Math.min(revenue / 1000000, 100) * 0.30 // Max score at 1M revenue

  // 2. Número de funcionários (peso 0.20)
  const employees = companyData.employee_count || companyData.employees || 0
  score += Math.min(employees * 5, 100) * 0.20 // Max score at 20 employees

  // 3. Status bancário (peso 0.25)
  if (bankingStatus === 'not_banked') {
    score += 100 * 0.25 // Empresas não bancarizadas têm maior potencial
  } else if (bankingStatus === 'partial') {
    score += 60 * 0.25 // Empresas subexploradas têm potencial médio
  }

  // 4. Setor/Indústria (peso 0.15)
  const highValueIndustries = ['Tecnologia', 'Serviços', 'Comércio']
  if (highValueIndustries.includes(companyData.industry || companyData.sector)) {
    score += 80 * 0.15
  } else {
    score += 50 * 0.15
  }

  // 5. Tipo de empresa (peso 0.10)
  const companyType = companyData.company_type
  if (companyType === 'LTDA' || companyType === 'SA') {
    score += 100 * 0.10
  } else if (companyType === 'PME' || companyType === 'EIRELI') {
    score += 70 * 0.10
  } else {
    score += 50 * 0.10
  }

  return Math.min(Math.round(score), 100)
}

function determinePotentialProducts(companyData, bankingStatus) {
  const products = []

  if (bankingStatus === 'not_banked') {
    // Empresas não bancarizadas precisam de produtos básicos
    products.push('conta_corrente', 'cartao_credito', 'poupanca')
  } else if (bankingStatus === 'partial') {
    // Empresas subexploradas podem usar mais produtos
    products.push('cartao_credito', 'emprestimo', 'investimentos', 'seguro')
  }

  // Adicionar produtos baseados em receita
  const revenue = companyData.revenue || companyData.annual_revenue || 0
  if (revenue > 500000) {
    products.push('investimentos', 'seguro', 'consorcio')
  }

  return [...new Set(products)] // Remover duplicatas
}

