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
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        approved: false,
        reason: 'Texto vazio ou inválido',
        qualityScore: 0
      }
    }

    if (text.length > 1000) {
      return {
        approved: false,
        reason: 'Texto muito longo (máximo 1000 caracteres)',
        qualityScore: 50
      }
    }

    return {
      approved: true,
      qualityScore: 100
    }
  }

  /**
   * Valida intenção classificada
   */
  async validateIntent(intentResult) {
    if (!intentResult || !intentResult.intent) {
      return {
        approved: false,
        reason: 'Intenção não identificada',
        qualityScore: 0
      }
    }

    if (intentResult.confidence < 0.5) {
      return {
        approved: false,
        reason: 'Confiança na classificação muito baixa',
        qualityScore: intentResult.confidence * 100
      }
    }

    return {
      approved: true,
      qualityScore: intentResult.confidence * 100
    }
  }

  /**
   * Valida verificação de permissões
   */
  async validatePermission(permissionResult) {
    if (!permissionResult || typeof permissionResult.allowed !== 'boolean') {
      return {
        approved: false,
        reason: 'Verificação de permissão inválida',
        qualityScore: 0
      }
    }

    return {
      approved: true,
      qualityScore: permissionResult.allowed ? 100 : 0
    }
  }

  /**
   * Valida contexto coletado
   */
  async validateContext(contextResult) {
    if (!contextResult) {
      return {
        approved: false,
        reason: 'Contexto não coletado',
        qualityScore: 0
      }
    }

    // Verificar se contexto tem dados mínimos
    const hasData = contextResult.userContext || contextResult.pageContext || contextResult.dataContext
    return {
      approved: hasData,
      qualityScore: hasData ? 80 : 40
    }
  }

  /**
   * Valida resultado de query
   */
  async validateQueryResult(queryResult) {
    if (!queryResult) {
      return {
        approved: false,
        reason: 'Resultado de query vazio',
        qualityScore: 0
      }
    }

    if (queryResult.error) {
      return {
        approved: false,
        reason: queryResult.error,
        qualityScore: 0
      }
    }

    // Consultas de contagem são válidas mesmo sem array de resultados
    if (queryResult.isCount) {
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

    return {
      approved: hasResults || hasSummary || queryResult.success,
      qualityScore: hasResults ? 90 : (hasSummary ? 70 : 50),
      reason: hasResults ? 'Resultados encontrados' : (hasSummary ? 'Summary disponível' : 'Resultado válido')
    }
  }

  /**
   * Valida resultado de ação
   */
  async validateActionResult(actionResult) {
    if (!actionResult) {
      return {
        approved: false,
        reason: 'Resultado de ação vazio',
        qualityScore: 0
      }
    }

    if (actionResult.error) {
      return {
        approved: false,
        reason: actionResult.error,
        qualityScore: 0
      }
    }

    return {
      approved: actionResult.success !== false,
      qualityScore: actionResult.success ? 90 : 50
    }
  }

  /**
   * Valida visualizações geradas
   */
  async validateVisualizations(visualizations) {
    if (!visualizations || !Array.isArray(visualizations)) {
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

    return {
      approved: validViz,
      qualityScore: validViz ? 85 : 40
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
    // Implementação simples - pode ser melhorada com NLP
    const questionWords = question.toLowerCase().split(/\s+/)
    const answerWords = answer.toLowerCase().split(/\s+/)
    const commonWords = questionWords.filter(w => answerWords.includes(w))
    return Math.min(100, (commonWords.length / questionWords.length) * 100)
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

