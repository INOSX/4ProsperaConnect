/**
 * DatabaseQueryAgent - Consultas ao banco de dados com busca SQL e vetorial
 * Permite que o especialista "conheça" e processe todos os registros do banco
 * Agora usa IA para planejar consultas dinâmicas
 */
import { supabase } from '../../../services/supabase'
import VectorSearchService from '../services/VectorSearchService.js'
import DatabaseKnowledgeAgent from './DatabaseKnowledgeAgent.js'
import QueryPlanningAgent from './QueryPlanningAgent.js'

export default class DatabaseQueryAgent {
  constructor() {
    this.vectorSearch = new VectorSearchService()
    this.knowledgeAgent = new DatabaseKnowledgeAgent()
    this.planningAgent = new QueryPlanningAgent()
  }

  /**
   * Método principal para consultas - usa busca semântica como padrão
   */
  async query(text, user, context, params) {
    try {
      console.log('[BMAD:DatabaseQueryAgent] 🔍 Analyzing query type for:', text?.substring(0, 100))
      
      // NOVO: Usar QueryPlanningAgent para planejar a consulta com IA
      console.log('[BMAD:DatabaseQueryAgent] 🧠 Planning query with AI...')
      let queryPlan = null
      try {
        queryPlan = await this.planningAgent.planQuery(text, 'query_database', context)
        console.log('[BMAD:DatabaseQueryAgent] ✅ Query plan from AI:', queryPlan)
      } catch (planError) {
        console.warn('[BMAD:DatabaseQueryAgent] ⚠️ AI planning failed, using fallback:', planError)
        queryPlan = null
      }
      
      // Detectar consultas sobre empresas sem colaboradores PRIMEIRO (antes de outras detecções)
      if (this.isCompaniesWithoutEmployeesQuery(text)) {
        console.log('[BMAD:DatabaseQueryAgent] 📋 Detected: Companies without employees query')
        return await this.handleCompaniesWithoutEmployeesQuery(text, user, params)
      }
      
      // Se temos um plano da IA com alta confiança, usar ele
      if (queryPlan && queryPlan.confidence > 0.6) {
        console.log('[BMAD:DatabaseQueryAgent] 📋 Using AI query plan:', queryPlan.queryType, 'confidence:', queryPlan.confidence)
        return await this.executePlannedQuery(queryPlan, text, user, params)
      }
      
      // Fallback: Detectar tipo de consulta usando heurísticas
      const isCountQuery = this.isCountQuery(text)
      const isAggregateQuery = this.isAggregateQuery(text)
      const isTimeSeriesQuery = this.isTimeSeriesQuery(text)
      
      if (isCountQuery) {
        console.log('[BMAD:DatabaseQueryAgent] 📋 Detected: Count query (heuristic)')
        return await this.handleCountQuery(text, user, params)
      }
      
      if (isAggregateQuery) {
        console.log('[BMAD:DatabaseQueryAgent] 📋 Detected: Aggregate query (heuristic)')
        return await this.handleAggregateQuery(text, user, params)
      }
      
      if (isTimeSeriesQuery) {
        console.log('[BMAD:DatabaseQueryAgent] 📋 Detected: Time series query (heuristic)')
        return await this.handleTimeSeriesQuery(text, user, params)
      }
      
      console.log('[BMAD:DatabaseQueryAgent] 📋 Detected: Generic query (using semantic search)')
      
      // Decidir estratégia: SQL vs Vetorial vs Híbrida
      const strategy = this.determineSearchStrategy(text)
      
      // Busca semântica é o padrão para consultas gerais
      if (strategy === 'vector' || strategy === 'hybrid' || strategy === 'default') {
        // Usar busca vetorial (padrão)
        const limit = params?.limit || 20 // Aumentar limite para mais resultados
        const vectorResults = await this.vectorSearch.semanticSearch(text, params?.tableName, limit)
        
        if (strategy === 'vector' || strategy === 'default') {
          return {
            success: true,
            results: this.formatVectorResults(vectorResults.results || []),
            summary: vectorResults.summary || 'Resultados encontrados via busca semântica',
            vectorSearchUsed: true,
            totalResults: vectorResults.results?.length || 0
          }
        }
        
        // Híbrida: combinar com SQL se necessário
        const sqlResults = await this.executeSQLQuery(text, user, params)
        return {
          success: true,
          results: this.combineResults(vectorResults.results || [], sqlResults),
          summary: `Encontrados ${(vectorResults.results?.length || 0) + sqlResults.length} resultados (semânticos + SQL)`,
          vectorSearchUsed: true
        }
      } else {
        // Usar SQL tradicional apenas para consultas muito específicas
        const sqlResults = await this.executeSQLQuery(text, user, params)
        return {
          success: true,
          results: sqlResults,
          summary: `Encontrados ${sqlResults.length} resultados via SQL`,
          vectorSearchUsed: false
        }
      }
    } catch (error) {
      console.error('Error in DatabaseQueryAgent:', error)
      return {
        success: false,
        error: error.message,
        results: []
      }
    }
  }

