/**
 * API para calcular potencial de empresas não bancarizadas
 * Lógica de Scoring:
 * - Receita estimada (peso 0.30)
 * - Número de funcionários (peso 0.20)
 * - Status bancário (peso 0.25)
 * - Setor/Indústria (peso 0.15)
 * - Tipo de empresa (peso 0.10)
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
    const { companyIds } = req.body
    const userId = req.headers['x-user-id']

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'companyIds array is required'
      })
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      })
    }

    const adminClient = getAdminClient()
    const updatedCompanies = []

    for (const companyId of companyIds) {
      const { data: company, error: fetchError } = await adminClient
        .from('unbanked_companies')
        .select('*')
        .eq('id', companyId)
        .eq('created_by', userId)
        .single()

      if (fetchError) {
        console.error(`Error fetching company ${companyId}:`, fetchError)
        continue
      }

      const { score, products, priority } = calculateIdentificationScore(company)

      const { data: updatedCompany, error: updateError } = await adminClient
        .from('unbanked_companies')
        .update({
          identification_score: score,
          potential_products: products,
          priority: priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .eq('created_by', userId)
        .select()
        .single()

      if (updateError) {
        console.error(`Error updating company ${companyId}:`, updateError)
        continue
      }

      updatedCompanies.push(updatedCompany)
    }

    return res.status(200).json({
      success: true,
      updatedCompanies
    })
  } catch (error) {
    console.error('Error calculating company potential:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate company potential'
    })
  }
}

function calculateIdentificationScore(company) {
  let score = 0

  // Fator 1: Receita estimada (peso 0.30)
  const revenue = parseFloat(company.revenue_estimate || 0)
  let revenueScore = 0
  if (revenue >= 1000000) revenueScore = 100
  else if (revenue >= 500000) revenueScore = 80
  else if (revenue >= 250000) revenueScore = 60
  else if (revenue >= 100000) revenueScore = 40
  else if (revenue >= 50000) revenueScore = 20
  else revenueScore = 10

  // Fator 2: Número de funcionários (peso 0.20)
  const employees = parseInt(company.employee_count || 0)
  let employeeScore = 0
  if (employees >= 20) employeeScore = 100
  else if (employees >= 10) employeeScore = 80
  else if (employees >= 5) employeeScore = 60
  else if (employees >= 2) employeeScore = 40
  else if (employees >= 1) employeeScore = 20
  else employeeScore = 10

  // Fator 3: Status bancário (peso 0.25)
  let bankingScore = 0
  if (company.banking_status === 'not_banked') {
    bankingScore = 100 // Empresas não bancarizadas têm maior potencial
  } else if (company.banking_status === 'partial') {
    bankingScore = 60 // Empresas subexploradas têm potencial médio
  } else {
    bankingScore = 20
  }

  // Fator 4: Setor/Indústria (peso 0.15)
  const industry = company.industry || ''
  const highValueIndustries = ['Tecnologia', 'Serviços', 'Comércio', 'Consultoria']
  let industryScore = 0
  if (highValueIndustries.some(hv => industry.includes(hv))) {
    industryScore = 80
  } else if (industry) {
    industryScore = 50
  } else {
    industryScore = 30
  }

  // Fator 5: Tipo de empresa (peso 0.10)
  const companyType = company.company_type || ''
  let typeScore = 0
  if (companyType === 'LTDA' || companyType === 'SA') {
    typeScore = 100
  } else if (companyType === 'PME' || companyType === 'EIRELI') {
    typeScore = 70
  } else if (companyType === 'MEI') {
    typeScore = 50
  } else {
    typeScore = 30
  }

  // Calcular score combinado
  const identificationScore = Math.round(
    revenueScore * 0.30 +
    employeeScore * 0.20 +
    bankingScore * 0.25 +
    industryScore * 0.15 +
    typeScore * 0.10
  )

  // Determinar produtos potenciais
  const potentialProducts = []
  if (company.banking_status === 'not_banked') {
    // Empresas não bancarizadas precisam de produtos básicos
    potentialProducts.push('conta_corrente', 'cartao_credito', 'poupanca')
  } else if (company.banking_status === 'partial') {
    // Empresas subexploradas podem usar mais produtos
    potentialProducts.push('cartao_credito', 'emprestimo', 'investimentos', 'seguro')
  }

  // Adicionar produtos baseados em receita
  if (revenue > 500000) {
    potentialProducts.push('investimentos', 'seguro', 'consorcio')
  }
  if (revenue > 1000000) {
    potentialProducts.push('capital_giro', 'financiamento')
  }

  // Determinar prioridade
  let priority = 0
  if (identificationScore >= 85) {
    priority = 9
  } else if (identificationScore >= 75) {
    priority = 8
  } else if (identificationScore >= 65) {
    priority = 6
  } else if (identificationScore >= 50) {
    priority = 4
  } else {
    priority = 2
  }

  // Ajustar prioridade baseado em outros fatores
  if (revenue >= 500000 && employees >= 10) {
    priority = Math.min(priority + 1, 10)
  }
  if (company.banking_status === 'not_banked' && identificationScore >= 70) {
    priority = Math.min(priority + 1, 10)
  }

  return {
    score: Math.min(identificationScore, 100),
    products: [...new Set(potentialProducts)],
    priority
  }
}

