/**
 * SupervisorAgent - Agente supervisor que monitora e valida todas as ações
 * Garante qualidade e consistência em todas as etapas do fluxo ORDX
 */
export default class SupervisorAgent {
  constructor() {
    this.validationHistory = []
    this.correctionHistory = []
  }

  /**
   * Validação inicial (pré-processamento)
   */
  async validateInitial(text) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO INICIAL ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      text: text?.substring(0, 100),
      textLength: text?.length || 0,
      textType: typeof text,
      isEmpty: !text || text.trim().length === 0
    })
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Texto vazio ou inválido')
      const result = {
        approved: false,
        reason: 'Texto vazio ou inválido',
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    if (text.length > 1000) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Texto muito longo', text.length, 'caracteres (máximo: 1000)')
      const result = {
        approved: false,
        reason: 'Texto muito longo (máximo 1000 caracteres)',
        qualityScore: 50
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    console.log('[ORDX:SupervisorAgent] ✅ Validação inicial aprovada:', text.length, 'caracteres')
    const result = {
      approved: true,
      qualityScore: 100
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Valida intenção classificada
   */
  async validateIntent(intentResult) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO DE INTENÇÃO ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      intent: intentResult?.intent,
      confidence: intentResult?.confidence,
      hasIntent: !!intentResult?.intent,
      hasConfidence: intentResult?.confidence !== undefined,
      fullIntentResult: JSON.stringify(intentResult, null, 2)
    })
    
    if (!intentResult || !intentResult.intent) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Intenção não identificada')
      const result = {
        approved: false,
        reason: 'Intenção não identificada',
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    if (intentResult.confidence < 0.5) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Confiança muito baixa', intentResult.confidence, '(mínimo: 0.5)')
      const result = {
        approved: false,
        reason: 'Confiança na classificação muito baixa',
        qualityScore: intentResult.confidence * 100
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    const qualityScore = intentResult.confidence * 100
    console.log('[ORDX:SupervisorAgent] ✅ Validação de intenção aprovada:', {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      qualityScore: qualityScore.toFixed(1)
    })
    const result = {
      approved: true,
      qualityScore: qualityScore
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Valida verificação de permissões
   */
  async validatePermission(permissionResult) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO DE PERMISSÃO ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      hasPermissionResult: !!permissionResult,
      allowed: permissionResult?.allowed,
      reason: permissionResult?.reason,
      userRole: permissionResult?.userRole,
      isCompanyAdmin: permissionResult?.isCompanyAdmin,
      fullResult: JSON.stringify(permissionResult, null, 2)
    })
    
    if (!permissionResult || typeof permissionResult.allowed !== 'boolean') {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Resultado de permissão inválido')
      const result = {
        approved: false,
        reason: 'Verificação de permissão inválida',
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    const qualityScore = permissionResult.allowed ? 100 : 0
    console.log('[ORDX:SupervisorAgent] 📊 Análise:', {
      allowed: permissionResult.allowed,
      qualityScore: qualityScore,
      reason: permissionResult.reason || 'N/A'
    })
    console.log('[ORDX:SupervisorAgent]', permissionResult.allowed ? '✅ Validação de permissão aprovada' : '❌ Permissão negada', 'qualityScore:', qualityScore)
    
    const result = {
      approved: true,
      qualityScore: qualityScore
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Valida contexto coletado
   */
  async validateContext(contextResult) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO DE CONTEXTO ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      hasContextResult: !!contextResult,
      hasUserContext: !!contextResult?.userContext,
      hasPageContext: !!contextResult?.pageContext,
      hasDataContext: !!contextResult?.dataContext,
      userContextKeys: contextResult?.userContext ? Object.keys(contextResult.userContext) : [],
      pageContextKeys: contextResult?.pageContext ? Object.keys(contextResult.pageContext) : [],
      fullContext: JSON.stringify(contextResult, null, 2)
    })
    
    if (!contextResult) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Nenhum contexto fornecido')
      const result = {
        approved: false,
        reason: 'Contexto não coletado',
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    // Verificar se contexto tem dados mínimos
    const hasUserContext = !!contextResult.userContext && Object.keys(contextResult.userContext).length > 0
    const hasPageContext = !!contextResult.pageContext && Object.keys(contextResult.pageContext).length > 0
    const hasDataContext = !!contextResult.dataContext && Object.keys(contextResult.dataContext).length > 0
    const hasData = hasUserContext || hasPageContext || hasDataContext
    
    console.log('[ORDX:SupervisorAgent] 📊 Análise do contexto:', {
      hasUserContext,
      hasPageContext,
      hasDataContext,
      hasData,
      userContextSize: hasUserContext ? Object.keys(contextResult.userContext).length : 0,
      pageContextSize: hasPageContext ? Object.keys(contextResult.pageContext).length : 0
    })
    
    const qualityScore = hasData ? 80 : 40
    console.log('[ORDX:SupervisorAgent]', hasData ? '✅ Validação de contexto aprovada' : '⚠️ Validação de contexto aprovada com avisos', 'qualityScore:', qualityScore)
    
    const result = {
      approved: hasData,
      qualityScore: qualityScore
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Valida resultado de query
   */
  async validateQueryResult(queryResult) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO DE RESULTADO DE QUERY ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      hasQueryResult: !!queryResult,
      success: queryResult?.success,
      hasError: !!queryResult?.error,
      error: queryResult?.error,
      isCount: queryResult?.isCount,
      isAggregate: queryResult?.isAggregate,
      isGrouped: queryResult?.isGrouped,
      isTimeSeries: queryResult?.isTimeSeries,
      hasResults: !!queryResult?.results,
      resultsCount: Array.isArray(queryResult?.results) ? queryResult.results.length : 'N/A',
      hasSummary: !!queryResult?.summary,
      summary: queryResult?.summary?.substring(0, 200),
      fullResult: JSON.stringify(queryResult, null, 2)
    })
    
    if (!queryResult) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Resultado de query vazio')
      const result = {
        approved: false,
        reason: 'Resultado de query vazio',
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    if (queryResult.error) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Erro no resultado:', queryResult.error)
      const result = {
        approved: false,
        reason: queryResult.error,
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    // Consultas de contagem são válidas mesmo sem array de resultados
    if (queryResult.isCount) {
      console.log('[ORDX:SupervisorAgent] ✅ Validação aprovada: Consulta de contagem detectada')
      const result = {
        approved: true,
        qualityScore: 90,
        reason: 'Consulta de contagem válida'
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    // Verificar se resultados têm dados
    const hasResults = queryResult.results && (
      Array.isArray(queryResult.results) ? queryResult.results.length > 0 : true
    )

    // Aceitar se tiver resultados OU summary (para casos como contagem)
    const hasSummary = queryResult.summary && queryResult.summary.trim().length > 0
    const qualityScore = hasResults ? 90 : (hasSummary ? 70 : 50)
    const reason = hasResults ? 'Resultados encontrados' : (hasSummary ? 'Summary disponível' : 'Resultado válido')
    
    console.log('[ORDX:SupervisorAgent] 📊 Análise:', {
      hasResults,
      resultsCount: Array.isArray(queryResult.results) ? queryResult.results.length : 'N/A',
      hasSummary,
      summaryLength: queryResult.summary?.length || 0,
      qualityScore,
      reason
    })
    
    console.log('[ORDX:SupervisorAgent] ✅ Validação de query aprovada:', reason, 'qualityScore:', qualityScore)
    
    const result = {
      approved: hasResults || hasSummary || queryResult.success,
      qualityScore: qualityScore,
      reason: reason
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Valida resultado de ação
   */
  async validateActionResult(actionResult) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO DE RESULTADO DE AÇÃO ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      hasActionResult: !!actionResult,
      success: actionResult?.success,
      hasError: !!actionResult?.error,
      error: actionResult?.error,
      hasData: !!actionResult?.data,
      dataType: actionResult?.data ? (Array.isArray(actionResult.data) ? 'array' : typeof actionResult.data) : 'N/A',
      dataLength: Array.isArray(actionResult?.data) ? actionResult.data.length : 'N/A',
      hasResults: !!actionResult?.results,
      resultsCount: Array.isArray(actionResult?.results) ? actionResult.results.length : 'N/A',
      fullResult: JSON.stringify(actionResult, null, 2)
    })
    
    if (!actionResult) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Resultado de ação vazio')
      const result = {
        approved: false,
        reason: 'Resultado de ação vazio',
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    if (actionResult.error) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Erro no resultado:', actionResult.error)
      const result = {
        approved: false,
        reason: actionResult.error,
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    const qualityScore = actionResult.success ? 90 : 50
    console.log('[ORDX:SupervisorAgent] 📊 Análise:', {
      success: actionResult.success,
      qualityScore,
      hasData: !!actionResult.data,
      hasResults: !!actionResult.results
    })
    console.log('[ORDX:SupervisorAgent]', actionResult.success ? '✅ Validação de ação aprovada' : '⚠️ Validação de ação aprovada com avisos', 'qualityScore:', qualityScore)
    
    const result = {
      approved: actionResult.success !== false,
      qualityScore: qualityScore
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Valida visualizações geradas
   */
  async validateVisualizations(visualizations) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO DE VISUALIZAÇÕES ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      hasVisualizations: !!visualizations,
      isArray: Array.isArray(visualizations),
      count: visualizations?.length || 0,
      types: visualizations?.map(v => v.type) || [],
      fullVisualizations: JSON.stringify(visualizations, null, 2)
    })
    
    if (!visualizations || !Array.isArray(visualizations)) {
      console.log('[ORDX:SupervisorAgent] ❌ Validação falhou: Formato inválido (não é array)')
      const result = {
        approved: false,
        reason: 'Visualizações inválidas',
        qualityScore: 0
      }
      console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    // Verificar se cada visualização tem estrutura válida
    console.log('[ORDX:SupervisorAgent] 🔍 Validando cada visualização...')
    const validationDetails = visualizations.map((viz, index) => {
      const hasType = !!viz.type
      const hasData = !!viz.data
      const hasConfig = !!viz.config
      const isValid = hasType && (hasData || hasConfig)
      
      console.log(`[ORDX:SupervisorAgent]   Visualização ${index + 1}:`, {
        type: viz.type,
        hasType,
        hasData,
        hasConfig,
        isValid
      })
      
      return { index, isValid, hasType, hasData, hasConfig }
    })
    
    const validViz = visualizations.every(viz => 
      viz.type && (viz.data || viz.config)
    )
    
    const invalidCount = validationDetails.filter(v => !v.isValid).length
    console.log('[ORDX:SupervisorAgent] 📊 Análise:', {
      total: visualizations.length,
      valid: visualizations.length - invalidCount,
      invalid: invalidCount,
      validViz,
      qualityScore: validViz ? 85 : 40
    })

    const qualityScore = validViz ? 85 : 40
    console.log('[ORDX:SupervisorAgent]', validViz ? '✅ Validação de visualizações aprovada' : '⚠️ Validação de visualizações aprovada com avisos', 'qualityScore:', qualityScore)
    
    const result = {
      approved: validViz,
      qualityScore: qualityScore
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Validação final (pós-processamento)
   */
  async validateFinal(finalData) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== VALIDAÇÃO FINAL ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      hasFeedback: !!finalData.feedback,
      feedbackText: finalData.feedback?.text?.substring(0, 200),
      hasOriginalText: !!finalData.originalText,
      originalText: finalData.originalText?.substring(0, 200),
      hasActionResult: !!finalData.actionResult,
      actionResultSuccess: finalData.actionResult?.success,
      hasVisualizations: !!finalData.visualizations,
      visualizationsCount: finalData.visualizations?.length || 0,
      hasIntent: !!finalData.intent,
      fullData: JSON.stringify(finalData, null, 2)
    })
    
    const scores = []
    
    // Verificar se resposta existe
    console.log('[ORDX:SupervisorAgent] 📊 Calculando score de feedback...')
    if (finalData.feedback && finalData.feedback.text) {
      scores.push(80)
      console.log('[ORDX:SupervisorAgent]   ✅ Feedback presente: +80 pontos')
    } else {
      scores.push(0)
      console.log('[ORDX:SupervisorAgent]   ❌ Feedback ausente: +0 pontos')
    }

    // Verificar se resposta responde à pergunta original
    console.log('[ORDX:SupervisorAgent] 📊 Calculando score de relevância...')
    if (finalData.feedback && finalData.originalText) {
      const relevance = this.calculateRelevance(
        finalData.originalText,
        finalData.feedback.text,
        finalData.actionResult
      )
      scores.push(relevance)
      console.log('[ORDX:SupervisorAgent]   📊 Relevância calculada:', relevance.toFixed(1), 'pontos')
    } else {
      // Se não tiver feedback mas tiver actionResult com summary, considerar relevante
      if (finalData.actionResult && finalData.actionResult.summary) {
        scores.push(70)
        console.log('[ORDX:SupervisorAgent]   ✅ ActionResult com summary: +70 pontos')
      } else {
        scores.push(50)
        console.log('[ORDX:SupervisorAgent]   ⚠️ Sem feedback nem summary: +50 pontos')
      }
    }

    // Verificar completude
    console.log('[ORDX:SupervisorAgent] 📊 Calculando score de completude...')
    const completeness = this.calculateCompleteness(finalData)
    scores.push(completeness)
    console.log('[ORDX:SupervisorAgent]   📊 Completude calculada:', completeness.toFixed(1), 'pontos')

    const qualityScore = scores.reduce((a, b) => a + b, 0) / scores.length
    console.log('[ORDX:SupervisorAgent] 📊 Scores individuais:', scores)
    console.log('[ORDX:SupervisorAgent] 📊 Quality Score final:', qualityScore.toFixed(1))

    // Para consultas de contagem, ser mais tolerante
    const isCountQuery = finalData.actionResult?.isCount || finalData.actionResult?.isAggregate || finalData.actionResult?.isTimeSeries || finalData.actionResult?.isGrouped
    const threshold = isCountQuery ? 50 : 70
    console.log('[ORDX:SupervisorAgent] 📊 Threshold:', threshold, '(isCountQuery:', isCountQuery, ')')

    const approved = qualityScore >= threshold
    const issues = qualityScore < threshold ? ['Qualidade abaixo do threshold'] : []
    
    console.log('[ORDX:SupervisorAgent]', approved ? '✅ Validação final aprovada' : '❌ Validação final reprovada', {
      qualityScore: qualityScore.toFixed(1),
      threshold,
      approved,
      issues
    })
    
    const result = {
      approved,
      qualityScore,
      issues,
      corrections: []
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Calcula relevância entre pergunta e resposta
   * Detecta respostas técnicas, genéricas ou inadequadas
   */
  calculateRelevance(question, answer, actionResult = null) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== CALCULANDO RELEVÂNCIA ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      question: question?.substring(0, 200),
      answer: answer?.substring(0, 200),
      hasActionResult: !!actionResult,
      actionResultError: actionResult?.error
    })
    
    if (!question || !answer) {
      console.log('[ORDX:SupervisorAgent] ⚠️ Pergunta ou resposta vazia, retornando 0')
      return 0
    }
    
    const lowerQuestion = question.toLowerCase()
    const lowerAnswer = answer.toLowerCase()
    
    // ========== DETECÇÃO DE RESPOSTAS TÉCNICAS/INADEQUADAS ==========
    console.log('[ORDX:SupervisorAgent] 🔍 Verificando se a resposta é técnica ou inadequada...')
    
    // Termos técnicos que indicam resposta inadequada
    const technicalTerms = [
      'consulta', 'query', 'agrupamento', 'agregação', 'agregado',
      'embeddings', 'rpc', 'sql', 'função rpc', 'busca semântica',
      'utilizando embeddings', 'através de', 'usando', 'via',
      'deve contar', 'deve identificar', 'deve buscar', 'deve selecionar',
      'permitindo visualizar', 'irá utilizar', 'correspondem à descrição',
      'executar', 'retornar', 'filtrar', 'ordenar'
    ]
    
    const foundTechnicalTerms = technicalTerms.filter(term => lowerAnswer.includes(term))
    if (foundTechnicalTerms.length > 0) {
      console.error('[ORDX:SupervisorAgent] ❌ ========== RESPOSTA TÉCNICA DETECTADA ==========')
      console.error('[ORDX:SupervisorAgent] ❌ A resposta contém termos técnicos:', foundTechnicalTerms)
      console.error('[ORDX:SupervisorAgent] ❌ Resposta atual:', answer.substring(0, 300))
      console.error('[ORDX:SupervisorAgent] ❌ Pergunta original:', question.substring(0, 300))
      console.error('[ORDX:SupervisorAgent] ❌ PROBLEMA: A IA está retornando descrições técnicas ao invés de interpretar os dados')
      console.error('[ORDX:SupervisorAgent] ❌ AÇÃO NECESSÁRIA: O FeedbackAgent deve usar IA para gerar respostas interpretadas')
      // Penalizar severamente respostas técnicas
      const technicalPenalty = Math.max(0, 30 - (foundTechnicalTerms.length * 10))
      console.log('[ORDX:SupervisorAgent] 📊 Penalidade por termos técnicos:', technicalPenalty, 'pontos')
      return technicalPenalty
    }
    
    // Detectar respostas que são apenas descrições de processo
    const processDescriptions = [
      'a consulta busca', 'a consulta deve', 'a consulta irá',
      'esta consulta', 'selecionar empresas', 'buscar empresas',
      'contar o número', 'agrupar os resultados'
    ]
    
    const isProcessDescription = processDescriptions.some(pd => lowerAnswer.startsWith(pd))
    if (isProcessDescription) {
      console.error('[ORDX:SupervisorAgent] ❌ ========== RESPOSTA É DESCRIÇÃO DE PROCESSO ==========')
      console.error('[ORDX:SupervisorAgent] ❌ A resposta está descrevendo o processo ao invés de responder à pergunta')
      console.error('[ORDX:SupervisorAgent] ❌ Resposta atual:', answer.substring(0, 300))
      console.error('[ORDX:SupervisorAgent] ❌ Pergunta original:', question.substring(0, 300))
      console.error('[ORDX:SupervisorAgent] ❌ PROBLEMA: A resposta não interpreta os dados obtidos')
      return 20
    }
    
    // Detectar respostas genéricas que não respondem à pergunta
    const genericResponses = [
      'encontrei', 'encontrados', 'resultados', 'resultado',
      'dados encontrados', 'busca realizada', 'consulta realizada'
    ]
    const isGenericResponse = genericResponses.some(gr => 
      lowerAnswer.includes(gr) && 
      !lowerAnswer.includes('sim') && 
      !lowerAnswer.includes('não') && 
      !lowerAnswer.includes('empresa') &&
      !lowerAnswer.includes('setor') &&
      !lowerAnswer.includes('colaborador')
    )
    
    if (isGenericResponse && (lowerQuestion.includes('existem') || lowerQuestion.includes('tem') || lowerQuestion.includes('têm') || lowerQuestion.includes('quais'))) {
      console.error('[ORDX:SupervisorAgent] ❌ ========== RESPOSTA GENÉRICA DETECTADA ==========')
      console.error('[ORDX:SupervisorAgent] ❌ A resposta é muito genérica e não responde à pergunta específica')
      console.error('[ORDX:SupervisorAgent] ❌ Resposta atual:', answer.substring(0, 300))
      console.error('[ORDX:SupervisorAgent] ❌ Pergunta original:', question.substring(0, 300))
      console.error('[ORDX:SupervisorAgent] ❌ PROBLEMA: A resposta não fornece informações específicas solicitadas')
      return 20
    }
    
    // Verificar se a resposta responde diretamente à pergunta
    const questionWords = lowerQuestion.split(/\s+/).filter(w => w.length > 2)
    const answerWords = lowerAnswer.split(/\s+/).filter(w => w.length > 2)
    const commonWords = questionWords.filter(w => answerWords.includes(w))
    const wordOverlap = questionWords.length > 0 ? (commonWords.length / questionWords.length) : 0
    
    if (wordOverlap < 0.1) {
      console.error('[ORDX:SupervisorAgent] ❌ ========== RESPOSTA NÃO RELACIONADA À PERGUNTA ==========')
      console.error('[ORDX:SupervisorAgent] ❌ Pouca sobreposição de palavras entre pergunta e resposta')
      console.error('[ORDX:SupervisorAgent] ❌ Sobreposição:', (wordOverlap * 100).toFixed(1) + '%')
      console.error('[ORDX:SupervisorAgent] ❌ Resposta atual:', answer.substring(0, 300))
      console.error('[ORDX:SupervisorAgent] ❌ Pergunta original:', question.substring(0, 300))
      return 15
    }
    
    // ========== CÁLCULO DE RELEVÂNCIA NORMAL ==========
    
    // Detectar palavras-chave importantes na pergunta
    const questionKeywords = []
    if (lowerQuestion.includes('existem')) questionKeywords.push('existem')
    if (lowerQuestion.includes('empresa')) questionKeywords.push('empresa')
    if (lowerQuestion.includes('colaborador') || lowerQuestion.includes('funcionário')) questionKeywords.push('colaborador')
    if (lowerQuestion.includes('sem')) questionKeywords.push('sem')
    if (lowerQuestion.includes('média')) questionKeywords.push('média')
    if (lowerQuestion.includes('quantas') || lowerQuestion.includes('quantos')) questionKeywords.push('quantidade')
    if (lowerQuestion.includes('setor') || lowerQuestion.includes('setores')) questionKeywords.push('setor')
    if (lowerQuestion.includes('crescimento') || lowerQuestion.includes('crescendo')) questionKeywords.push('crescimento')
    if (lowerQuestion.includes('estagnando') || lowerQuestion.includes('estagnação')) questionKeywords.push('estagnação')
    if (lowerQuestion.includes('compare') || lowerQuestion.includes('comparar')) questionKeywords.push('comparação')
    if (lowerQuestion.includes('semestre') || lowerQuestion.includes('período')) questionKeywords.push('período')
    
    console.log('[ORDX:SupervisorAgent] 📊 Palavras-chave na pergunta:', questionKeywords)
    
    // Verificar se a resposta contém palavras-chave relevantes
    const relevantKeywordsInAnswer = questionKeywords.filter(kw => lowerAnswer.includes(kw))
    const keywordRelevance = questionKeywords.length > 0 
      ? (relevantKeywordsInAnswer.length / questionKeywords.length) * 100 
      : 50
    
    console.log('[ORDX:SupervisorAgent] 📊 Relevância de palavras-chave:', {
      totalKeywords: questionKeywords.length,
      foundKeywords: relevantKeywordsInAnswer.length,
      foundKeywordsList: relevantKeywordsInAnswer,
      keywordRelevance: keywordRelevance.toFixed(1)
    })
    
    // Verificar palavras comuns
    const filteredQuestionWords = lowerQuestion.split(/\s+/).filter(w => w.length > 3)
    const filteredAnswerWords = lowerAnswer.split(/\s+/).filter(w => w.length > 3)
    const commonFilteredWords = filteredQuestionWords.filter(w => filteredAnswerWords.includes(w))
    const wordRelevance = filteredQuestionWords.length > 0 
      ? (commonFilteredWords.length / filteredQuestionWords.length) * 100 
      : 50
    
    console.log('[ORDX:SupervisorAgent] 📊 Relevância de palavras comuns:', {
      questionWords: filteredQuestionWords.length,
      commonWords: commonFilteredWords.length,
      commonWordsList: commonFilteredWords.slice(0, 5),
      wordRelevance: wordRelevance.toFixed(1)
    })
    
    // Combinar relevância de palavras-chave e palavras comuns
    const finalRelevance = Math.min(100, (keywordRelevance * 0.6 + wordRelevance * 0.4))
    console.log('[ORDX:SupervisorAgent] ✅ Relevância final calculada:', finalRelevance.toFixed(1))
    
    // Log de alerta se relevância for baixa
    if (finalRelevance < 50) {
      console.warn('[ORDX:SupervisorAgent] ⚠️ ========== ALERTA: RELEVÂNCIA BAIXA ==========')
      console.warn('[ORDX:SupervisorAgent] ⚠️ A resposta pode não estar respondendo adequadamente à pergunta')
      console.warn('[ORDX:SupervisorAgent] ⚠️ Relevância:', finalRelevance.toFixed(1) + '%')
      console.warn('[ORDX:SupervisorAgent] ⚠️ Pergunta:', question.substring(0, 200))
      console.warn('[ORDX:SupervisorAgent] ⚠️ Resposta:', answer.substring(0, 200))
    }
    
    return finalRelevance
  }

  /**
   * Calcula completude da resposta
   */
  calculateCompleteness(data) {
    console.log('[ORDX:SupervisorAgent] 🔍 ========== CALCULANDO COMPLETUDE ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      hasFeedback: !!data.feedback,
      hasVisualizations: !!data.visualizations,
      visualizationsCount: data.visualizations?.length || 0,
      hasActionResult: !!data.actionResult,
      hasIntent: !!data.intent
    })
    
    let score = 0
    const scoreBreakdown = {}
    
    if (data.feedback) {
      score += 30
      scoreBreakdown.feedback = 30
      console.log('[ORDX:SupervisorAgent]   ✅ Feedback presente: +30 pontos')
    } else {
      scoreBreakdown.feedback = 0
      console.log('[ORDX:SupervisorAgent]   ❌ Feedback ausente: +0 pontos')
    }
    
    if (data.visualizations && data.visualizations.length > 0) {
      score += 30
      scoreBreakdown.visualizations = 30
      console.log('[ORDX:SupervisorAgent]   ✅ Visualizações presentes:', data.visualizations.length, '+30 pontos')
    } else {
      scoreBreakdown.visualizations = 0
      console.log('[ORDX:SupervisorAgent]   ❌ Visualizações ausentes: +0 pontos')
    }
    
    if (data.actionResult) {
      score += 20
      scoreBreakdown.actionResult = 20
      console.log('[ORDX:SupervisorAgent]   ✅ ActionResult presente: +20 pontos')
    } else {
      scoreBreakdown.actionResult = 0
      console.log('[ORDX:SupervisorAgent]   ❌ ActionResult ausente: +0 pontos')
    }
    
    if (data.intent) {
      score += 20
      scoreBreakdown.intent = 20
      console.log('[ORDX:SupervisorAgent]   ✅ Intent presente: +20 pontos')
    } else {
      scoreBreakdown.intent = 0
      console.log('[ORDX:SupervisorAgent]   ❌ Intent ausente: +0 pontos')
    }
    
    console.log('[ORDX:SupervisorAgent] 📊 Score breakdown:', scoreBreakdown)
    console.log('[ORDX:SupervisorAgent] ✅ Completude final:', score)
    return score
  }

  /**
   * Tenta corrigir erros detectados
   */
  async attemptCorrection(validationResult) {
    console.log('[ORDX:SupervisorAgent] 🔧 ========== TENTANDO CORREÇÃO ==========')
    console.log('[ORDX:SupervisorAgent] 📝 Input:', {
      approved: validationResult?.approved,
      qualityScore: validationResult?.qualityScore,
      issues: validationResult?.issues,
      hasCorrections: !!validationResult?.corrections,
      fullResult: JSON.stringify(validationResult, null, 2)
    })
    
    // Adicionar ao histórico de correções
    this.correctionHistory.push({
      timestamp: new Date(),
      validationResult: validationResult
    })
    console.log('[ORDX:SupervisorAgent] 📚 Histórico de correções atualizado:', this.correctionHistory.length, 'tentativas')
    
    // Por enquanto, retorna erro
    // Pode ser expandido para tentar correções automáticas
    console.log('[ORDX:SupervisorAgent] ⚠️ Correção automática não implementada ainda')
    const result = {
      success: false,
      result: null,
      reason: 'Correção automática não implementada'
    }
    console.log('[ORDX:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }
}

