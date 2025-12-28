/**
 * SupervisorAgent - Agente supervisor que monitora e valida todas as ações
 * Garante qualidade e consistência em todas as etapas do fluxo BMAD
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
    console.log('[BMAD:SupervisorAgent] 🔍 ========== VALIDAÇÃO INICIAL ==========')
    console.log('[BMAD:SupervisorAgent] 📝 Input:', {
      text: text?.substring(0, 100),
      textLength: text?.length || 0,
      textType: typeof text,
      isEmpty: !text || text.trim().length === 0
    })
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log('[BMAD:SupervisorAgent] ❌ Validação falhou: Texto vazio ou inválido')
      const result = {
        approved: false,
        reason: 'Texto vazio ou inválido',
        qualityScore: 0
      }
      console.log('[BMAD:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    if (text.length > 1000) {
      console.log('[BMAD:SupervisorAgent] ❌ Validação falhou: Texto muito longo', text.length, 'caracteres (máximo: 1000)')
      const result = {
        approved: false,
        reason: 'Texto muito longo (máximo 1000 caracteres)',
        qualityScore: 50
      }
      console.log('[BMAD:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    console.log('[BMAD:SupervisorAgent] ✅ Validação inicial aprovada:', text.length, 'caracteres')
    const result = {
      approved: true,
      qualityScore: 100
    }
    console.log('[BMAD:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Valida intenção classificada
   */
  async validateIntent(intentResult) {
    console.log('[BMAD:SupervisorAgent] 🔍 ========== VALIDAÇÃO DE INTENÇÃO ==========')
    console.log('[BMAD:SupervisorAgent] 📝 Input:', {
      intent: intentResult?.intent,
      confidence: intentResult?.confidence,
      hasIntent: !!intentResult?.intent,
      hasConfidence: intentResult?.confidence !== undefined,
      fullIntentResult: JSON.stringify(intentResult, null, 2)
    })
    
    if (!intentResult || !intentResult.intent) {
      console.log('[BMAD:SupervisorAgent] ❌ Validação falhou: Intenção não identificada')
      const result = {
        approved: false,
        reason: 'Intenção não identificada',
        qualityScore: 0
      }
      console.log('[BMAD:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    if (intentResult.confidence < 0.5) {
      console.log('[BMAD:SupervisorAgent] ❌ Validação falhou: Confiança muito baixa', intentResult.confidence, '(mínimo: 0.5)')
      const result = {
        approved: false,
        reason: 'Confiança na classificação muito baixa',
        qualityScore: intentResult.confidence * 100
      }
      console.log('[BMAD:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    const qualityScore = intentResult.confidence * 100
    console.log('[BMAD:SupervisorAgent] ✅ Validação de intenção aprovada:', {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      qualityScore: qualityScore.toFixed(1)
    })
    const result = {
      approved: true,
      qualityScore: qualityScore
    }
    console.log('[BMAD:SupervisorAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Valida verificação de permissões
   */
  async validatePermission(permissionResult) {
    console.log('[BMAD:SupervisorAgent] 🔍 Validating permission result:', permissionResult?.allowed)
    
    if (!permissionResult || typeof permissionResult.allowed !== 'boolean') {
      console.log('[BMAD:SupervisorAgent] ❌ Permission validation failed: Invalid result')
      return {
        approved: false,
        reason: 'Verificação de permissão inválida',
        qualityScore: 0
      }
    }

    const qualityScore = permissionResult.allowed ? 100 : 0
    console.log('[BMAD:SupervisorAgent]', permissionResult.allowed ? '✅ Permission validation passed' : '❌ Permission denied', 'qualityScore:', qualityScore)
    return {
      approved: true,
      qualityScore: qualityScore
    }
  }

  /**
   * Valida contexto coletado
   */
  async validateContext(contextResult) {
    console.log('[BMAD:SupervisorAgent] 🔍 Validating context...')
    
    if (!contextResult) {
      console.log('[BMAD:SupervisorAgent] ❌ Context validation failed: No context provided')
      return {
        approved: false,
        reason: 'Contexto não coletado',
        qualityScore: 0
      }
    }

    // Verificar se contexto tem dados mínimos
    const hasData = contextResult.userContext || contextResult.pageContext || contextResult.dataContext
    const qualityScore = hasData ? 80 : 40
    console.log('[BMAD:SupervisorAgent]', hasData ? '✅ Context validation passed' : '⚠️ Context validation passed with warnings', 'qualityScore:', qualityScore)
    return {
      approved: hasData,
      qualityScore: qualityScore
    }
  }

  /**
   * Valida resultado de query
   */
  async validateQueryResult(queryResult) {
    console.log('[BMAD:SupervisorAgent] 🔍 Validating query result...')
    
    if (!queryResult) {
      console.log('[BMAD:SupervisorAgent] ❌ Query validation failed: Empty result')
      return {
        approved: false,
        reason: 'Resultado de query vazio',
        qualityScore: 0
      }
    }

    if (queryResult.error) {
      console.log('[BMAD:SupervisorAgent] ❌ Query validation failed:', queryResult.error)
      return {
        approved: false,
        reason: queryResult.error,
        qualityScore: 0
      }
    }

    // Consultas de contagem são válidas mesmo sem array de resultados
    if (queryResult.isCount) {
      console.log('[BMAD:SupervisorAgent] ✅ Query validation passed: Count query, qualityScore: 90')
      return {
        approved: true,
        qualityScore: 90,
        reason: 'Consulta de contagem válida'
      }
    }

    // Verificar se resultados têm dados
    const hasResults = queryResult.results && (
      Array.isArray(queryResult.results) ? queryResult.results.length > 0 : true
    )

    // Aceitar se tiver resultados OU summary (para casos como contagem)
    const hasSummary = queryResult.summary && queryResult.summary.trim().length > 0
    const qualityScore = hasResults ? 90 : (hasSummary ? 70 : 50)
    const reason = hasResults ? 'Resultados encontrados' : (hasSummary ? 'Summary disponível' : 'Resultado válido')
    
    console.log('[BMAD:SupervisorAgent] ✅ Query validation passed:', reason, 'qualityScore:', qualityScore, 'hasResults:', hasResults, 'hasSummary:', hasSummary)
    return {
      approved: hasResults || hasSummary || queryResult.success,
      qualityScore: qualityScore,
      reason: reason
    }
  }

  /**
   * Valida resultado de ação
   */
  async validateActionResult(actionResult) {
    console.log('[BMAD:SupervisorAgent] 🔍 Validating action result...')
    
    if (!actionResult) {
      console.log('[BMAD:SupervisorAgent] ❌ Action validation failed: Empty result')
      return {
        approved: false,
        reason: 'Resultado de ação vazio',
        qualityScore: 0
      }
    }

    if (actionResult.error) {
      console.log('[BMAD:SupervisorAgent] ❌ Action validation failed:', actionResult.error)
      return {
        approved: false,
        reason: actionResult.error,
        qualityScore: 0
      }
    }

    const qualityScore = actionResult.success ? 90 : 50
    console.log('[BMAD:SupervisorAgent]', actionResult.success ? '✅ Action validation passed' : '⚠️ Action validation passed with warnings', 'qualityScore:', qualityScore)
    return {
      approved: actionResult.success !== false,
      qualityScore: qualityScore
    }
  }

  /**
   * Valida visualizações geradas
   */
  async validateVisualizations(visualizations) {
    console.log('[BMAD:SupervisorAgent] 🔍 Validating visualizations:', visualizations?.length || 0)
    
    if (!visualizations || !Array.isArray(visualizations)) {
      console.log('[BMAD:SupervisorAgent] ❌ Visualization validation failed: Invalid format')
      return {
        approved: false,
        reason: 'Visualizações inválidas',
        qualityScore: 0
      }
    }

    // Verificar se cada visualização tem estrutura válida
    const validViz = visualizations.every(viz => 
      viz.type && (viz.data || viz.config)
    )

    const qualityScore = validViz ? 85 : 40
    console.log('[BMAD:SupervisorAgent]', validViz ? '✅ Visualization validation passed' : '⚠️ Visualization validation passed with warnings', 'qualityScore:', qualityScore)
    return {
      approved: validViz,
      qualityScore: qualityScore
    }
  }

  /**
   * Validação final (pós-processamento)
   */
  async validateFinal(finalData) {
    const scores = []
    
    // Verificar se resposta existe
    if (finalData.feedback && finalData.feedback.text) {
      scores.push(80)
    } else {
      scores.push(0)
    }

    // Verificar se resposta responde à pergunta original
    if (finalData.feedback && finalData.originalText) {
      const relevance = this.calculateRelevance(
        finalData.originalText,
        finalData.feedback.text
      )
      scores.push(relevance)
    } else {
      // Se não tiver feedback mas tiver actionResult com summary, considerar relevante
      if (finalData.actionResult && finalData.actionResult.summary) {
        scores.push(70)
      } else {
        scores.push(50)
      }
    }

    // Verificar completude
    const completeness = this.calculateCompleteness(finalData)
    scores.push(completeness)

    const qualityScore = scores.reduce((a, b) => a + b, 0) / scores.length

    // Para consultas de contagem, ser mais tolerante
    const isCountQuery = finalData.actionResult?.isCount
    const threshold = isCountQuery ? 50 : 70

    return {
      approved: qualityScore >= threshold,
      qualityScore,
      issues: qualityScore < threshold ? ['Qualidade abaixo do threshold'] : [],
      corrections: []
    }
  }

  /**
   * Calcula relevância entre pergunta e resposta
   */
  calculateRelevance(question, answer) {
    if (!question || !answer) return 0
    
    const lowerQuestion = question.toLowerCase()
    const lowerAnswer = answer.toLowerCase()
    
    // Detectar respostas genéricas que não respondem à pergunta
    const genericResponses = [
      'encontrei', 'encontrados', 'resultados', 'resultado',
      'dados encontrados', 'busca realizada'
    ]
    const isGenericResponse = genericResponses.some(gr => 
      lowerAnswer.includes(gr) && !lowerAnswer.includes('sim') && !lowerAnswer.includes('não') && !lowerAnswer.includes('empresa')
    )
    
    if (isGenericResponse && (lowerQuestion.includes('existem') || lowerQuestion.includes('tem') || lowerQuestion.includes('têm'))) {
      // Resposta genérica para pergunta específica - baixa relevância
      return 20
    }
    
    // Detectar palavras-chave importantes na pergunta
    const questionKeywords = []
    if (lowerQuestion.includes('existem')) questionKeywords.push('existem')
    if (lowerQuestion.includes('empresa')) questionKeywords.push('empresa')
    if (lowerQuestion.includes('colaborador') || lowerQuestion.includes('funcionário')) questionKeywords.push('colaborador')
    if (lowerQuestion.includes('sem')) questionKeywords.push('sem')
    if (lowerQuestion.includes('média')) questionKeywords.push('média')
    if (lowerQuestion.includes('quantas') || lowerQuestion.includes('quantos')) questionKeywords.push('quantidade')
    
    // Verificar se a resposta contém palavras-chave relevantes
    const relevantKeywordsInAnswer = questionKeywords.filter(kw => lowerAnswer.includes(kw))
    const keywordRelevance = questionKeywords.length > 0 
      ? (relevantKeywordsInAnswer.length / questionKeywords.length) * 100 
      : 50
    
    // Verificar palavras comuns
    const questionWords = lowerQuestion.split(/\s+/).filter(w => w.length > 3)
    const answerWords = lowerAnswer.split(/\s+/).filter(w => w.length > 3)
    const commonWords = questionWords.filter(w => answerWords.includes(w))
    const wordRelevance = questionWords.length > 0 
      ? (commonWords.length / questionWords.length) * 100 
      : 50
    
    // Combinar relevância de palavras-chave e palavras comuns
    return Math.min(100, (keywordRelevance * 0.6 + wordRelevance * 0.4))
  }

  /**
   * Calcula completude da resposta
   */
  calculateCompleteness(data) {
    let score = 0
    if (data.feedback) score += 30
    if (data.visualizations && data.visualizations.length > 0) score += 30
    if (data.actionResult) score += 20
    if (data.intent) score += 20
    return score
  }

  /**
   * Tenta corrigir erros detectados
   */
  async attemptCorrection(validationResult) {
    // Por enquanto, retorna erro
    // Pode ser expandido para tentar correções automáticas
    return {
      success: false,
      result: null
    }
  }
}