  /**
   * Detecta se a consulta é uma pergunta de contagem
   */
  isCountQuery(text) {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const countKeywords = ['quantas', 'quantos', 'total de', 'número de', 'contar', 'count']
    return countKeywords.some(keyword => lowerText.includes(keyword))
  }

  /**
   * Detecta se a consulta é sobre média/agregação
   */
  isAggregateQuery(text) {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const aggregateKeywords = ['média', 'média de', 'average', 'avg', 'médio', 'médios']
    return aggregateKeywords.some(keyword => lowerText.includes(keyword))
  }

  /**
   * Detecta se a consulta é sobre gráfico temporal
   */
  isTimeSeriesQuery(text) {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const timeKeywords = ['gráfico', 'chart', 'por período', 'por mês', 'por ano', 'ao longo do tempo', 'tendência', 'evolução', 'cadastramento', 'cadastro']
    return timeKeywords.some(keyword => lowerText.includes(keyword))
  }

  /**
   * Detecta se a consulta é sobre empresas sem colaboradores
   */
  isCompaniesWithoutEmployeesQuery(text) {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const keywords = ['empresa', 'empresas', 'empresa que', 'empresas que']
    const negativeKeywords = [
      'sem colaborador', 'sem colaboradores', 'sem funcionário', 'sem funcionários',
      'sem empregado', 'sem empregados', 'sem cadastrado', 'sem cadastrados',
      'não tem', 'não têm', 'sem ter', 'não tem colaborador', 'não tem funcionário',
      'que não tem', 'que não têm', 'que não tem colaborador', 'que não têm colaborador',
      'sem nenhum colaborador', 'sem nenhum funcionário'
    ]
    const hasKeyword = keywords.some(kw => lowerText.includes(kw))
    const hasNegativeKeyword = negativeKeywords.some(kw => lowerText.includes(kw))
    
    if (hasKeyword && hasNegativeKeyword) {
      console.log('[DatabaseQueryAgent] ✅ Detected companies without employees query')
      return true
    }
    
    return false
  }

