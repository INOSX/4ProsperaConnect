/**
 * FeedbackAgent - Gera respostas textuais interpretadas para o usuário usando IA
 */
export default class FeedbackAgent {
  async generateFeedback(originalText, actionResult, visualizations, intentResult) {
    console.log('[OPX:FeedbackAgent] 💬 ========== GERANDO FEEDBACK ==========')
    console.log('[OPX:FeedbackAgent] 📝 Input:', {
      originalText: originalText?.substring(0, 100),
      intent: intentResult?.intent,
      hasActionResult: !!actionResult,
      actionResultSuccess: actionResult?.success,
      visualizationsCount: visualizations?.length || 0
    })
    
    let text = ''

    if (!actionResult || !actionResult.success) {
      text = actionResult?.error || 'Não foi possível processar sua solicitação.'
      console.log('[OPX:FeedbackAgent] ❌ Ação falhou, retornando feedback de erro:', text)
      const errorFeedback = {
        text,
        voiceConfig: {
          speed: 1.0,
          pitch: 1.0
        },
        visualizations: []
      }
      console.log('[OPX:FeedbackAgent] 📤 Feedback de erro:', JSON.stringify(errorFeedback, null, 2))
      return errorFeedback
    }
    
    console.log('[OPX:FeedbackAgent] ✅ Ação bem-sucedida, gerando feedback interpretado...')

    // Para consultas de banco de dados, usar IA para gerar resposta interpretada
    const intent = intentResult.intent
    if (intent === 'query_database' || intent === 'search_data' || intent === 'get_all_data' || intent === 'know_all_data') {
      console.log('[OPX:FeedbackAgent] 🤖 Gerando resposta interpretada com IA para consulta de banco...')
      try {
        text = await this.generateInterpretedResponse(originalText, actionResult, intentResult)
        console.log('[OPX:FeedbackAgent] ✅ Resposta interpretada gerada pela IA')
      } catch (error) {
        console.error('[OPX:FeedbackAgent] ❌ Erro ao gerar resposta interpretada:', error)
        // Fallback para resposta simples
        text = this.generateSimpleResponse(actionResult, intent)
        console.log('[OPX:FeedbackAgent] ⚠️ Usando resposta simples como fallback')
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
    
    console.log('[OPX:FeedbackAgent] ✅ ========== FEEDBACK GERADO COM SUCESSO ==========')
    console.log('[OPX:FeedbackAgent] 📤 Feedback completo:', {
      text: text?.substring(0, 200),
      textLength: text?.length || 0,
      voiceConfig: finalFeedback.voiceConfig,
      visualizationsCount: finalFeedback.visualizations.length
    })
    console.log('[OPX:FeedbackAgent] 📋 Feedback JSON:', JSON.stringify(finalFeedback, null, 2))
    
    return finalFeedback
  }

  /**
   * Gera resposta interpretada usando OpenAI
   */
  async generateInterpretedResponse(originalQuestion, actionResult, intentResult) {
    console.log('[OPX:FeedbackAgent] 🤖 ========== GERANDO RESPOSTA INTERPRETADA COM IA ==========')
    console.log('[OPX:FeedbackAgent] 📝 Input para IA:', {
      question: originalQuestion?.substring(0, 200),
      hasResults: !!actionResult.results,
      resultsCount: actionResult.results?.length || 0,
      hasSummary: !!actionResult.summary,
      isCount: actionResult.isCount,
      isAggregate: actionResult.isAggregate,
      isTimeSeries: actionResult.isTimeSeries,
      isGrouped: actionResult.isGrouped
    })

    // Preparar dados para o prompt
    const resultsData = actionResult.results || []
    const resultsPreview = resultsData.slice(0, 10).map(r => {
      // Limpar campos técnicos e manter apenas dados relevantes
      const clean = { ...r }
      delete clean['COUNT(*) AS company_count']
      delete clean['DATE_TRUNC(\'month\', created_at) AS month']
      return clean
    })

    const prompt = `Você é um assistente empresarial brasileiro especializado em análise de dados.

PERGUNTA DO USUÁRIO: "${originalQuestion}"

DADOS OBTIDOS:
${JSON.stringify(resultsPreview, null, 2)}

INFORMAÇÕES:
- Total de resultados: ${resultsData.length}
- Tipo: ${actionResult.isCount ? 'Contagem' : actionResult.isAggregate ? 'Agregação' : actionResult.isTimeSeries ? 'Série Temporal' : actionResult.isGrouped ? 'Agrupamento' : 'Lista'}

INSTRUÇÕES CRÍTICAS:
1. Responda APENAS em PORTUGUÊS BRASILEIRO - NUNCA misture inglês
2. Seja EXTREMAMENTE CONCISO - máximo 3 frases curtas
3. Para listas: mencione APENAS 2-3 exemplos, não liste tudo
4. Valores monetários: use "reais" (nunca "dollars" ou "dólares")
5. Exemplo de resposta curta: "Encontrei 10 empresas cadastradas. Entre elas: Santos Comércio ME (Comércio, R$ 120 mil), Ferreira Consultoria (R$ 800 mil) e Silva & Associados (R$ 500 mil)."
6. NÃO use termos técnicos (query, SQL, RPC, embeddings, agrupamento)
7. NÃO liste todos os itens - apenas os principais
8. Seja direto e objetivo

RESPOSTA (máximo 50 palavras):`

    console.log('[OPX:FeedbackAgent] 📤 Enviando prompt para OpenAI...')
    const startTime = Date.now()
    
    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente empresarial BRASILEIRO. Responda SEMPRE em português brasileiro, de forma CURTA e OBJETIVA. Use "reais" para valores monetários (NUNCA "dollars"). Máximo 3 frases. Seja direto.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 150
        })
      })

      const elapsed = Date.now() - startTime
      console.log('[OPX:FeedbackAgent] 📥 Resposta recebida em', elapsed + 'ms, status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[OPX:FeedbackAgent] ❌ Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        })
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('[OPX:FeedbackAgent] 📦 Dados recebidos:', {
        hasChoices: !!data.choices,
        choicesCount: data.choices?.length || 0,
        hasMessage: !!data.choices?.[0]?.message,
        hasContent: !!data.choices?.[0]?.message?.content
      })

      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('[OPX:FeedbackAgent] ❌ Resposta da IA sem conteúdo')
        throw new Error('Resposta da IA sem conteúdo')
      }

      const interpretedText = data.choices[0].message.content.trim()
      console.log('[OPX:FeedbackAgent] ✅ Resposta interpretada gerada:', interpretedText?.substring(0, 200))
      console.log('[OPX:FeedbackAgent] 📊 Tamanho da resposta:', interpretedText.length, 'caracteres')
      
      return interpretedText
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[OPX:FeedbackAgent] ❌ Erro ao gerar resposta interpretada após', elapsed + 'ms:', error)
      console.error('[OPX:FeedbackAgent] ❌ Stack:', error.stack)
      throw error
    }
  }

  /**
   * Gera resposta simples como fallback
   */
  generateSimpleResponse(actionResult, intent) {
    console.log('[OPX:FeedbackAgent] 🔄 Gerando resposta simples (fallback)...')
    
    if (actionResult.isCount && actionResult.results && actionResult.results.length > 0) {
      const countResult = actionResult.results[0]
      if (countResult.count !== undefined) {
        return `Total: ${countResult.count} ${countResult.label || 'registros'}.`
      } else if (countResult.value !== undefined) {
        return `Total: ${countResult.value}.`
      }
    }
    
    if (actionResult.isGrouped && actionResult.results) {
      const topResult = actionResult.results[0]
      if (topResult.quantidade !== undefined) {
        const topLabel = Object.keys(topResult).find(k => k !== 'quantidade' && k !== 'percentual' && !k.includes('COUNT') && !k.includes('DATE_TRUNC'))
        return `O setor "${topResult[topLabel] || 'Não especificado'}" tem ${topResult.quantidade} empresa${topResult.quantidade !== 1 ? 's' : ''}.`
      }
    }
    
    const count = actionResult.results?.length || actionResult.data?.length || 0
    if (count > 0) {
      return `Encontrei ${count} resultado${count !== 1 ? 's' : ''}.`
    }
    
    return 'Consulta realizada com sucesso.'
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

