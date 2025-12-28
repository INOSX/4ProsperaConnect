/**
 * DatabaseQueryAgent - Consultas ao banco de dados com busca SQL e vetorial
 * Permite que o especialista "conheça" e processe todos os registros do banco
 */
import { supabase } from '../../../services/supabase'
import VectorSearchService from '../services/VectorSearchService.js'

export default class DatabaseQueryAgent {
  constructor() {
    this.vectorSearch = new VectorSearchService()
  }

  /**
   * Método principal para consultas - usa busca semântica como padrão
   */
  async query(text, user, context, params) {
    try {
      // Detectar tipo de consulta
      const isCountQuery = this.isCountQuery(text)
      const isAggregateQuery = this.isAggregateQuery(text)
      const isTimeSeriesQuery = this.isTimeSeriesQuery(text)
      
      if (isCountQuery) {
        // Para consultas de contagem, usar SQL direto
        return await this.handleCountQuery(text, user, params)
      }
      
      if (isAggregateQuery) {
        // Para consultas agregadas (média, soma, etc)
        return await this.handleAggregateQuery(text, user, params)
      }
      
      if (isTimeSeriesQuery) {
        // Para consultas de gráficos temporais
        return await this.handleTimeSeriesQuery(text, user, params)
      }
      
      // Detectar consultas sobre empresas sem colaboradores
      if (this.isCompaniesWithoutEmployeesQuery(text)) {
        return await this.handleCompaniesWithoutEmployeesQuery(text, user, params)
      }
      
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
    const keywords = ['empresa', 'empresas']
    const negativeKeywords = ['sem colaborador', 'sem funcionário', 'sem empregado', 'sem cadastrado', 'não tem', 'não têm', 'sem ter']
    return keywords.some(kw => lowerText.includes(kw)) && 
           negativeKeywords.some(kw => lowerText.includes(kw))
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
    console.log('[DatabaseQueryAgent] handleCompaniesWithoutEmployeesQuery called:', { text, hasUser: !!user })
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
      
      return {
        success: true,
        results: companiesWithoutEmployees,
        summary: summary,
        companiesWithoutEmployees: count,
        totalCompanies: companies.length,
        isCount: true
      }
    } catch (error) {
      console.error('[DatabaseQueryAgent] Error in handleCompaniesWithoutEmployeesQuery:', error)
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
      if (lowerText.includes('empresa') && (lowerText.includes('cadastramento') || lowerText.includes('cadastro'))) {
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
          chartType: 'line',
          chartConfig: {
            xColumn: 'period',
            yColumn: 'count',
            title: 'Cadastramento de Empresas por Período'
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
}