  /**
   * Lida com consultas agregadas (média, soma, etc)
   */
  async handleAggregateQuery(text, user, params) {
    console.log('[DatabaseQueryAgent] handleAggregateQuery called:', { text, hasUser: !!user })
    try {
      const lowerText = text.toLowerCase()
      
      // Detectar média de colaboradores por empresa
      if (lowerText.includes('média') && (lowerText.includes('colaborador') || lowerText.includes('funcionário')) && lowerText.includes('empresa')) {
        console.log('[DatabaseQueryAgent] Detected average employees per company query')
        
        // Buscar todas as empresas
        const { CompanyService } = await import('../../../services/companyService')
        let userIsAdmin = false
        try {
          const { ClientService } = await import('../../../services/clientService')
          const clientResult = await ClientService.getClientByUserId(user?.id)
          if (clientResult.success && clientResult.client) {
            userIsAdmin = clientResult.client.role === 'admin'
          }
        } catch (e) {
          console.warn('[DatabaseQueryAgent] Error checking admin status:', e)
        }
        
        const companiesResult = await CompanyService.getUserCompanies(user?.id, userIsAdmin)
        const companies = companiesResult.companies || []
        
        if (companies.length === 0) {
          return {
            success: true,
            results: [],
            summary: 'Nenhuma empresa encontrada',
            average: 0,
            isAggregate: true
          }
        }
        
        // Buscar colaboradores de cada empresa
        const { EmployeeService } = await import('../../../services/employeeService')
        let totalEmployees = 0
        let companiesWithEmployees = 0
        
        for (const company of companies) {
          try {
            const employeesResult = await EmployeeService.getCompanyEmployees(company.id)
            const employees = employeesResult.employees || []
            if (employees.length > 0) {
              totalEmployees += employees.length
              companiesWithEmployees++
            }
          } catch (e) {
            console.warn(`[DatabaseQueryAgent] Error fetching employees for company ${company.id}:`, e)
          }
        }
        
        const average = companiesWithEmployees > 0 ? (totalEmployees / companiesWithEmployees).toFixed(2) : 0
        
        return {
          success: true,
          results: [{
            metric: 'média_colaboradores_por_empresa',
            value: parseFloat(average),
            total_empresas: companies.length,
            empresas_com_colaboradores: companiesWithEmployees,
            total_colaboradores: totalEmployees
          }],
          summary: `A média de colaboradores por empresa é ${average}. Total de ${totalEmployees} colaboradores em ${companiesWithEmployees} empresas.`,
          average: parseFloat(average),
          isAggregate: true
        }
      }
      
      // Detectar análise de portfólio por setor
      if (lowerText.includes('setor') || lowerText.includes('portfólio') || lowerText.includes('portfolio') || 
          (lowerText.includes('empresa') && (lowerText.includes('cada') || lowerText.includes('por')))) {
        console.log('[DatabaseQueryAgent] Detected portfolio/sector analysis query')
        
        const { CompanyService } = await import('../../../services/companyService')
        let userIsAdmin = false
        try {
          const { ClientService } = await import('../../../services/clientService')
          const clientResult = await ClientService.getClientByUserId(user?.id)
          if (clientResult.success && clientResult.client) {
            userIsAdmin = clientResult.client.role === 'admin'
          }
        } catch (e) {
          console.warn('[DatabaseQueryAgent] Error checking admin status:', e)
        }
        
        const companiesResult = await CompanyService.getUserCompanies(user?.id, userIsAdmin)
        const companies = companiesResult.companies || []
        
        if (companies.length === 0) {
          return {
            success: true,
            results: [],
            summary: 'Nenhuma empresa encontrada para análise de portfólio',
            isAggregate: true
          }
        }
        
        // Agrupar empresas por setor (industry)
        const bySector = {}
        let companiesWithoutSector = 0
        
        companies.forEach(company => {
          const sector = company.industry || company.sector || 'Não especificado'
          if (!bySector[sector]) {
            bySector[sector] = 0
          }
          bySector[sector]++
          if (sector === 'Não especificado') {
            companiesWithoutSector++
          }
        })
        
        // Converter para array e ordenar por quantidade (maior primeiro)
        const sectorData = Object.entries(bySector)
          .map(([sector, count]) => ({
            setor: sector,
            quantidade: count,
            percentual: ((count / companies.length) * 100).toFixed(1)
          }))
          .sort((a, b) => b.quantidade - a.quantidade)
        
        // Criar resumo
        const topSector = sectorData[0]
        const summary = `Análise do portfólio: Total de ${companies.length} empresas em ${sectorData.length} setores. ` +
          `Setor mais representado: ${topSector.setor} com ${topSector.quantidade} empresa${topSector.quantidade !== 1 ? 's' : ''} (${topSector.percentual}%).`
        
        console.log('[DatabaseQueryAgent] Portfolio analysis result:', { 
          totalCompanies: companies.length, 
          sectors: sectorData.length,
          topSector: topSector.setor
        })
        
        return {
          success: true,
          results: sectorData,
          summary: summary,
          isAggregate: true,
          isGrouped: true,
          chartConfig: {
            chartType: 'bar',
            xColumn: 'setor',
            yColumn: 'quantidade',
            title: 'Distribuição de Empresas por Setor'
          }
        }
      }
      
      // Fallback para outras consultas agregadas
      return {
        success: true,
        results: [],
        summary: 'Consulta agregada não suportada ainda',
        isAggregate: true
      }
    } catch (error) {
      console.error('[DatabaseQueryAgent] Error in handleAggregateQuery:', error)
      return {
        success: false,
        error: error.message || 'Erro ao calcular agregação',
        results: [],
        isAggregate: true
      }
    }
  }

