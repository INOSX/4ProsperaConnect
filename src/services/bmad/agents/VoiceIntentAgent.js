/**
 * VoiceIntentAgent - Classifica intenções e extrai parâmetros de comandos
 */
export default class VoiceIntentAgent {
  constructor() {
    this.intentPatterns = {
      // Empresas
      'create_company': ['criar empresa', 'cadastrar empresa', 'nova empresa'],
      'list_companies': ['listar empresas', 'mostrar empresas', 'empresas cadastradas'],
      'update_company': ['editar empresa', 'atualizar empresa', 'modificar empresa'],
      'delete_company': ['deletar empresa', 'remover empresa', 'excluir empresa'],
      'get_company_stats': ['estatísticas empresa', 'dados empresa', 'informações empresa'],
      
      // Colaboradores
      'create_employee': ['criar colaborador', 'adicionar colaborador', 'novo colaborador'],
      'list_employees': ['listar colaboradores', 'mostrar colaboradores', 'colaboradores'],
      'update_employee': ['editar colaborador', 'atualizar colaborador'],
      'delete_employee': ['deletar colaborador', 'remover colaborador'],
      
      // Campanhas
      'create_campaign': ['criar campanha', 'nova campanha'],
      'list_campaigns': ['listar campanhas', 'mostrar campanhas'],
      'activate_campaign': ['ativar campanha', 'iniciar campanha'],
      'pause_campaign': ['pausar campanha', 'parar campanha'],
      
      // Prospecção
      'list_prospects': ['listar prospects', 'mostrar prospects', 'prospects qualificados'],
      'enrich_prospect': ['enriquecer prospect', 'atualizar prospect'],
      'qualify_prospect': ['qualificar prospect'],
      'calculate_score': ['calcular score', 'score prospect'],
      
      // Consultas
      'query_database': ['quantas', 'quais', 'mostrar', 'listar', 'buscar', 'encontrar'],
      'search_data': ['pesquisar', 'procurar', 'buscar dados']
    }
  }

  async classifyIntent(text, user) {
    const lowerText = text.toLowerCase()
    
    // Buscar padrões de intenção
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          const params = this.extractParams(text, intent)
          return {
            intent,
            params,
            confidence: 0.8,
            originalText: text
          }
        }
      }
    }

    // Se não encontrou padrão específico, tentar usar LLM
    // Por enquanto, retorna query_database como padrão
    return {
      intent: 'query_database',
      params: this.extractParams(text, 'query_database'),
      confidence: 0.6,
      originalText: text
    }
  }

  extractParams(text, intent) {
    const params = {}
    const lowerText = text.toLowerCase()

    // Extrair CNPJ
    const cnpjMatch = text.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/)
    if (cnpjMatch) {
      params.cnpj = cnpjMatch[0].replace(/\D/g, '')
    }

    // Extrair CPF
    const cpfMatch = text.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/)
    if (cpfMatch) {
      params.cpf = cpfMatch[0].replace(/\D/g, '')
    }

    // Extrair ID
    const idMatch = text.match(/(?:id|identificador)\s*:?\s*(\w+)/i)
    if (idMatch) {
      params.id = idMatch[1]
    }

    // Extrair nome (após palavras-chave)
    const nameKeywords = ['nome', 'chamada', 'denominada']
    for (const keyword of nameKeywords) {
      const nameMatch = lowerText.match(new RegExp(`${keyword}\\s+(.+?)(?:\\s|$)`, 'i'))
      if (nameMatch) {
        params.name = nameMatch[1].trim()
        break
      }
    }

    // Extrair email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    if (emailMatch) {
      params.email = emailMatch[0]
    }

    return params
  }
}

