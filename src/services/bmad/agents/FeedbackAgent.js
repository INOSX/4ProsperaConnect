/**
 * FeedbackAgent - Gera respostas textuais para o usuário
 */
export default class FeedbackAgent {
  async generateFeedback(originalText, actionResult, visualizations, intentResult) {
    console.log('[BMAD:FeedbackAgent] 💬 ========== GERANDO FEEDBACK ==========')
    console.log('[BMAD:FeedbackAgent] 📝 Input:', {
      originalText: originalText?.substring(0, 100),
      intent: intentResult?.intent,
      hasActionResult: !!actionResult,
      actionResultSuccess: actionResult?.success,
      visualizationsCount: visualizations?.length || 0
    })
    
    let text = ''

    if (!actionResult || !actionResult.success) {
      text = actionResult?.error || 'Não foi possível processar sua solicitação.'
      console.log('[BMAD:FeedbackAgent] ❌ Ação falhou, retornando feedback de erro:', text)
      const errorFeedback = {
        text,
        voiceConfig: {
          speed: 1.0,
          pitch: 1.0
        },
        visualizations: []
      }
      console.log('[BMAD:FeedbackAgent] 📤 Feedback de erro:', JSON.stringify(errorFeedback, null, 2))
      return errorFeedback
    }
    
    console.log('[BMAD:FeedbackAgent] ✅ Ação bem-sucedida, gerando feedback positivo...')

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

    const finalFeedback = {
      text,
      voiceConfig: {
        speed: 1.0,
        pitch: 1.0
      },
      visualizations: visualizations || []
    }
    
    console.log('[BMAD:FeedbackAgent] ✅ ========== FEEDBACK GERADO COM SUCESSO ==========')
    console.log('[BMAD:FeedbackAgent] 📤 Feedback completo:', {
      text: text?.substring(0, 200),
      textLength: text?.length || 0,
      voiceConfig: finalFeedback.voiceConfig,
      visualizationsCount: finalFeedback.visualizations.length
    })
    console.log('[BMAD:FeedbackAgent] 📋 Feedback JSON:', JSON.stringify(finalFeedback, null, 2))
    
    return finalFeedback
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

