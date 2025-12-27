/**
 * FeedbackAgent - Gera respostas textuais para o usuário
 */
export default class FeedbackAgent {
  async generateFeedback(originalText, actionResult, visualizations, intentResult) {
    let text = ''

    if (!actionResult || !actionResult.success) {
      text = actionResult?.error || 'Não foi possível processar sua solicitação.'
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
      const count = actionResult.results?.length || 0
      text = `Encontrei ${count} resultado${count !== 1 ? 's' : ''}.`
      if (actionResult.summary) {
        text += ` ${actionResult.summary}`
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