  /**
   * Lida com consultas sobre empresas sem colaboradores
   */
  async handleCompaniesWithoutEmployeesQuery(text, user, params) {
    console.log('[BMAD:DatabaseQueryAgent] 🏢 Handling companies without employees query:', { text, hasUser: !!user })
    try {
      // Buscar todas as empresas
      const { CompanyService } = await import('../../../services/companyService')
      let userIsAdmin = false
      try {
        const { ClientService } = await import('../../../services/clientService')
        const clientResult = await ClientService.getClientByUserId(user?.id)
        if (clientResult.success && clientResult.client) {
          userIsAdmin = clientResult.client.role === 'admin'
        }
      } catch (e) {
        console.warn('[DatabaseQueryAgent] Error checking admin status:', e)
      }
      
      const companiesResult = await CompanyService.getUserCompanies(user?.id, userIsAdmin)
      const companies = companiesResult.companies || []
      
      if (companies.length === 0) {
        return {
          success: true,
          results: [],
          summary: 'Nenhuma empresa encontrada',
          companiesWithoutEmployees: 0,
          totalCompanies: 0
        }
      }
      
      // Buscar colaboradores de cada empresa
      const { EmployeeService } = await import('../../../services/employeeService')
      const companiesWithoutEmployees = []
      
      for (const company of companies) {
        try {
          const employeesResult = await EmployeeService.getCompanyEmployees(company.id)
          const employees = employeesResult.employees || []
          if (employees.length === 0) {
            companiesWithoutEmployees.push({
              id: company.id,
              name: company.company_name || company.trade_name,
              cnpj: company.cnpj
            })
          }
        } catch (e) {
          console.warn(`[DatabaseQueryAgent] Error fetching employees for company ${company.id}:`, e)
          // Se não conseguir buscar, considerar como sem colaboradores
          companiesWithoutEmployees.push({
            id: company.id,
            name: company.company_name || company.trade_name,
            cnpj: company.cnpj
          })
        }
      }
      
      const count = companiesWithoutEmployees.length
      const summary = count > 0 
        ? `Sim, existem ${count} empresa${count !== 1 ? 's' : ''} sem colaborador${count !== 1 ? 'es' : ''} cadastrado${count !== 1 ? 's' : ''}.`
        : 'Não, todas as empresas têm pelo menos um colaborador cadastrado.'
      
      console.log('[BMAD:DatabaseQueryAgent] ✅ Companies without employees query result:', { 
        count, 
        totalCompanies: companies.length,
        summary: summary.substring(0, 100)
      })
      
      // Criar visualização de card para empresas sem colaboradores
      const visualizationData = count > 0 
        ? [{
            label: 'Empresas sem Colaboradores',
            value: count,
            companies: companiesWithoutEmployees.map(c => c.name).join(', ')
          }]
        : [{
            label: 'Todas as empresas têm colaboradores',
            value: 0
          }]
      
      return {
        success: true,
        results: companiesWithoutEmployees,
        summary: summary,
        companiesWithoutEmployees: count,
        totalCompanies: companies.length,
        isCount: true,
        visualizationData: visualizationData
      }
    } catch (error) {
      console.error('[BMAD:DatabaseQueryAgent] ❌ Error in handleCompaniesWithoutEmployeesQuery:', error)
      return {
        success: false,
        error: error.message || 'Erro ao verificar empresas sem colaboradores',
        results: []
      }
    }
  }

