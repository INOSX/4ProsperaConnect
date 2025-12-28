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
      'search_data': ['pesquisar', 'procurar', 'buscar dados'],
      'get_all_data': ['conhecer todos', 'ler todos', 'ver todos os dados', 'mostrar tudo', 'resumo completo'],
      'know_all_data': ['conhecer dados', 'ler dados', 'ver dados', 'resumo dos dados']
    }
  }

  async classifyIntent(text, user) {
    console.log('[BMAD:VoiceIntentAgent] 🔍 ========== CLASSIFICANDO INTENÇÃO ==========')
    console.log('[BMAD:VoiceIntentAgent] 📝 Input:', {
      text: text?.substring(0, 200),
      textLength: text?.length || 0,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const lowerText = text.toLowerCase()
    console.log('[BMAD:VoiceIntentAgent] 🔄 Texto normalizado (primeiros 100 chars):', lowerText.substring(0, 100))
    
    // Priorizar consultas sobre empresas sem colaboradores como query_database
    const companiesWithoutEmployeesKeywords = [
      'empresa que não tem', 'empresas que não têm', 'empresa sem colaborador',
      'empresas sem colaboradores', 'empresa sem funcionário', 'empresas sem funcionários',
      'não tem colaborador', 'não têm colaboradores', 'sem colaborador cadastrado',
      'sem funcionário cadastrado', 'existem empresas que não', 'tem empresa que não tem',
      'empresa que não têm', 'empresas que não tem'
    ]
    const hasCompaniesWithoutEmployeesKeyword = companiesWithoutEmployeesKeywords.some(keyword => lowerText.includes(keyword))
    
    if (hasCompaniesWithoutEmployeesKeyword) {
      const params = this.extractParams(text, 'query_database')
      const result = {
        intent: 'query_database',
        params,
        confidence: 0.95,
        originalText: text
      }
      console.log('[BMAD:VoiceIntentAgent] ✅ Intenção classificada (empresas sem colaboradores):', {
        intent: result.intent,
        confidence: result.confidence,
        params: result.params
      })
      console.log('[BMAD:VoiceIntentAgent] 📤 Resultado completo:', JSON.stringify(result, null, 2))
      return result
    }
    
    // Priorizar consultas de banco de dados (query_database) para consultas sobre média, gráficos, etc
    const queryKeywords = ['média', 'média de', 'average', 'gráfico', 'chart', 'por período', 'por mês', 'por ano', 'tendência', 'evolução']
    const hasQueryKeyword = queryKeywords.some(keyword => lowerText.includes(keyword))
    
    if (hasQueryKeyword) {
      const params = this.extractParams(text, 'query_database')
      const result = {
        intent: 'query_database',
        params,
        confidence: 0.9,
        originalText: text
      }
      console.log('[BMAD:VoiceIntentAgent] ✅ Intenção classificada (palavra-chave de query):', {
        intent: result.intent,
        confidence: result.confidence,
        params: result.params,
        matchedKeyword: queryKeywords.find(kw => lowerText.includes(kw))
      })
      console.log('[BMAD:VoiceIntentAgent] 📤 Resultado completo:', JSON.stringify(result, null, 2))
      return result
    }
    
    // Buscar padrões de intenção
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          const params = this.extractParams(text, intent)
          const result = {
            intent,
            params,
            confidence: 0.8,
            originalText: text
          }
        console.log('[BMAD:VoiceIntentAgent] ✅ Intenção classificada (padrão correspondente):', {
          intent: result.intent,
          pattern: pattern,
          confidence: result.confidence,
          params: result.params
        })
        console.log('[BMAD:VoiceIntentAgent] 📤 Resultado completo:', JSON.stringify(result, null, 2))
        return result
        }
      }
    }

    // Se não encontrou padrão específico, tentar usar LLM
    // Por enquanto, retorna query_database como padrão
    const params = this.extractParams(text, 'query_database')
    const result = {
      intent: 'query_database',
      params,
      confidence: 0.6,
      originalText: text
    }
        console.log('[BMAD:VoiceIntentAgent] ⚠️ Intenção classificada (fallback padrão):', {
          intent: result.intent,
          confidence: result.confidence,
          params: result.params,
          reason: 'Nenhum padrão específico encontrado'
        })
        console.log('[BMAD:VoiceIntentAgent] 📤 Resultado completo:', JSON.stringify(result, null, 2))
        return result
  }

  extractParams(text, intent) {
    console.log('[BMAD:VoiceIntentAgent] 🔧 ========== EXTRAINDO PARÂMETROS ==========')
    console.log('[BMAD:VoiceIntentAgent] 📝 Input:', {
      text: text?.substring(0, 100),
      intent: intent
    })
    
    const params = {}
    const lowerText = text.toLowerCase()
    let extractedCount = 0

    // Extrair CNPJ
    const cnpjMatch = text.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/)
    if (cnpjMatch) {
      params.cnpj = cnpjMatch[0].replace(/\D/g, '')
      extractedCount++
      console.log('[BMAD:VoiceIntentAgent]   ✅ CNPJ extraído:', params.cnpj)
    }

    // Extrair CPF
    const cpfMatch = text.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/)
    if (cpfMatch) {
      params.cpf = cpfMatch[0].replace(/\D/g, '')
      extractedCount++
      console.log('[BMAD:VoiceIntentAgent]   ✅ CPF extraído:', params.cpf)
    }

    // Extrair ID
    const idMatch = text.match(/(?:id|identificador)\s*:?\s*(\w+)/i)
    if (idMatch) {
      params.id = idMatch[1]
      extractedCount++
      console.log('[BMAD:VoiceIntentAgent]   ✅ ID extraído:', params.id)
    }

    // Extrair nome (após palavras-chave)
    const nameKeywords = ['nome', 'chamada', 'denominada']
    for (const keyword of nameKeywords) {
      const nameMatch = lowerText.match(new RegExp(`${keyword}\\s+(.+?)(?:\\s|$)`, 'i'))
      if (nameMatch) {
        params.name = nameMatch[1].trim()
        extractedCount++
        console.log('[BMAD:VoiceIntentAgent]   ✅ Nome extraído:', params.name)
        break
      }
    }

    // Extrair email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
    if (emailMatch) {
      params.email = emailMatch[0]
      extractedCount++
      console.log('[BMAD:VoiceIntentAgent]   ✅ Email extraído:', params.email)
    }

    console.log('[BMAD:VoiceIntentAgent] ✅ ========== EXTRAÇÃO DE PARÂMETROS CONCLUÍDA ==========')
    console.log('[BMAD:VoiceIntentAgent] 📊 Resumo:', {
      totalExtracted: extractedCount,
      params: params,
      hasParams: Object.keys(params).length > 0
    })
    console.log('[BMAD:VoiceIntentAgent] 📤 Parâmetros extraídos:', JSON.stringify(params, null, 2))
    return params
  }
}

