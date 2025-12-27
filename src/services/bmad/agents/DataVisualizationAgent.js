/**
 * DataVisualizationAgent - Gera visualizações de dados
 */
export default class DataVisualizationAgent {
  async generateVisualizations(actionResult, intent) {
    const visualizations = []

    if (!actionResult || !actionResult.data) {
      return visualizations
    }

    const data = actionResult.data

    // Se for array de objetos, criar tabela
    if (Array.isArray(data) && data.length > 0) {
      if (data.length <= 10) {
        // Tabela para poucos itens
        const keys = Object.keys(data[0])
        visualizations.push({
          type: 'table',
          data: {
            columns: keys,
            rows: data.map(item => keys.map(key => item[key] ?? ''))
          },
          config: {
            title: this.getTitleForIntent(intent)
          }
        })
      } else {
        // Gráfico para muitos itens
        const keys = Object.keys(data[0])
        const chartData = this.prepareChartData(data)
        visualizations.push({
          type: 'chart',
          data: chartData,
          config: {
            chartType: 'bar',
            title: this.getTitleForIntent(intent),
            xColumn: keys[0] || 'x',
            yColumn: keys[1] || 'y'
          }
        })
      }
    } else if (typeof data === 'object' && !Array.isArray(data)) {
      // Cards para objetos únicos
      visualizations.push({
        type: 'card',
        data: Object.entries(data).map(([key, value]) => ({
          label: this.formatLabel(key),
          value: value
        }))
      })
    }

    return visualizations
  }

  getTitleForIntent(intent) {
    const titles = {
      'list_companies': 'Empresas',
      'list_employees': 'Colaboradores',
      'list_campaigns': 'Campanhas',
      'list_prospects': 'Prospects',
      'query_database': 'Resultados da Consulta'
    }
    return titles[intent] || 'Dados'
  }

  prepareChartData(data) {
    // Preparar dados para gráfico no formato esperado pelos componentes
    if (data.length === 0) return []
    
    // Se já está no formato correto, retornar como está
    if (Array.isArray(data) && data[0] && typeof data[0] === 'object') {
      return data
    }
    
    // Converter formato simples para formato esperado
    const firstItem = data[0]
    if (!firstItem) return []
    
    const keys = Object.keys(firstItem)
    if (keys.length === 0) return []
    
    // Retornar dados no formato esperado pelos gráficos
    return data.map(item => {
      const result = {}
      keys.forEach(key => {
        result[key] = item[key]
      })
      return result
    })
  }

  formatLabel(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }
}

