/**
 * DataVisualizationAgent - Gera visualizações de dados
 */
export default class DataVisualizationAgent {
  /**
   * Detecta o melhor tipo de gráfico baseado nos dados e contexto
   * @param {Array} data - Dados para visualização
   * @param {Object} actionResult - Resultado da ação
   * @param {string} originalText - Texto original do usuário
   * @returns {string} Tipo de gráfico ideal ('bar', 'line', 'area', 'pie')
   */
  detectBestChartType(data, actionResult, originalText = '') {
    console.log('[OPX:DataVisualizationAgent] 🎯 Detectando melhor tipo de gráfico...')
    
    if (!data || data.length === 0) {
      return 'bar'
    }

    // 1. DETECÇÃO EXPLÍCITA DO USUÁRIO
    const lowerText = originalText.toLowerCase()
    if (lowerText.includes('pizza') || lowerText.includes('pie')) {
      console.log('[OPX:DataVisualizationAgent] 🎯 Usuário pediu PIZZA explicitamente')
      return 'pie'
    }
    if (lowerText.includes('linha') || lowerText.includes('line')) {
      console.log('[OPX:DataVisualizationAgent] 🎯 Usuário pediu LINHA explicitamente')
      return 'line'
    }
    if (lowerText.includes('área') || lowerText.includes('area')) {
      console.log('[OPX:DataVisualizationAgent] 🎯 Usuário pediu ÁREA explicitamente')
      return 'area'
    }
    if (lowerText.includes('barra') || lowerText.includes('bar')) {
      console.log('[OPX:DataVisualizationAgent] 🎯 Usuário pediu BARRAS explicitamente')
      return 'bar'
    }

    // 2. DADOS TEMPORAIS → Line ou Area
    const firstItem = data[0]
    const keys = Object.keys(firstItem)
    const hasTimeColumn = keys.some(key => 
      key.includes('date') || 
      key.includes('time') || 
      key.includes('period') ||
      key.includes('ano') ||
      key.includes('mes') ||
      key.includes('year') ||
      key.includes('month')
    )
    
    if (hasTimeColumn || actionResult.isTimeSeries) {
      // Se mencionar crescimento/tendência/evolução → Area
      if (lowerText.includes('crescimento') || 
          lowerText.includes('tendência') || 
          lowerText.includes('tendencia') ||
          lowerText.includes('evolução') ||
          lowerText.includes('evolucao')) {
        console.log('[OPX:DataVisualizationAgent] 🎯 Dados temporais com tendência → ÁREA')
        return 'area'
      }
      console.log('[OPX:DataVisualizationAgent] 🎯 Dados temporais → LINHA')
      return 'line'
    }

    // 3. POUCOS DADOS CATEGÓRICOS (≤ 6) → Pie Chart
    if (data.length <= 6 && data.length >= 2) {
      // Verificar se tem dados numéricos válidos
      const yColumn = keys.find(k => typeof firstItem[k] === 'number')
      if (yColumn) {
        console.log('[OPX:DataVisualizationAgent] 🎯 Poucos dados categóricos (', data.length, ') → PIZZA')
        return 'pie'
      }
    }

    // 4. DISTRIBUIÇÃO/COMPARAÇÃO → Bar Chart (padrão)
    console.log('[OPX:DataVisualizationAgent] 🎯 Dados categóricos ou agrupamento → BARRAS')
    return 'bar'
  }

