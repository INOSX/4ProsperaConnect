/**
 * FeedbackAgent - Gera respostas textuais para o usuário
 */
export default class FeedbackAgent {
  async generateFeedback(originalText, actionResult, visualizations, intentResult) {
    console.log('[BMAD:FeedbackAgent] 💬 Generating feedback for intent:', intentResult?.intent)
    let text = ''

    if (!actionResult || !actionResult.success) {
      text = actionResult?.error || 'Não foi possível processar sua solicitação.'
      console.log('[BMAD:FeedbackAgent] ❌ Action failed, returning error feedback:', text)
      return {
        text,
        voiceConfig: {
          speed: 1.0,
          pitch: 1.0
        },
        visualizations: []
      }
    }

    // Gerar resposta baseada no tipo de ação
    const intent = intentResult.intent

    if (intent === 'query_database' || intent === 'search_data') {
      // Verificar se é uma consulta de contagem
      if (actionResult.isCount && actionResult.results && actionResult.results.length > 0) {
        const countResult = actionResult.results[0]
        if (countResult.count !== undefined) {
          text = actionResult.summary || `Total: ${countResult.count} ${countResult.label || 'registros'}.`
        } else {
          text = actionResult.summary || `Encontrei ${actionResult.results.length} resultado${actionResult.results.length !== 1 ? 's' : ''}.`
        }
      } else if (actionResult.isAggregate && actionResult.summary) {
        // Consultas agregadas (média, etc)
        text = actionResult.summary
      } else if (actionResult.isTimeSeries && actionResult.summary) {
        // Consultas temporais (gráficos)
        text = actionResult.summary
      } else {
        const count = actionResult.results?.length || 0
        text = `Encontrei ${count} resultado${count !== 1 ? 's' : ''}.`
        if (actionResult.summary) {
          text += ` ${actionResult.summary}`
        }
      }
    } else if (intent.startsWith('create_')) {
      const entity = intent.split('_')[1]
      text = `${this.capitalize(entity)} criado${entity.endsWith('a') ? 'a' : ''} com sucesso!`
    } else if (intent.startsWith('list_')) {
      const entity = intent.split('_')[1]
      const count = actionResult.data?.length || 0
      text = `Encontrei ${count} ${entity}${count !== 1 ? 's' : ''}.`
    } else if (intent.startsWith('update_')) {
      const entity = intent.split('_')[1]
      text = `${this.capitalize(entity)} atualizado${entity.endsWith('a') ? 'a' : ''} com sucesso!`
    } else if (intent.startsWith('delete_')) {
      const entity = intent.split('_')[1]
      text = `${this.capitalize(entity)} removido${entity.endsWith('a') ? 'a' : ''} com sucesso!`
    } else {
      text = 'Ação executada com sucesso!'
    }

    console.log('[BMAD:FeedbackAgent] ✅ Feedback generated:', text?.substring(0, 100))
    return {
      text,
      voiceConfig: {
        speed: 1.0,
        pitch: 1.0
      },
      visualizations: visualizations || []
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