  /**
   * Lida com consultas de gráficos temporais
   */
  async handleTimeSeriesQuery(text, user, params) {
    console.log('[DatabaseQueryAgent] handleTimeSeriesQuery called:', { text, hasUser: !!user })
    try {
      const lowerText = text.toLowerCase()
      
      // Detectar gráfico de cadastramento de empresas por período
      // Melhorar detecção: aceitar "gráfico de empresas" ou "empresas por período"
      const hasEmpresa = lowerText.includes('empresa')
      const hasGrafico = lowerText.includes('gráfico') || lowerText.includes('grafico')
      const hasPeriodo = lowerText.includes('período') || lowerText.includes('periodo') || lowerText.includes('por data') || lowerText.includes('por mês') || lowerText.includes('por ano')
      const hasCadastro = lowerText.includes('cadastramento') || lowerText.includes('cadastro') || lowerText.includes('cadastradas')
      
      if (hasEmpresa && (hasGrafico || hasPeriodo) && (hasCadastro || hasPeriodo)) {
        console.log('[DatabaseQueryAgent] Detected company registration chart query')
        
        // Buscar todas as empresas
        const { CompanyService } = await import('../../../services/companyService')
        let userIsAdmin = false
        try {
          const { ClientService } = await import('../../../services/clientService')
          const clientResult = await ClientService.getClientByUserId(user?.id)
          if (clientResult.success && clientResult.client) {
            userIsAdmin = clientResult.client.role === 'admin'
          }
        } catch (e) {
          console.warn('[DatabaseQueryAgent] Error checking admin status:', e)
        }
        
        const companiesResult = await CompanyService.getUserCompanies(user?.id, userIsAdmin)
        const companies = companiesResult.companies || []
        
        if (companies.length === 0) {
          return {
            success: true,
            results: [],
            summary: 'Nenhuma empresa encontrada para gerar gráfico',
            isTimeSeries: true
          }
        }
        
        // Agrupar empresas por período (mês/ano)
        const byPeriod = {}
        companies.forEach(company => {
          if (company.created_at) {
            const date = new Date(company.created_at)
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            if (!byPeriod[period]) {
              byPeriod[period] = 0
            }
            byPeriod[period]++
          }
        })
        
        // Converter para formato de gráfico
        const chartData = Object.entries(byPeriod)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([period, count]) => ({
            period,
            count,
            label: period
          }))
        
        return {
          success: true,
          results: chartData,
          summary: `Gráfico de cadastramento de empresas por período. Total de ${companies.length} empresas em ${chartData.length} períodos.`,
          isTimeSeries: true,
          chartConfig: {
            chartType: 'line',
            xColumn: 'period',
            yColumn: 'count',
            title: 'Cadastramento de Empresas por Período'
          }
        }
      }
      
      // Fallback: tentar gerar gráfico genérico de empresas por período mesmo sem palavras-chave específicas
      if (lowerText.includes('empresa') && (lowerText.includes('período') || lowerText.includes('periodo') || lowerText.includes('por data') || lowerText.includes('por mês'))) {
        console.log('[DatabaseQueryAgent] Attempting generic company time series query')
        const { CompanyService } = await import('../../../services/companyService')
        let userIsAdmin = false
        try {
          const { ClientService } = await import('../../../services/clientService')
          const clientResult = await ClientService.getClientByUserId(user?.id)
          if (clientResult.success && clientResult.client) {
            userIsAdmin = clientResult.client.role === 'admin'
          }
        } catch (e) {
          console.warn('[DatabaseQueryAgent] Error checking admin status:', e)
        }
        
        const companiesResult = await CompanyService.getUserCompanies(user?.id, userIsAdmin)
        const companies = companiesResult.companies || []
        
        if (companies.length === 0) {
          return {
            success: true,
            results: [],
            summary: 'Nenhuma empresa encontrada para gerar gráfico',
            isTimeSeries: true
          }
        }
        
        // Agrupar empresas por período (mês/ano)
        const byPeriod = {}
        companies.forEach(company => {
          if (company.created_at) {
            const date = new Date(company.created_at)
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            if (!byPeriod[period]) {
              byPeriod[period] = 0
            }
            byPeriod[period]++
          }
        })
        
        const chartData = Object.entries(byPeriod)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([period, count]) => ({
            period,
            count,
            label: period
          }))
        
        return {
          success: true,
          results: chartData,
          summary: `Gráfico de empresas por período. Total de ${companies.length} empresas em ${chartData.length} períodos.`,
          isTimeSeries: true,
          chartConfig: {
            chartType: 'line',
            xColumn: 'period',
            yColumn: 'count',
            title: 'Empresas por Período'
          }
        }
      }
      