  async generateVisualizations(actionResult, intent, originalText = '') {
    console.log('[OPX:DataVisualizationAgent] 📊 ========== GERANDO VISUALIZAÇÕES ==========')
    console.log('[OPX:DataVisualizationAgent] 📝 Input:', {
      intent: intent,
      originalText: originalText,
      hasActionResult: !!actionResult,
      actionResultType: actionResult ? typeof actionResult : 'null',
      actionResultKeys: actionResult ? Object.keys(actionResult) : []
    })
    
    const visualizations = []

    if (!actionResult) {
      console.log('[OPX:DataVisualizationAgent] ⚠️ Nenhum actionResult fornecido, retornando array vazio')
      return visualizations
    }
    
    // Detectar se usuário pediu explicitamente um gráfico/chart
    const userWantsChart = originalText && (
      originalText.toLowerCase().includes('gráfico') || 
      originalText.toLowerCase().includes('grafico') ||
      originalText.toLowerCase().includes('chart')
    )
    
    console.log('[OPX:DataVisualizationAgent] 📊 Propriedades do actionResult:', {
      success: actionResult.success,
      isCount: actionResult.isCount,
      isAggregate: actionResult.isAggregate,
      isGrouped: actionResult.isGrouped,
      isList: actionResult.isList,
      isTimeSeries: actionResult.isTimeSeries,
      hasResults: !!actionResult.results,
      resultsCount: Array.isArray(actionResult.results) ? actionResult.results.length : 'N/A',
      hasChartConfig: !!actionResult.chartConfig,
      hasSummary: !!actionResult.summary,
      summary: actionResult.summary?.substring(0, 100),
      userWantsChart: userWantsChart
    })

    // 🎨 FLOATING CARDS: Para dados ricos (empresas, clientes, etc)
    // IMPORTANTE: Verificar TODOS os locais onde agents podem retornar dados:
    // - CompanyActionAgent retorna em actionResult.data
    // - DatabaseQueryAgent retorna em actionResult.results
    // - Alguns agents podem retornar em actionResult.companies
    const dataSource = actionResult.data || actionResult.companies || actionResult.results
    
    console.log('[OPX:DataVisualizationAgent] 🎴 ========== DEBUG FLOATING CARDS ==========')
    console.log('[OPX:DataVisualizationAgent] 🎴 Tem actionResult.data?', !!actionResult.data)
    console.log('[OPX:DataVisualizationAgent] 🎴 Tem actionResult.companies?', !!actionResult.companies)
    console.log('[OPX:DataVisualizationAgent] 🎴 Tem actionResult.results?', !!actionResult.results)
    console.log('[OPX:DataVisualizationAgent] 🎴 data length:', actionResult.data?.length || 0)
    console.log('[OPX:DataVisualizationAgent] 🎴 companies length:', actionResult.companies?.length || 0)
    console.log('[OPX:DataVisualizationAgent] 🎴 results length:', actionResult.results?.length || 0)
    console.log('[OPX:DataVisualizationAgent] 🎴 isList:', actionResult.isList)
    console.log('[OPX:DataVisualizationAgent] 🎴 isAggregate:', actionResult.isAggregate)
    console.log('[OPX:DataVisualizationAgent] 🎴 isGrouped:', actionResult.isGrouped)
    console.log('[OPX:DataVisualizationAgent] 🎴 Fonte de dados escolhida:', actionResult.data ? 'data' : (actionResult.companies ? 'companies' : (actionResult.results ? 'results' : 'NENHUMA')))
    
    if (dataSource && dataSource.length > 0) {
      const firstItem = dataSource[0]
      console.log('[OPX:DataVisualizationAgent] 🎴 Primeiro item keys:', Object.keys(firstItem))
      console.log('[OPX:DataVisualizationAgent] 🎴 Primeiro item sample:', {
        id: firstItem.id?.substring(0, 8) + '...',
        company_name: firstItem.company_name,
        trade_name: firstItem.trade_name,
        industry: firstItem.industry,
        annual_revenue: firstItem.annual_revenue
      })
      
      // Detectar se são dados de empresas/clientes (dados ricos com múltiplos campos)
      const hasCompanyName = !!firstItem.company_name
      const hasTradeName = !!firstItem.trade_name
      const hasRevenue = !!firstItem.annual_revenue
      const hasIndustry = !!firstItem.industry
      const hasManyFields = Object.keys(firstItem).length > 5
      
      const hasRichData = hasCompanyName || hasTradeName || hasRevenue || hasIndustry || hasManyFields
      
      console.log('[OPX:DataVisualizationAgent] 🎴 ========== ANÁLISE DE DADOS RICOS ==========')
      console.log('[OPX:DataVisualizationAgent] 🎴 hasCompanyName:', hasCompanyName)
      console.log('[OPX:DataVisualizationAgent] 🎴 hasTradeName:', hasTradeName)
      console.log('[OPX:DataVisualizationAgent] 🎴 hasRevenue:', hasRevenue)
      console.log('[OPX:DataVisualizationAgent] 🎴 hasIndustry:', hasIndustry)
      console.log('[OPX:DataVisualizationAgent] 🎴 hasManyFields (>5):', hasManyFields, '(' + Object.keys(firstItem).length + ' campos)')
      console.log('[OPX:DataVisualizationAgent] 🎴 userWantsChart:', userWantsChart)
      console.log('[OPX:DataVisualizationAgent] 🎴 isAggregate:', actionResult.isAggregate)
      console.log('[OPX:DataVisualizationAgent] 🎴 isGrouped:', actionResult.isGrouped)
      
      // 🎯 DECISÃO: Floating Cards APENAS para listagens simples (não agregadas)
      // Se usuário pediu gráfico explicitamente OU é uma query agregada, usar CHART
      const shouldUseChart = userWantsChart || actionResult.isAggregate || actionResult.isGrouped
      
      console.log('[OPX:DataVisualizationAgent] 🎴 ========== DECISÃO FINAL ==========')
      console.log('[OPX:DataVisualizationAgent] 🎴 hasRichData:', hasRichData)
      console.log('[OPX:DataVisualizationAgent] 🎴 shouldUseChart:', shouldUseChart)
      console.log('[OPX:DataVisualizationAgent] 🎴 Decisão: ', shouldUseChart ? 'GRÁFICO (chart)' : (hasRichData ? 'FLOATING CARDS' : 'TABLE'))
      
      if (hasRichData && !shouldUseChart) {
        console.log('[OPX:DataVisualizationAgent] 🎴 ✅ ✅ ✅ CRIANDO FLOATING CARDS! ✅ ✅ ✅')
        const floatingCardsViz = {
          type: 'floating-cards',
          data: dataSource,
          config: {
            title: actionResult.summary || 'Empresas',
            dataType: firstItem.company_name ? 'companies' : 'generic'
          }
        }
        visualizations.push(floatingCardsViz)
        console.log('[OPX:DataVisualizationAgent] 🎴 ========== FLOATING CARDS CRIADO ==========')
        console.log('[OPX:DataVisualizationAgent] 🎴 type:', floatingCardsViz.type)
        console.log('[OPX:DataVisualizationAgent] 🎴 itemCount:', floatingCardsViz.data.length)
        console.log('[OPX:DataVisualizationAgent] 🎴 dataType:', floatingCardsViz.config.dataType)
        console.log('[OPX:DataVisualizationAgent] 🎴 title:', floatingCardsViz.config.title)
        console.log('[OPX:DataVisualizationAgent] ✅ Retornando', visualizations.length, 'visualização(ões)')
        return visualizations
      } else if (shouldUseChart && hasCompanyName && actionResult.isGrouped) {
        console.log('[OPX:DataVisualizationAgent] 📊 Usuário pediu gráfico - continuando para criar CHART...')
      } else {
        console.log('[OPX:DataVisualizationAgent] ❌ Dados NÃO são ricos - continuando...')
      }
    } else {
      console.log('[OPX:DataVisualizationAgent] ❌ Nenhuma fonte de dados válida - continuando...')
    }

    // Para consultas de contagem, criar visualização de card
    if (actionResult.isCount) {
      // Se houver visualizationData específica, usar ela
      if (actionResult.visualizationData && actionResult.visualizationData.length > 0) {
        console.log('[OPX:DataVisualizationAgent] 📊 Creating count card from visualizationData')
        visualizations.push({
          type: 'card',
          data: actionResult.visualizationData,
          config: {
            title: actionResult.summary || 'Contagem'
          }
        })
        console.log('[OPX:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
        return visualizations
      }
      
      // Fallback: usar results[0] se disponível
      if (actionResult.results && actionResult.results.length > 0) {
        const countResult = actionResult.results[0]
        if (countResult.count !== undefined || actionResult.companiesWithoutEmployees !== undefined) {
          const count = countResult.count !== undefined ? countResult.count : actionResult.companiesWithoutEmployees
          console.log('[OPX:DataVisualizationAgent] 📊 Creating count card visualization:', count)
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
          console.log('[OPX:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
          return visualizations
        }
      }
      
      // Se for apenas um count numérico
      if (actionResult.companiesWithoutEmployees !== undefined) {
        console.log('[OPX:DataVisualizationAgent] 📊 Creating count card from companiesWithoutEmployees')
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
        console.log('[OPX:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
        return visualizations
      }
    }

    // Para consultas tipo LIST (listar registros individuais)
    if (actionResult.isList && actionResult.results && actionResult.results.length > 0) {
      console.log('[OPX:DataVisualizationAgent] 📋 Query tipo LIST detectada...')
      console.log('[OPX:DataVisualizationAgent] 📊 Dados (primeiros 3):', actionResult.results?.slice(0, 3))
      
      // 🎴 VERIFICAR SE SÃO DADOS RICOS (empresas/clientes) para usar Floating Cards
      const firstItem = actionResult.results[0]
      const hasRichData = firstItem.company_name || firstItem.trade_name || 
                          firstItem.annual_revenue || firstItem.industry ||
                          (Object.keys(firstItem).length > 5)
      
      if (hasRichData) {
        console.log('[OPX:DataVisualizationAgent] 🎴 ========== CRIANDO FLOATING CARDS ==========')
        console.log('[OPX:DataVisualizationAgent] 🎴 Dados ricos detectados!')
        console.log('[OPX:DataVisualizationAgent] 🎴 Campos do primeiro item:', Object.keys(firstItem))
        console.log('[OPX:DataVisualizationAgent] 🎴 Total de registros:', actionResult.results.length)
        
        const floatingCardsViz = {
          type: 'floating-cards',
          data: actionResult.results,
          config: {
            title: actionResult.summary || 'Resultados da Consulta',
            dataType: firstItem.company_name ? 'companies' : 'generic'
          }
        }
        
        visualizations.push(floatingCardsViz)
        console.log('[OPX:DataVisualizationAgent] ✅ Floating Cards criado com sucesso!')
        console.log('[OPX:DataVisualizationAgent] ✅ Total de visualizações:', visualizations.length)
        return visualizations
      }
      
      // Se não são dados ricos, criar tabela normal
      console.log('[OPX:DataVisualizationAgent] 📋 Dados simples, criando tabela...')
      const keys = Object.keys(actionResult.results[0])
      const tableViz = {
        type: 'table',
        data: {
          columns: keys,
          rows: actionResult.results.map(item => keys.map(key => {
            const value = item[key]
            // Formatar valores especiais
            if (value === null || value === undefined) return '-'
            if (typeof value === 'object') return JSON.stringify(value)
            if (typeof value === 'number' && key.includes('revenue')) {
              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
            }
            return value
          }))
        },
        config: {
          title: actionResult.summary || 'Resultados da Consulta',
          maxRows: 10
        }
      }
      
      visualizations.push(tableViz)
      console.log('[OPX:DataVisualizationAgent] ✅ Tabela criada:', {
        type: tableViz.type,
        columns: tableViz.data.columns.length,
        rows: tableViz.data.rows.length,
        title: tableViz.config.title
      })
      console.log('[OPX:DataVisualizationAgent] ✅ Total de visualizações:', visualizations.length)
      return visualizations
    }

    // Para consultas agregadas (média, etc)
    if (actionResult.isAggregate && actionResult.results && actionResult.results.length > 0) {
      // Se for agrupamento (ex: por setor), criar gráfico
      if (actionResult.isGrouped && actionResult.chartConfig) {
        console.log('[OPX:DataVisualizationAgent] 📊 Criando gráfico de agrupamento...')
        console.log('[OPX:DataVisualizationAgent] 📊 Config do gráfico:', JSON.stringify(actionResult.chartConfig, null, 2))
        console.log('[OPX:DataVisualizationAgent] 📊 Dados do gráfico (primeiros 3):', actionResult.results?.slice(0, 3))
        
        // 🎯 PRIORIDADE 1: Usar tipo sugerido pelo QueryPlanningAgent (se disponível)
        let chartType = actionResult.chartConfig.suggestedChartType || actionResult.chartConfig.chartType
        
        // 🎯 PRIORIDADE 2: Detectar automaticamente se não foi sugerido
        if (!chartType || chartType === 'bar') {
          chartType = this.detectBestChartType(actionResult.results, actionResult, originalText)
          console.log('[OPX:DataVisualizationAgent] 🎯 Tipo de gráfico auto-detectado:', chartType)
        } else {
          console.log('[OPX:DataVisualizationAgent] 🎯 Tipo de gráfico sugerido pelo QueryPlanner:', chartType)
        }
        
        // Melhorar título do gráfico
        let chartTitle = actionResult.chartConfig.title || actionResult.summary || 'Gráfico'
        
        // Se o título for muito técnico ou longo, simplificar
        if (chartTitle.includes('Esta consulta') || chartTitle.includes('Consulta para') || chartTitle.length > 60) {
          // Detectar tipo de agrupamento pelo yColumn
          const yCol = actionResult.chartConfig.yColumn || ''
          if (yCol.includes('colaborador') || yCol.includes('employee')) {
            chartTitle = 'Colaboradores por Empresa'
          } else if (yCol.includes('quantidade') || yCol.includes('count')) {
            chartTitle = 'Distribuição de Dados'
          } else if (yCol.includes('revenue') || yCol.includes('receita')) {
            chartTitle = 'Receita por Empresa'
          } else {
            chartTitle = 'Análise de Dados'
          }
        }
        
        const chartViz = {
          type: 'chart',
          data: actionResult.results,
          config: {
            ...actionResult.chartConfig,
            chartType: chartType, // 🎯 Usar tipo sugerido ou detectado
            title: chartTitle
          }
        }
        
        visualizations.push(chartViz)
        console.log('[OPX:DataVisualizationAgent] ✅ Gráfico de agrupamento criado:', {
          type: chartViz.type,
          chartType: chartViz.config.chartType,
          dataPoints: chartViz.data?.length || 0,
          xColumn: chartViz.config.xColumn,
          yColumn: chartViz.config.yColumn,
          title: chartViz.config.title
        })
        console.log('[OPX:DataVisualizationAgent] ✅ Total de visualizações:', visualizations.length)
        return visualizations
      }
      
      // Para agregações simples (média, etc), criar card
      const aggregateResult = actionResult.results[0]
      if (aggregateResult.value !== undefined || aggregateResult.average !== undefined) {
        const value = aggregateResult.value || aggregateResult.average
        console.log('[OPX:DataVisualizationAgent] 📊 Creating aggregate card visualization:', value)
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
        console.log('[OPX:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
        return visualizations
      }
    }

    // Para consultas temporais (gráficos)
    if (actionResult.isTimeSeries && actionResult.results && actionResult.results.length > 0) {
      const chartData = this.prepareChartData(actionResult.results)
      
      // 🎯 DETECTAR AUTOMATICAMENTE O MELHOR TIPO DE GRÁFICO
      const detectedChartType = this.detectBestChartType(actionResult.results, actionResult, originalText)
      console.log('[OPX:DataVisualizationAgent] 🎯 Tipo de gráfico detectado para time series:', detectedChartType)
      
      const config = actionResult.chartConfig || {
        chartType: detectedChartType,
        title: actionResult.summary || 'Gráfico Temporal',
        xColumn: 'period',
        yColumn: 'count'
      }
      
      // Se não tem chartType definido, usar o detectado
      if (!config.chartType) {
        config.chartType = detectedChartType
      }
      
      console.log('[OPX:DataVisualizationAgent] 📊 Creating time series chart:', config.chartType, 'with', chartData.length, 'data points')
      console.log('[OPX:DataVisualizationAgent] 📊 Chart config:', config)
      console.log('[OPX:DataVisualizationAgent] 📊 Chart data:', chartData)
      
      visualizations.push({
        type: 'chart',
        data: chartData,
        config: config
      })
      console.log('[OPX:DataVisualizationAgent] ✅ Generated', visualizations.length, 'visualization(s)')
      return visualizations
    }

    // Usar results ou data (compatibilidade)
    const data = actionResult.results || actionResult.data
    
    if (!data) {
      return visualizations
    }

    // Se for array de objetos, criar visualização apropriada
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0]
      const keys = Object.keys(firstItem)
      
      // 🔍 DETECÇÃO 1: Contagem simples (1 linha, 1 coluna numérica)
      if (data.length === 1 && keys.length === 1 && typeof firstItem[keys[0]] === 'number') {
        console.log('[OPX:DataVisualizationAgent] 📊 Contagem simples detectada - criando tabela')
        visualizations.push({
          type: 'table',
          data: {
            columns: keys,
            rows: data.map(item => keys.map(key => item[key] ?? ''))
          },
          config: {
            title: actionResult.summary || this.getTitleForIntent(intent)
          }
        })
        console.log('[OPX:DataVisualizationAgent] ✅ Tabela de contagem criada')
        return visualizations
      }
      
      // 🔍 DETECÇÃO 2: Poucos itens (≤ 10) - Tabela
      if (data.length <= 10) {
        console.log('[OPX:DataVisualizationAgent] 📋 Poucos itens (', data.length, ') - criando tabela')
        visualizations.push({
          type: 'table',
          data: {
            columns: keys,
            rows: data.map(item => keys.map(key => item[key] ?? ''))
          },
          config: {
            title: actionResult.summary || this.getTitleForIntent(intent),
            maxRows: 10
          }
        })
        console.log('[OPX:DataVisualizationAgent] ✅ Tabela criada com', data.length, 'linhas')
        return visualizations
      } else {
        // 🔍 DETECÇÃO 3: Muitos itens (> 10) - Gráfico
        console.log('[OPX:DataVisualizationAgent] 📊 Muitos itens (', data.length, ') - criando gráfico')
        const chartData = this.prepareChartData(data)
        const detectedChartType = this.detectBestChartType(data, actionResult, originalText)
        
        visualizations.push({
          type: 'chart',
          data: chartData,
          config: {
            chartType: detectedChartType,
            title: actionResult.summary || this.getTitleForIntent(intent),
            xColumn: keys[0] || 'x',
            yColumn: keys[1] || 'y'
          }
        })
        console.log('[OPX:DataVisualizationAgent] ✅ Gráfico criado:', detectedChartType)
        return visualizations
      }
    } else if (typeof data === 'object' && !Array.isArray(data)) {
      // Cards para objetos únicos
      console.log('[OPX:DataVisualizationAgent] 📊 Objeto único - criando card')
      visualizations.push({
        type: 'card',
        data: Object.entries(data).map(([key, value]) => ({
          label: this.formatLabel(key),
          value: value
        }))
      })
    }

    console.log('[OPX:DataVisualizationAgent] ✅ ========== VISUALIZAÇÕES GERADAS ==========')
    console.log('[OPX:DataVisualizationAgent] 📊 Resumo:', {
      totalVisualizations: visualizations.length,
      types: visualizations.map(v => v.type),
      hasCharts: visualizations.some(v => v.type === 'chart'),
      hasTables: visualizations.some(v => v.type === 'table'),
      hasCards: visualizations.some(v => v.type === 'card')
    })
    console.log('[OPX:DataVisualizationAgent] 📋 Visualizações completas:', JSON.stringify(visualizations, null, 2))
    
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

