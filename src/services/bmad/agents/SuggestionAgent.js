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
    const intent = intentResult.intent
    const suggestions = []

    // Buscar sugestões baseadas na intenção
    if (this.suggestionPatterns[intent]) {
      suggestions.push(...this.suggestionPatterns[intent])
    }

    // Sugestões genéricas baseadas no histórico
    if (history && history.length > 0) {
      const lastAction = history[history.length - 1]
      if (lastAction.intent === 'create_company') {
        suggestions.push({
          text: 'Deseja ver o dashboard da empresa?',
          command: 'mostrar dashboard',
          relevance: 60
        })
      }
    }

    // Ordenar por relevância e retornar top 3-5
    return {
      suggestions: suggestions
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5),
      reasoning: `Sugestões baseadas na ação: ${intent}`,
      confidence: 0.7
    }
  }
}

