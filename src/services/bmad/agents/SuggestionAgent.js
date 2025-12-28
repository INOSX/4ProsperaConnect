/**
 * SuggestionAgent - Gera sugestões de próximas ações
 */
export default class SuggestionAgent {
  constructor() {
    this.suggestionPatterns = {
      'create_company': [
        { text: 'Deseja adicionar colaboradores agora?', command: 'adicionar colaboradores', relevance: 90 },
        { text: 'Quer configurar benefícios?', command: 'configurar benefícios', relevance: 70 }
      ],
      'list_prospects': [
        { text: 'Quer enriquecer os prospects qualificados?', command: 'enriquecer prospects', relevance: 85 },
        { text: 'Deseja criar uma campanha para eles?', command: 'criar campanha', relevance: 75 }
      ],
      'query_database': [
        { text: 'Posso criar um gráfico com esses dados?', command: 'criar gráfico', relevance: 80 }
      ]
    }
  }

  async generateSuggestions(text, intentResult, actionResult, history) {
    console.log('[BMAD:SuggestionAgent] 💡 ========== GERANDO SUGESTÕES ==========')
    console.log('[BMAD:SuggestionAgent] 📝 Input:', {
      text: text?.substring(0, 100),
      intent: intentResult?.intent,
      hasActionResult: !!actionResult,
      historyLength: history?.length || 0
    })
    
    const intent = intentResult.intent
    const suggestions = []

    // Buscar sugestões baseadas na intenção
    console.log('[BMAD:SuggestionAgent] 🔍 Buscando sugestões baseadas em padrões para intent:', intent)
    if (this.suggestionPatterns[intent]) {
      suggestions.push(...this.suggestionPatterns[intent])
      console.log('[BMAD:SuggestionAgent] ✅ Encontradas', this.suggestionPatterns[intent].length, 'sugestões baseadas em padrões:', 
        this.suggestionPatterns[intent].map(s => s.text))
    } else {
      console.log('[BMAD:SuggestionAgent] ⚠️ Nenhuma sugestão de padrão encontrada para intent:', intent)
      console.log('[BMAD:SuggestionAgent] 📋 Intents disponíveis:', Object.keys(this.suggestionPatterns))
    }

    // Sugestões genéricas baseadas no histórico
    if (history && history.length > 0) {
      console.log('[BMAD:SuggestionAgent] 🔍 Analisando histórico para sugestões...')
      const lastAction = history[history.length - 1]
      console.log('[BMAD:SuggestionAgent] 📚 Última ação no histórico:', {
        intent: lastAction.intent,
        timestamp: lastAction.timestamp
      })
      
      if (lastAction.intent === 'create_company') {
        const historySuggestion = {
          text: 'Deseja ver o dashboard da empresa?',
          command: 'mostrar dashboard',
          relevance: 60
        }
        suggestions.push(historySuggestion)
        console.log('[BMAD:SuggestionAgent] ✅ Adicionada sugestão baseada em histórico:', historySuggestion.text)
      }
    } else {
      console.log('[BMAD:SuggestionAgent] ℹ️ Nenhum histórico disponível para análise')
    }

    console.log('[BMAD:SuggestionAgent] 📊 Total de sugestões coletadas:', suggestions.length)
    console.log('[BMAD:SuggestionAgent] 🔄 Ordenando por relevância...')

    // Ordenar por relevância e retornar top 3-5
    const finalSuggestions = suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
    
    console.log('[BMAD:SuggestionAgent] ✅ ========== SUGESTÕES GERADAS ==========')
    console.log('[BMAD:SuggestionAgent] 📤 Resultado:', {
      totalSuggestions: finalSuggestions.length,
      suggestions: finalSuggestions.map(s => ({ text: s.text, relevance: s.relevance })),
      reasoning: `Sugestões baseadas na ação: ${intent}`,
      confidence: 0.7
    })
    console.log('[BMAD:SuggestionAgent] 📋 Sugestões completas:', JSON.stringify(finalSuggestions, null, 2))
    
    return {
      suggestions: finalSuggestions,
      reasoning: `Sugestões baseadas na ação: ${intent}`,
      confidence: 0.7
    }
  }
}

