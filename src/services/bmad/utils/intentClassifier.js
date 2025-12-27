/**
 * Classificador de intenções - Mapeamento de intenções para ações
 */
export const intentMap = {
  // Empresas
  'create_company': {
    agent: 'CompanyActionAgent',
    action: 'create',
    requiredParams: ['cnpj', 'name']
  },
  'list_companies': {
    agent: 'CompanyActionAgent',
    action: 'list'
  },
  'update_company': {
    agent: 'CompanyActionAgent',
    action: 'update',
    requiredParams: ['id']
  },
  'delete_company': {
    agent: 'CompanyActionAgent',
    action: 'delete',
    requiredParams: ['id']
  },
  'get_company_stats': {
    agent: 'CompanyActionAgent',
    action: 'getStats',
    requiredParams: ['id']
  },

  // Colaboradores
  'create_employee': {
    agent: 'EmployeeActionAgent',
    action: 'create',
    requiredParams: ['name', 'companyId']
  },
  'list_employees': {
    agent: 'EmployeeActionAgent',
    action: 'list',
    requiredParams: ['companyId']
  },
  'update_employee': {
    agent: 'EmployeeActionAgent',
    action: 'update',
    requiredParams: ['id']
  },
  'delete_employee': {
    agent: 'EmployeeActionAgent',
    action: 'delete',
    requiredParams: ['id']
  },

  // Campanhas
  'create_campaign': {
    agent: 'CampaignActionAgent',
    action: 'create',
    requiredParams: ['name']
  },
  'list_campaigns': {
    agent: 'CampaignActionAgent',
    action: 'list'
  },
  'activate_campaign': {
    agent: 'CampaignActionAgent',
    action: 'activate',
    requiredParams: ['id']
  },
  'pause_campaign': {
    agent: 'CampaignActionAgent',
    action: 'pause',
    requiredParams: ['id']
  },

  // Prospecção
  'list_prospects': {
    agent: 'ProspectingActionAgent',
    action: 'list'
  },
  'enrich_prospect': {
    agent: 'ProspectingActionAgent',
    action: 'enrich',
    requiredParams: ['id']
  },
  'qualify_prospect': {
    agent: 'ProspectingActionAgent',
    action: 'qualify',
    requiredParams: ['id']
  },

  // Consultas
  'query_database': {
    agent: 'DatabaseQueryAgent',
    action: 'query'
  },
  'search_data': {
    agent: 'DatabaseQueryAgent',
    action: 'query'
  }
}

export function getIntentConfig(intent) {
  return intentMap[intent] || null
}

export function validateIntentParams(intent, params) {
  const config = getIntentConfig(intent)
  if (!config) return { valid: false, missing: [] }

  const missing = (config.requiredParams || []).filter(
    param => !params[param]
  )

  return {
    valid: missing.length === 0,
    missing
  }
}