      // Fallback para outras consultas temporais
      return {
        success: true,
        results: [],
        summary: 'Consulta temporal não suportada ainda',
        isTimeSeries: true
      }
    } catch (error) {
      console.error('[DatabaseQueryAgent] Error in handleTimeSeriesQuery:', error)
      return {
        success: false,
        error: error.message || 'Erro ao gerar gráfico temporal',
        results: [],
        isTimeSeries: true
      }
    }
  }

  /**
   * Lida com consultas de contagem usando serviços apropriados
   */
  async handleCountQuery(text, user, params) {
    console.log('[DatabaseQueryAgent] handleCountQuery called:', { text, hasUser: !!user, userId: user?.id })
    
    try {
      const lowerText = text.toLowerCase()
      
      // Detectar qual tabela está sendo consultada
      if (lowerText.includes('empresa')) {
        console.log('[DatabaseQueryAgent] Detected companies count query')
        const { CompanyService } = await import('../../../services/companyService')
        let userIsAdmin = false
        try {
          const { ClientService } = await import('../../../services/clientService')
          console.log('[DatabaseQueryAgent] Checking admin status for user:', user?.id)
          const clientResult = await ClientService.getClientByUserId(user?.id)
          if (clientResult.success && clientResult.client) {
            userIsAdmin = clientResult.client.role === 'admin'
            console.log('[DatabaseQueryAgent] User admin status:', userIsAdmin)
          }
        } catch (e) {
          console.warn('[DatabaseQueryAgent] Error checking admin status:', e)
        }
        
        console.log('[DatabaseQueryAgent] Fetching companies for user:', user?.id, 'isAdmin:', userIsAdmin)
        const result = await CompanyService.getUserCompanies(user?.id, userIsAdmin)
        console.log('[DatabaseQueryAgent] CompanyService result:', { success: result?.success, companiesCount: result?.companies?.length })
        
        if (result.success && result.companies) {
          const count = result.companies.length
          console.log('[DatabaseQueryAgent] Count query successful:', count)
          return {
            success: true,
            results: [{ count, type: 'companies', label: 'Empresas' }],
            summary: `Total de empresas: ${count}`,
            vectorSearchUsed: false,
            isCount: true
          }
        } else {
          console.warn('[DatabaseQueryAgent] CompanyService returned no companies:', result)
          return {
            success: true,
            results: [{ count: 0, type: 'companies', label: 'Empresas' }],
            summary: 'Total de empresas: 0',
            vectorSearchUsed: false,
            isCount: true
          }
        }
      }
      
      // Para outras tabelas, usar busca semântica e contar resultados
      console.log('[DatabaseQueryAgent] Using semantic search for count query')
      const vectorResults = await this.vectorSearch.semanticSearch(text, params?.tableName, 100)
      const count = vectorResults.results?.length || 0
      console.log('[DatabaseQueryAgent] Semantic search count:', count)
      
      return {
        success: true,
        results: [{ count, type: 'general', label: 'Registros encontrados' }],
        summary: `Total encontrado: ${count}`,
        vectorSearchUsed: true,
        isCount: true
      }
    } catch (error) {
      console.error('[DatabaseQueryAgent] Error in handleCountQuery:', error)
      return {
        success: false,
        error: error.message || 'Erro ao processar consulta de contagem',
        results: [],
        stack: error.stack
      }
    }
  }

  /**
   * Método para o especialista "conhecer" todos os dados
   * Retorna um resumo de todos os registros vetorizados
   */
  async getAllData(user, context = {}) {
    try {
      console.log('[DatabaseQueryAgent] Getting all vectorized data for specialist knowledge...')
      
      // Buscar todos os embeddings (limitado para não sobrecarregar)
      const { data: embeddings, error } = await supabase
        .from('data_embeddings')
        .select('table_name, record_id, chunk_text, metadata')
        .not('embedding', 'is', null)
        .limit(500) // Limitar para performance

      if (error) {
        console.error('[DatabaseQueryAgent] Error fetching embeddings:', error)
        throw error
      }

      if (!embeddings || embeddings.length === 0) {
        return {
          success: true,
          results: [],
          summary: 'Nenhum dado vetorizado encontrado. Execute a vetorização primeiro.',
          totalRecords: 0
        }
      }

      // Agrupar por tabela
      const byTable = {}
      embeddings.forEach(emb => {
        if (!byTable[emb.table_name]) {
          byTable[emb.table_name] = []
        }
        byTable[emb.table_name].push({
          id: emb.record_id,
          text: emb.chunk_text,
          metadata: emb.metadata || {}
        })
      })

      // Formatar resultados
      const results = Object.entries(byTable).map(([tableName, records]) => ({
        table: tableName,
        count: records.length,
        records: records.slice(0, 50), // Limitar registros por tabela
        sample: records[0]?.text?.substring(0, 200) || ''
      }))

      const totalRecords = embeddings.length

      return {
        success: true,
        results,
        summary: `Encontrados ${totalRecords} registros vetorizados em ${Object.keys(byTable).length} tabelas`,
        totalRecords,
        byTable: Object.fromEntries(
          Object.entries(byTable).map(([table, records]) => [table, records.length])
        )
      }
    } catch (error) {
      console.error('[DatabaseQueryAgent] Error in getAllData:', error)
      return {
        success: false,
        error: error.message,
        results: []
      }
    }
  }

  /**
   * Método compatível com o orchestrator (executeQuery)
   */
  async executeQuery(intent, params, user, context) {
    console.log('[DatabaseQueryAgent] executeQuery called:', { intent, params, hasUser: !!user, hasContext: !!context })
    
    try {
      // Se for uma consulta para "conhecer" todos os dados
      if (intent === 'get_all_data' || intent === 'know_all_data' || params?.getAll) {
        console.log('[DatabaseQueryAgent] Getting all data...')
        return await this.getAllData(user, context)
      }

      // Caso contrário, usar busca semântica normal
      const queryText = params?.query || params?.text || intent
      console.log('[DatabaseQueryAgent] Processing query:', { queryText, intent })
      const result = await this.query(queryText, user, context, params)
      console.log('[DatabaseQueryAgent] Query result:', { success: result?.success, hasResults: !!result?.results, error: result?.error, summary: result?.summary })
      return result
    } catch (error) {
      console.error('[DatabaseQueryAgent] Error in executeQuery:', error)
      return {
        success: false,
        error: error.message || 'Erro ao executar consulta',
        results: []
      }
    }
  }

  determineSearchStrategy(text) {
    if (!text || typeof text !== 'string') return 'default'
    
    const lowerText = text.toLowerCase()
    
    // Palavras que FORÇAM busca SQL (consultas muito específicas)
    const sqlOnlyKeywords = ['quantas', 'quantos', 'total', 'soma', 'média', 'contar', 'count', 'sum', 'avg']
    const hasSQLOnly = sqlOnlyKeywords.some(kw => lowerText.includes(kw))
    
    // Palavras que indicam busca semântica explícita
    const semanticKeywords = ['similar', 'parecido', 'relacionado', 'semelhante', 'perfil', 'potencial', 'encontrar', 'buscar', 'procurar']
    const hasSemantic = semanticKeywords.some(kw => lowerText.includes(kw))
    
    // Se tiver palavras SQL-only E não tiver palavras semânticas, usar SQL
    if (hasSQLOnly && !hasSemantic) return 'sql'
    
    // Se tiver palavras semânticas, usar busca vetorial
    if (hasSemantic) return 'vector'
    
    // Padrão: usar busca semântica (permite que o especialista "conheça" os dados)
    return 'default'
  }

  async executeSQLQuery(text, user, params = {}) {
    try {
      const tableName = params?.tableName || 'companies'
      const limit = params?.limit || 20
      
      // Usar serviços existentes em vez de queries diretas para evitar problemas de RLS
      if (tableName === 'companies') {
        const { CompanyService } = await import('../../../services/companyService')
        // Verificar se é admin
        let userIsAdmin = false
        try {
          const { ClientService } = await import('../../../services/clientService')
          const clientResult = await ClientService.getClientByUserId(user?.id)
          if (clientResult.success && clientResult.client) {
            userIsAdmin = clientResult.client.role === 'admin'
          }
        } catch (e) {
          console.warn('Error checking admin status:', e)
        }
        
        const result = await CompanyService.getUserCompanies(user?.id, userIsAdmin)
        if (result.success && result.companies) {
          return result.companies.slice(0, limit)
        }
        return []
      }
      
      // Para outras tabelas, usar query direta mas com cuidado
      // Especificar colunas explicitamente para evitar ambiguidade
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(limit)
      
      if (error) {
        console.error(`SQL query error for table ${tableName}:`, error)
        // Se houver erro de ambiguidade, tentar especificar colunas
        if (error.code === '42702' || error.message?.includes('ambiguous')) {
          console.warn(`Ambiguous column error, trying alternative query for ${tableName}`)
          // Retornar vazio e deixar busca semântica lidar com isso
          return []
        }
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('SQL query error:', error)
      return []
    }
  }

  formatVectorResults(vectorResults) {
    // Formatar resultados da busca vetorial para um formato mais útil
    return vectorResults.map(result => ({
      id: result.record_id,
      table: result.table_name,
      text: result.chunk_text,
      similarity: result.similarity,
      ...(result.metadata || {}),
      _fromVector: true,
      _similarity: result.similarity
    }))
  }

  combineResults(vectorResults, sqlResults) {
    // Combinar e deduplicar resultados
    const combined = [...sqlResults]
    const sqlIds = new Set(sqlResults.map(r => r.id || r.record_id))
    
    const formattedVector = this.formatVectorResults(vectorResults)
    
    formattedVector.forEach(result => {
      if (!sqlIds.has(result.id)) {
        combined.push(result)
      }
    })
    
    // Ordenar por relevância (similaridade) se disponível
    return combined.sort((a, b) => {
      if (a._similarity && b._similarity) {
        return b._similarity - a._similarity
      }
      return 0
    })
  }

  /**
   * Executa uma consulta baseada no plano gerado pela IA
   */
  async executePlannedQuery(queryPlan, text, user, params) {
    console.log('[BMAD:DatabaseQueryAgent] 🎯 Executing planned query:', queryPlan)
    
    try {
      switch (queryPlan.queryType) {
        case 'count':
          return await this.handleCountQuery(text, user, params)
        
        case 'aggregate':
          if (queryPlan.aggregationType === 'avg') {
            return await this.handleAggregateQuery(text, user, params)
          }
          // Outros tipos de agregação podem ser adicionados aqui
          return await this.handleAggregateQuery(text, user, params)
        
        case 'timeSeries':
          return await this.handleTimeSeriesQuery(text, user, params)
        
        case 'semantic':
          if (queryPlan.needsEmbedding) {
            const limit = params?.limit || 20
            const tableName = queryPlan.tables?.[0] || null
            const vectorResults = await this.vectorSearch.semanticSearch(text, tableName, limit)
            return {
              success: true,
              results: this.formatVectorResults(vectorResults.results || []),
              summary: vectorResults.summary || 'Resultados encontrados via busca semântica',
              vectorSearchUsed: true,
              totalResults: vectorResults.results?.length || 0
            }
          }
          // Fallback para SQL se não precisar embedding
          return await this.executeSQLQuery(text, user, params)
        
        case 'sql':
        case 'crossTable':
        default:
          return await this.executeSQLQuery(text, user, params)
      }
    } catch (error) {
      console.error('[BMAD:DatabaseQueryAgent] ❌ Error executing planned query:', error)
      // Fallback para busca semântica
      const limit = params?.limit || 20
      const vectorResults = await this.vectorSearch.semanticSearch(text, null, limit)
      return {
        success: true,
        results: this.formatVectorResults(vectorResults.results || []),
        summary: vectorResults.summary || 'Resultados encontrados',
        vectorSearchUsed: true
      }
    }
  }
}

