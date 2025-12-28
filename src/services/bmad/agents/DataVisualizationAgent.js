/**
 * DataVisualizationAgent - Gera visualizações de dados
 */
export default class DataVisualizationAgent {
  async generateVisualizations(actionResult, intent) {
    console.log('[BMAD:DataVisualizationAgent] 📊 ========== GERANDO VISUALIZAÇÕES ==========')
    console.log('[BMAD:DataVisualizationAgent] 📝 Input:', {
      intent: intent,
      hasActionResult: !!actionResult,
      actionResultType: actionResult ? typeof actionResult : 'null',
      actionResultKeys: actionResult ? Object.keys(actionResult) : []
    })
    
    const visualizations = []

    if (!actionResult) {
      console.log('[BMAD:DataVisualizationAgent] ⚠️ Nenhum actionResult fornecido, retornando array vazio')
      return visualizations
    }
    
    console.log('[BMAD:DataVisualizationAgent] 📊 Propriedades do actionResult:', {
      success: actionResult.success,
      isCount: actionResult.isCount,
      isAggregate: actionResult.isAggregate,
      isGrouped: actionResult.isGrouped,
      isTimeSeries: actionResult.isTimeSeries,
      hasResults: !!actionResult.results,
      resultsCount: Array.isArray(actionResult.results) ? actionResult.results.length : 'N/A',
      hasChartConfig: !!actionResult.chartConfig,
      hasSummary: !!actionResult.summary,
      summary: actionResult.summary?.substring(0, 100)
    })

    // Para consultas de contagem, criar visualização de card
    if (actionResult.isCount) {
      // Se houver visualizationData específica, usar ela
      if (actionResult.visualizationData && actionResult.visualizationData.length > 0) {
        console.log('[BMAD:DataVisualizationAgent] 📊 Creating count card from visualizationData')
        visualizations.push({
          type: 'card',
          data: actionResult.visualizationData,
          config: {
            title: actionResult.summary || 'Contagem'
          }
        })
        console.log('[BMAD:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
        return visualizations
      }
      
      // Fallback: usar results[0] se disponível
      if (actionResult.results && actionResult.results.length > 0) {
        const countResult = actionResult.results[0]
        if (countResult.count !== undefined || actionResult.companiesWithoutEmployees !== undefined) {
          const count = countResult.count !== undefined ? countResult.count : actionResult.companiesWithoutEmployees
          console.log('[BMAD:DataVisualizationAgent] 📊 Creating count card visualization:', count)
          visualizations.push({
            type: 'card',
            data: [{
              label: countResult.label || 'Total',
              value: count
            }],
            config: {
              title: actionResult.summary || 'Contagem'
            }
          })
          console.log('[BMAD:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
          return visualizations
        }
      }
      
      // Se for apenas um count numérico
      if (actionResult.companiesWithoutEmployees !== undefined) {
        console.log('[BMAD:DataVisualizationAgent] 📊 Creating count card from companiesWithoutEmployees')
        visualizations.push({
          type: 'card',
          data: [{
            label: 'Empresas sem Colaboradores',
            value: actionResult.companiesWithoutEmployees
          }],
          config: {
            title: actionResult.summary || 'Contagem'
          }
        })
        console.log('[BMAD:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
        return visualizations
      }
    }

    // Para consultas agregadas (média, etc)
    if (actionResult.isAggregate && actionResult.results && actionResult.results.length > 0) {
      // Se for agrupamento (ex: por setor), criar gráfico
      if (actionResult.isGrouped && actionResult.chartConfig) {
        console.log('[BMAD:DataVisualizationAgent] 📊 Criando gráfico de agrupamento...')
        console.log('[BMAD:DataVisualizationAgent] 📊 Config do gráfico:', JSON.stringify(actionResult.chartConfig, null, 2))
        console.log('[BMAD:DataVisualizationAgent] 📊 Dados do gráfico (primeiros 3):', actionResult.results?.slice(0, 3))
        
        const chartViz = {
          type: 'chart',
          data: actionResult.results,
          config: actionResult.chartConfig
        }
        
        visualizations.push(chartViz)
        console.log('[BMAD:DataVisualizationAgent] ✅ Gráfico de agrupamento criado:', {
          type: chartViz.type,
          chartType: chartViz.config.chartType,
          dataPoints: chartViz.data?.length || 0,
          xColumn: chartViz.config.xColumn,
          yColumn: chartViz.config.yColumn,
          title: chartViz.config.title
        })
        console.log('[BMAD:DataVisualizationAgent] ✅ Total de visualizações:', visualizations.length)
        return visualizations
      }
      
      // Para agregações simples (média, etc), criar card
      const aggregateResult = actionResult.results[0]
      if (aggregateResult.value !== undefined || aggregateResult.average !== undefined) {
        const value = aggregateResult.value || aggregateResult.average
        console.log('[BMAD:DataVisualizationAgent] 📊 Creating aggregate card visualization:', value)
        visualizations.push({
          type: 'card',
          data: [{
            label: aggregateResult.metric ? this.formatLabel(aggregateResult.metric) : 'Média',
            value: typeof value === 'number' ? value.toFixed(2) : value
          }],
          config: {
            title: actionResult.summary || 'Agregação'
          }
        })
        console.log('[BMAD:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
        return visualizations
      }
    }

    // Para consultas temporais (gráficos)
    if (actionResult.isTimeSeries && actionResult.results && actionResult.results.length > 0) {
      const chartData = this.prepareChartData(actionResult.results)
      const config = actionResult.chartConfig || {
        chartType: 'line',
        title: actionResult.summary || 'Gráfico Temporal',
        xColumn: 'period',
        yColumn: 'count'
      }
      
      // Garantir que chartType está definido
      if (!config.chartType) {
        config.chartType = 'line'
      }
      
      console.log('[BMAD:DataVisualizationAgent] 📊 Creating time series chart:', config.chartType, 'with', chartData.length, 'data points')
      console.log('[BMAD:DataVisualizationAgent] 📊 Chart config:', config)
      console.log('[BMAD:DataVisualizationAgent] 📊 Chart data:', chartData)
      
      visualizations.push({
        type: 'chart',
        data: chartData,
        config: config
      })
      console.log('[BMAD:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
      return visualizations
    }

    // Usar results ou data (compatibilidade)
    const data = actionResult.results || actionResult.data
    
    if (!data) {
      return visualizations
    }

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

    console.log('[BMAD:DataVisualizationAgent] ✅ ========== VISUALIZAÇÕES GERADAS ==========')
    console.log('[BMAD:DataVisualizationAgent] 📊 Resumo:', {
      totalVisualizations: visualizations.length,
      types: visualizations.map(v => v.type),
      hasCharts: visualizations.some(v => v.type === 'chart'),
      hasTables: visualizations.some(v => v.type === 'table'),
      hasCards: visualizations.some(v => v.type === 'card')
    })
    console.log('[BMAD:DataVisualizationAgent] 📋 Visualizações completas:', JSON.stringify(visualizations, null, 2))
    
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

