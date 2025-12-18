/**
 * API para enriquecer empresas não bancarizadas com dados de múltiplas fontes
 * - APIs externas (Receita Federal, Serasa)
 * - Uploads de planilhas
 * - Conexões de banco de dados
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
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { companyIds, sourceConfigs, userId } = req.body

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'companyIds array is required'
      })
    }

    if (!sourceConfigs || !Array.isArray(sourceConfigs) || sourceConfigs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'sourceConfigs array is required'
      })
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      })
    }

    const adminClient = getAdminClient()

    // Buscar empresas
    const { data: companies, error: fetchError } = await adminClient
      .from('unbanked_companies')
      .select('*')
      .in('id', companyIds)
      .eq('created_by', userId)

    if (fetchError) {
      console.error('Error fetching companies:', fetchError)
      throw new Error(fetchError.message)
    }

    const enrichedCompanies = []

    // Processar cada empresa
    for (const company of companies) {
      let enrichedData = { ...company }

      // Processar cada fonte de dados
      for (const sourceConfig of sourceConfigs) {
        const { sourceType, sourceId, fieldMapping } = sourceConfig

        try {
          if (sourceType === 'external_api') {
            // Enriquecer com APIs externas
            enrichedData = await enrichWithExternalAPI(company, sourceId, enrichedData)
          } else if (sourceType === 'upload') {
            // Enriquecer com dados de upload
            enrichedData = await enrichWithUpload(company, sourceId, fieldMapping, enrichedData)
          } else if (sourceConfig.sourceType === 'database') {
            // Enriquecer com dados de banco
            enrichedData = await enrichWithDatabase(company, sourceId, fieldMapping, enrichedData)
          }
        } catch (error) {
          console.error(`Error enriching with ${sourceType}:`, error)
          // Continuar com outras fontes mesmo se uma falhar
        }
      }

      // Recalcular score após enriquecimento
      const { score, products, priority } = calculatePotentialAfterEnrichment(enrichedData)

      // Atualizar empresa
      const { data: updatedCompany, error: updateError } = await adminClient
        .from('unbanked_companies')
        .update({
          ...enrichedData,
          identification_score: score,
          potential_products: products,
          priority: priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)
        .eq('created_by', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating enriched company:', updateError)
        continue
      }

      enrichedCompanies.push(updatedCompany)
    }

    return res.status(200).json({
      success: true,
      enrichedCompanies
    })
  } catch (error) {
    console.error('Error enriching companies:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to enrich companies'
    })
  }
}

// Funções auxiliares de enriquecimento

async function enrichWithExternalAPI(company, apiId, enrichedData) {
  // Simular chamadas a APIs externas baseado no tipo
  if (apiId === 'receita_federal') {
    // Simular dados da Receita Federal
    enrichedData.revenue_estimate = enrichedData.revenue_estimate || (Math.random() * 1000000 + 50000)
    enrichedData.employee_count = enrichedData.employee_count || Math.floor(Math.random() * 50)
    enrichedData.industry = enrichedData.industry || 'Serviços'
  } else if (apiId === 'serasa') {
    // Simular dados do Serasa
    // Adicionar informações de crédito se necessário
  }

  return enrichedData
}

async function enrichWithUpload(company, uploadId, fieldMapping, enrichedData) {
  const adminClient = getAdminClient()

  // Buscar dados do upload
  const { data: uploadData, error } = await adminClient
    .from('data_sources_new')
    .select('*')
    .eq('id', uploadId)
    .single()

  if (error || !uploadData) {
    return enrichedData
  }

  // Simular enriquecimento com dados do upload
  // Em produção, processar o arquivo real e fazer match por CNPJ
  if (uploadData.data && Array.isArray(uploadData.data)) {
    const matchingRow = uploadData.data.find(row => 
      row[fieldMapping?.cnpj || 'cnpj'] === company.cnpj
    )

    if (matchingRow) {
      enrichedData.revenue_estimate = matchingRow[fieldMapping?.revenue || 'revenue'] || enrichedData.revenue_estimate
      enrichedData.employee_count = matchingRow[fieldMapping?.employee_count || 'employee_count'] || enrichedData.employee_count
    }
  }

  return enrichedData
}

async function enrichWithDatabase(company, connectionId, tableMapping, enrichedData) {
  // Simular enriquecimento com dados de banco de dados externo
  // Em produção, conectar ao banco e fazer query real
  return enrichedData
}

function calculatePotentialAfterEnrichment(company) {
  // Recalcular score baseado nos dados enriquecidos
  let score = 0

  // Receita (peso 0.30)
  const revenue = company.revenue_estimate || 0
  score += Math.min(revenue / 1000000, 100) * 0.30

  // Funcionários (peso 0.20)
  const employees = company.employee_count || 0
  score += Math.min(employees * 5, 100) * 0.20

  // Status bancário (peso 0.25)
  if (company.banking_status === 'not_banked') {
    score += 100 * 0.25
  } else if (company.banking_status === 'partial') {
    score += 60 * 0.25
  }

  // Setor (peso 0.15)
  const highValueIndustries = ['Tecnologia', 'Serviços', 'Comércio']
  if (highValueIndustries.includes(company.industry)) {
    score += 80 * 0.15
  } else {
    score += 50 * 0.15
  }

  // Tipo de empresa (peso 0.10)
  if (company.company_type === 'LTDA' || company.company_type === 'SA') {
    score += 100 * 0.10
  } else if (company.company_type === 'PME' || company.company_type === 'EIRELI') {
    score += 70 * 0.10
  } else {
    score += 50 * 0.10
  }

  score = Math.min(Math.round(score), 100)

  // Determinar produtos potenciais
  const products = []
  if (company.banking_status === 'not_banked') {
    products.push('conta_corrente', 'cartao_credito', 'poupanca')
  } else {
    products.push('cartao_credito', 'emprestimo', 'investimentos', 'seguro')
  }
  if (revenue > 500000) {
    products.push('investimentos', 'seguro', 'consorcio')
  }

  const priority = Math.floor(score / 10)

  return {
    score,
    products: [...new Set(products)],
    priority
  }
}

