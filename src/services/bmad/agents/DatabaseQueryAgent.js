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
   * Método principal para consultas - 100% baseado no plano da IA
   * NÃO há queries fixas no código - tudo é decidido pela IA do QueryPlanningAgent
   */
  async query(text, user, context, params) {
    try {
      console.log('[OPX:DatabaseQueryAgent] 🔍 ========== PROCESSANDO CONSULTA ==========')
      console.log('[OPX:DatabaseQueryAgent] 📝 Query:', text?.substring(0, 100))
      
      // SEMPRE usar QueryPlanningAgent para planejar a consulta com IA
      console.log('[OPX:DatabaseQueryAgent] 🧠 Consultando IA para planejar query...')
      let queryPlan = null
      try {
        queryPlan = await this.planningAgent.planQuery(text, 'query_database', context)
        console.log('[OPX:DatabaseQueryAgent] ✅ Plano da IA recebido:', {
          queryType: queryPlan.queryType,
          strategy: queryPlan.strategy,
          confidence: queryPlan.confidence,
          hasSqlQuery: !!queryPlan.sqlQuery
        })
      } catch (planError) {
        console.error('[OPX:DatabaseQueryAgent] ❌ Erro ao planejar query com IA:', planError)
        queryPlan = null
      }
      
      // Se temos um plano da IA (mesmo com baixa confiança), usar ele
      if (queryPlan) {
        console.log('[OPX:DatabaseQueryAgent] 📋 Executando plano da IA...')
        return await this.executePlannedQuery(queryPlan, text, user, params)
      }
      
      // Fallback genérico: apenas busca semântica (sem queries fixas)
      console.log('[OPX:DatabaseQueryAgent] ⚠️ Nenhum plano da IA disponível, usando busca semântica genérica como fallback...')
      const limit = params?.limit || 20
      const tableName = params?.tableName || null
      const vectorResults = await this.vectorSearch.semanticSearch(text, tableName, limit)
      
      return {
        success: true,
        results: this.formatVectorResults(vectorResults.results || []),
        summary: vectorResults.summary || 'Resultados encontrados via busca semântica',
        vectorSearchUsed: true,
        totalResults: vectorResults.results?.length || 0
      }
    } catch (error) {
      console.error('[OPX:DatabaseQueryAgent] ❌ Erro ao processar consulta:', error)
      return {
        success: false,
        error: error.message,
        results: []
      }
    }
  }

  /**
   * REMOVIDO: Todos os métodos de detecção e execução fixa foram removidos.
   * A IA do QueryPlanningAgent decide TUDO dinamicamente.
   * Não há mais queries fixas no código.
   * 
   * Métodos removidos:
   * - isCountQuery()
   * - isAggregateQuery()
   * - isTimeSeriesQuery()
   * - isCompaniesWithoutEmployeesQuery()
   * - handleCountQuery()
   * - handleAggregateQuery()
   * - handleTimeSeriesQuery()
   * - handleCompaniesWithoutEmployeesQuery()
   * - determineSearchStrategy()
   * 
   * Tudo é decidido pela IA do QueryPlanningAgent agora.
   */

  /**
   * Executa uma consulta baseada no plano gerado pela IA - 100% DINÂMICO
   * NÃO há queries fixas - tudo é decidido pela IA
   */

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

  /**
   * REMOVIDO: determineSearchStrategy() - A IA do QueryPlanningAgent decide a estratégia
   */

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
   * Executa uma consulta baseada no plano gerado pela IA - DINÂMICO
   * DECISÃO INTELIGENTE: Respeita a estratégia determinada pela IA (semantic, sql, hybrid)
   * - semantic: Usa vectorstore (busca semântica)
   * - sql: Usa SQL direto (agregações, contagens, agrupamentos)
   * - hybrid: Combina ambos (busca semântica + SQL)
   */
  async executePlannedQuery(queryPlan, text, user, params) {
    console.log('[OPX:DatabaseQueryAgent] 🎯 ========== EXECUTANDO QUERY PLANEJADA PELA IA ==========')
    console.log('[OPX:DatabaseQueryAgent] 📋 Plano recebido:', {
      queryType: queryPlan.queryType,
      strategy: queryPlan.strategy,
      hasSqlQuery: !!queryPlan.sqlQuery,
      sqlQuery: queryPlan.sqlQuery?.substring(0, 200),
      groupBy: queryPlan.groupBy,
      tables: queryPlan.tables,
      needsEmbedding: queryPlan.needsEmbedding
    })
    
    try {
      const strategy = queryPlan.strategy || 'semantic'
      console.log('[OPX:DatabaseQueryAgent] 🎯 Estratégia determinada pela IA:', strategy)
      
      // DECISÃO 1: ESTRATÉGIA SEMANTIC (Vectorstore)
      if (strategy === 'semantic' || (queryPlan.needsEmbedding && !queryPlan.sqlQuery)) {
        console.log('[OPX:DatabaseQueryAgent] 🔍 ========== EXECUTANDO NO VECTORSTORE ==========')
        console.log('[OPX:DatabaseQueryAgent] 🔍 Usando busca semântica no vectorstore...')
        
        const limit = params?.limit || 20
        const tableName = queryPlan.tables?.[0] || params?.tableName || null
        console.log('[OPX:DatabaseQueryAgent] 🔍 Parâmetros da busca:', { limit, tableName, query: text?.substring(0, 100) })
        
        const vectorResults = await this.vectorSearch.semanticSearch(text, tableName, limit)
        console.log('[OPX:DatabaseQueryAgent] ✅ Resultados do vectorstore:', {
          resultsCount: vectorResults.results?.length || 0,
          hasResults: !!vectorResults.results && vectorResults.results.length > 0,
          summary: vectorResults.summary?.substring(0, 100)
        })
        
        return {
          success: true,
          results: this.formatVectorResults(vectorResults.results || []),
          summary: vectorResults.summary || 'Resultados encontrados via busca semântica',
          vectorSearchUsed: true,
          totalResults: vectorResults.results?.length || 0,
          strategy: 'semantic'
        }
      }
      
      // DECISÃO 2: ESTRATÉGIA SQL (Queries SQL diretas)
      if (strategy === 'sql' || queryPlan.sqlQuery || 
          ['aggregate', 'groupBy', 'timeSeries', 'count', 'crossTable'].includes(queryPlan.queryType)) {
        console.log('[OPX:DatabaseQueryAgent] 📊 ========== EXECUTANDO QUERY SQL ==========')
        
        // PRIORIDADE 1: Se a IA gerou uma SQL query completa, executá-la diretamente
        if (queryPlan.sqlQuery && queryPlan.sqlQuery.trim()) {
          console.log('[OPX:DatabaseQueryAgent] ✅ ========== QUERY SQL GERADA PELA IA ENCONTRADA ==========')
          console.log('[OPX:DatabaseQueryAgent] 📝 Query SQL completa:', queryPlan.sqlQuery)
          console.log('[OPX:DatabaseQueryAgent] 📊 Tipo de query:', queryPlan.queryType)
          console.log('[OPX:DatabaseQueryAgent] 📊 Estratégia:', strategy)
          console.log('[OPX:DatabaseQueryAgent] 📊 Tabelas:', queryPlan.tables)
          console.log('[OPX:DatabaseQueryAgent] 🚀 Executando SQL query diretamente via RPC...')
          
          try {
            const sqlQueryToExecute = queryPlan.sqlQuery.trim()
            console.log('[OPX:DatabaseQueryAgent] 📤 Preparando chamada RPC...')
            console.log('[OPX:DatabaseQueryAgent] 📤 Query a ser executada (primeiros 200 chars):', sqlQueryToExecute.substring(0, 200))
            console.log('[OPX:DatabaseQueryAgent] 📤 Tamanho da query:', sqlQueryToExecute.length, 'caracteres')
            
            const rpcStartTime = Date.now()
            const { data, error } = await supabase.rpc('execute_dynamic_sql', {
              sql_query: sqlQueryToExecute
            })
            const rpcDuration = Date.now() - rpcStartTime
            
            console.log('[OPX:DatabaseQueryAgent] 📥 Resposta RPC recebida em', rpcDuration + 'ms')
            console.log('[OPX:DatabaseQueryAgent] 📥 Status:', error ? 'ERRO' : 'SUCESSO')
            
            if (error) {
              console.error('[OPX:DatabaseQueryAgent] ❌ ========== ERRO NA RESPOSTA RPC ==========')
              console.error('[OPX:DatabaseQueryAgent] ❌ Erro completo:', JSON.stringify(error, null, 2))
              console.error('[OPX:DatabaseQueryAgent] ❌ Código:', error.code)
              console.error('[OPX:DatabaseQueryAgent] ❌ Mensagem:', error.message)
              console.error('[OPX:DatabaseQueryAgent] ❌ Detalhes:', error.details)
              console.error('[OPX:DatabaseQueryAgent] ❌ Hint:', error.hint)
              throw error
            }
            
            console.log('[OPX:DatabaseQueryAgent] 📦 Dados recebidos:', {
              hasData: !!data,
              dataType: typeof data,
              isArray: Array.isArray(data),
              isObject: typeof data === 'object' && data !== null,
              hasError: data && typeof data === 'object' && data.error,
              dataKeys: data && typeof data === 'object' ? Object.keys(data) : null
            })
            
            // Verificar se há erro na resposta JSON
            if (data && typeof data === 'object' && data.error) {
              console.error('[OPX:DatabaseQueryAgent] ❌ ========== ERRO NA EXECUÇÃO SQL (JSON) ==========')
              console.error('[OPX:DatabaseQueryAgent] ❌ Erro:', data.message)
              console.error('[OPX:DatabaseQueryAgent] ❌ Código:', data.code)
              console.error('[OPX:DatabaseQueryAgent] ❌ Detalhes:', data.detail)
              throw new Error(data.message || 'Erro ao executar query SQL')
            }
            
            const results = Array.isArray(data) ? data : (data ? [data] : [])
            console.log('[OPX:DatabaseQueryAgent] ✅ ========== SQL EXECUTADA COM SUCESSO ==========')
            console.log('[OPX:DatabaseQueryAgent] ✅ Resultados encontrados:', results.length)
            console.log('[OPX:DatabaseQueryAgent] ✅ Primeiro resultado:', results[0] || null)
            console.log('[OPX:DatabaseQueryAgent] ✅ Todos os resultados:', JSON.stringify(results, null, 2))
            
            // Formatar resultado baseado no tipo de query
            const isAggregate = queryPlan.queryType === 'aggregate' || !!queryPlan.aggregationType
            const isGrouped = !!queryPlan.groupBy || queryPlan.sqlQuery.toLowerCase().includes('group by')
            const isCount = queryPlan.queryType === 'count' || queryPlan.sqlQuery.toLowerCase().includes('count(')
            const isList = queryPlan.queryType === 'list' && !isGrouped && !isAggregate
            
            console.log('[OPX:DatabaseQueryAgent] 📊 Classificação do resultado:', {
              isAggregate,
              isGrouped,
              isCount,
              isList,
              queryType: queryPlan.queryType,
              aggregationType: queryPlan.aggregationType,
              groupBy: queryPlan.groupBy
            })
            
            const formattedResult = {
              success: true,
              results: results,
              summary: queryPlan.description || `Encontrados ${results.length} resultados.`,
              vectorSearchUsed: false,
              strategy: 'sql',
              isAggregate: isAggregate,
              isGrouped: isGrouped,
              isCount: isCount,
              isList: isList,
              chartConfig: isGrouped ? {
                chartType: queryPlan.queryType === 'timeSeries' ? 'line' : 'bar',
                xColumn: queryPlan.groupBy || queryPlan.selectFields?.[0] || Object.keys(results[0] || {})[0],
                yColumn: queryPlan.aggregationType === 'count' ? 'quantidade' : queryPlan.selectFields?.[1] || Object.keys(results[0] || {})[1],
                title: queryPlan.description || 'Resultados da consulta'
              } : undefined
            }
            
            console.log('[OPX:DatabaseQueryAgent] 📋 Resultado formatado:', JSON.stringify(formattedResult, null, 2))
            return formattedResult
          } catch (rpcError) {
            console.error('[OPX:DatabaseQueryAgent] ❌ ========== ERRO AO EXECUTAR SQL VIA RPC ==========')
            console.error('[OPX:DatabaseQueryAgent] ❌ Tipo do erro:', typeof rpcError)
            console.error('[OPX:DatabaseQueryAgent] ❌ Erro completo:', rpcError)
            console.error('[OPX:DatabaseQueryAgent] ❌ Mensagem:', rpcError.message)
            console.error('[OPX:DatabaseQueryAgent] ❌ Stack:', rpcError.stack)
            if (rpcError.code) {
              console.error('[OPX:DatabaseQueryAgent] ❌ Código do erro:', rpcError.code)
            }
            if (rpcError.details) {
              console.error('[OPX:DatabaseQueryAgent] ❌ Detalhes:', rpcError.details)
            }
            if (rpcError.hint) {
              console.error('[OPX:DatabaseQueryAgent] ❌ Hint:', rpcError.hint)
            }
            console.log('[OPX:DatabaseQueryAgent] 🔄 Tentando fallback para métodos dinâmicos...')
            
            // Fallback: tentar métodos dinâmicos se RPC falhar
            // (manter lógica antiga como fallback)
          }
        }
        
        // PRIORIDADE 2: Se não há SQL query, usar métodos dinâmicos (fallback)
        try {
          // Se tem GROUP BY, usar método de agrupamento dinâmico
          if (queryPlan.groupBy || (queryPlan.sqlQuery && queryPlan.sqlQuery.toLowerCase().includes('group by'))) {
            console.log('[OPX:DatabaseQueryAgent] 📊 Query tem GROUP BY, executando agrupamento dinâmico...')
            const result = await this.executeDynamicGroupBy(queryPlan, user, params)
            return { ...result, strategy: 'sql' }
          }
          
          // Se é agregação, usar método de agregação dinâmica
          if (queryPlan.queryType === 'aggregate' || queryPlan.aggregationType) {
            console.log('[OPX:DatabaseQueryAgent] 📊 Query é agregação, executando agregação dinâmica...')
            const result = await this.executeDynamicAggregate(queryPlan, user, params)
            return { ...result, strategy: 'sql' }
          }
          
          // Se é série temporal, usar método dinâmico de agrupamento temporal
          if (queryPlan.queryType === 'timeSeries' || queryPlan.timeGrouping) {
            console.log('[OPX:DatabaseQueryAgent] 📊 Query é série temporal, executando agrupamento temporal dinâmico...')
            // Usar executeDynamicGroupBy com timeGrouping
            const timePlan = { ...queryPlan, groupBy: queryPlan.timeGrouping || 'created_at' }
            return await this.executeDynamicGroupBy(timePlan, user, params)
          }
          
          // Se é contagem simples, usar método dinâmico baseado no plano
          if (queryPlan.queryType === 'count' || (queryPlan.sqlQuery && queryPlan.sqlQuery.toLowerCase().includes('count('))) {
            console.log('[OPX:DatabaseQueryAgent] 📊 Query é contagem, executando contagem dinâmica...')
            // Executar usando método dinâmico baseado no plano
            return await this.executeDynamicAggregate(queryPlan, user, params)
          }
          
          // Para outras queries SQL, usar método SQL padrão
          console.log('[OPX:DatabaseQueryAgent] 📊 Query SQL genérica, usando método SQL padrão...')
          const sqlResults = await this.executeSQLQuery(text, user, params)
          return {
            success: true,
            results: sqlResults,
            summary: queryPlan.description || `Encontrados ${sqlResults.length} resultados.`,
            vectorSearchUsed: false,
            strategy: 'sql'
          }
        } catch (sqlError) {
          console.error('[OPX:DatabaseQueryAgent] ❌ ========== ERRO AO EXECUTAR QUERY SQL ==========')
          console.error('[OPX:DatabaseQueryAgent] ❌ Erro:', sqlError)
          console.error('[OPX:DatabaseQueryAgent] ❌ Stack:', sqlError.stack)
          console.log('[OPX:DatabaseQueryAgent] 🔄 Tentando fallback para vectorstore...')
          
          // Fallback: tentar vectorstore se SQL falhar
          const limit = params?.limit || 20
          const tableName = queryPlan.tables?.[0] || null
          const vectorResults = await this.vectorSearch.semanticSearch(text, tableName, limit)
          return {
            success: true,
            results: this.formatVectorResults(vectorResults.results || []),
            summary: vectorResults.summary || 'Resultados encontrados via busca semântica (fallback)',
            vectorSearchUsed: true,
            strategy: 'semantic',
            fallback: true
          }
        }
      }
      
      // DECISÃO 3: ESTRATÉGIA HYBRID (Combina vectorstore + SQL)
      if (strategy === 'hybrid') {
        console.log('[OPX:DatabaseQueryAgent] 🔀 ========== EXECUTANDO ESTRATÉGIA HÍBRIDA ==========')
        console.log('[OPX:DatabaseQueryAgent] 🔀 Combinando busca semântica + SQL...')
        
        try {
          // Primeiro: busca semântica no vectorstore
          const limit = params?.limit || 20
          const tableName = queryPlan.tables?.[0] || null
          console.log('[OPX:DatabaseQueryAgent] 🔍 Passo 1: Busca semântica no vectorstore...')
          const vectorResults = await this.vectorSearch.semanticSearch(text, tableName, limit)
          
          // Segundo: query SQL complementar
          console.log('[OPX:DatabaseQueryAgent] 📊 Passo 2: Query SQL complementar...')
          const sqlResults = await this.executeSQLQuery(text, user, params)
          
          // Combinar resultados
          console.log('[OPX:DatabaseQueryAgent] 🔀 Passo 3: Combinando resultados...')
          const combinedResults = this.combineResults(vectorResults.results || [], sqlResults)
          
          console.log('[OPX:DatabaseQueryAgent] ✅ Resultados híbridos:', {
            vectorCount: vectorResults.results?.length || 0,
            sqlCount: sqlResults.length,
            combinedCount: combinedResults.length
          })
          
          return {
            success: true,
            results: combinedResults,
            summary: `Encontrados ${combinedResults.length} resultados (${vectorResults.results?.length || 0} semânticos + ${sqlResults.length} SQL)`,
            vectorSearchUsed: true,
            strategy: 'hybrid',
            totalResults: combinedResults.length
          }
        } catch (hybridError) {
          console.error('[OPX:DatabaseQueryAgent] ❌ Erro na estratégia híbrida:', hybridError)
          // Fallback: usar apenas vectorstore
          const limit = params?.limit || 20
          const vectorResults = await this.vectorSearch.semanticSearch(text, null, limit)
          return {
            success: true,
            results: this.formatVectorResults(vectorResults.results || []),
            summary: vectorResults.summary || 'Resultados encontrados via busca semântica',
            vectorSearchUsed: true,
            strategy: 'semantic',
            fallback: true
          }
        }
      }
      
      // FALLBACK: Se estratégia não reconhecida, usar vectorstore como padrão
      console.log('[OPX:DatabaseQueryAgent] ⚠️ Estratégia não reconhecida, usando vectorstore como padrão...')
      const limit = params?.limit || 20
      const tableName = queryPlan.tables?.[0] || null
      const vectorResults = await this.vectorSearch.semanticSearch(text, tableName, limit)
      return {
        success: true,
        results: this.formatVectorResults(vectorResults.results || []),
        summary: vectorResults.summary || 'Resultados encontrados via busca semântica',
        vectorSearchUsed: true,
        strategy: 'semantic',
        fallback: true
      }
    } catch (error) {
      console.error('[OPX:DatabaseQueryAgent] ❌ ========== ERRO AO EXECUTAR QUERY PLANEJADA ==========')
      console.error('[OPX:DatabaseQueryAgent] ❌ Erro:', error)
      console.error('[OPX:DatabaseQueryAgent] ❌ Stack:', error.stack)
      console.log('[OPX:DatabaseQueryAgent] 🔄 Usando fallback final (busca semântica)...')
      
      // Fallback final: busca semântica
      const limit = params?.limit || 20
      const vectorResults = await this.vectorSearch.semanticSearch(text, null, limit)
      return {
        success: true,
        results: this.formatVectorResults(vectorResults.results || []),
        summary: vectorResults.summary || 'Resultados encontrados',
        vectorSearchUsed: true,
        strategy: 'semantic',
        fallback: true
      }
    }
  }

  /**
   * Executa agrupamento dinâmico baseado no plano da IA
   */
  async executeDynamicGroupBy(queryPlan, user, params) {
    console.log('[OPX:DatabaseQueryAgent] 📊 ========== EXECUTANDO AGRUPAMENTO DINÂMICO ==========')
    console.log('[OPX:DatabaseQueryAgent] 📋 Plano recebido:', {
      groupBy: queryPlan.groupBy,
      tables: queryPlan.tables,
      aggregationType: queryPlan.aggregationType,
      selectFields: queryPlan.selectFields,
      filters: queryPlan.filters,
      executionSteps: queryPlan.executionSteps
    })
    
    try {
      const tableName = queryPlan.tables?.[0] || 'companies'
      const groupByField = queryPlan.groupBy
      
      console.log('[OPX:DatabaseQueryAgent] 🎯 Configuração:', {
        tableName,
        groupByField,
        userId: user?.id,
        userEmail: user?.email
      })
      
      // Buscar dados usando serviços apropriados
      if (tableName === 'companies') {
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
        
        console.log('[OPX:DatabaseQueryAgent] 🔍 Buscando empresas...')
        const companiesResult = await CompanyService.getUserCompanies(user?.id, userIsAdmin)
        const companies = companiesResult.companies || []
        
        console.log('[OPX:DatabaseQueryAgent] 📊 Empresas encontradas:', {
          total: companies.length,
          success: companiesResult.success,
          hasCompanies: companies.length > 0
        })
        
        if (companies.length === 0) {
          console.log('[OPX:DatabaseQueryAgent] ⚠️ Nenhuma empresa encontrada')
          return {
            success: true,
            results: [],
            summary: `Nenhuma empresa encontrada para agrupar por ${groupByField}`,
            isAggregate: true,
            isGrouped: true
          }
        }
        
        // Agrupar dinamicamente pelo campo especificado
        console.log('[OPX:DatabaseQueryAgent] 🔄 Agrupando empresas por:', groupByField)
        const grouped = {}
        let groupedCount = 0
        let unspecifiedCount = 0
        
        companies.forEach((company, index) => {
          const value = company[groupByField] || company[groupByField.toLowerCase()] || 'Não especificado'
          if (!grouped[value]) {
            grouped[value] = 0
            groupedCount++
          }
          grouped[value]++
          if (value === 'Não especificado') {
            unspecifiedCount++
          }
          
          // Log a cada 10 empresas processadas
          if ((index + 1) % 10 === 0) {
            console.log('[OPX:DatabaseQueryAgent] ⏳ Processadas', index + 1, 'de', companies.length, 'empresas')
          }
        })
        
        console.log('[OPX:DatabaseQueryAgent] ✅ Agrupamento concluído:', {
          totalGroups: groupedCount,
          groups: Object.keys(grouped),
          unspecifiedCount,
          totalCompanies: companies.length
        })
        
        // Converter para array formatado
        console.log('[OPX:DatabaseQueryAgent] 🔄 Formatando resultados...')
        const resultData = Object.entries(grouped)
          .map(([key, count]) => {
            const result = {
              [groupByField]: key,
              quantidade: count,
              percentual: ((count / companies.length) * 100).toFixed(1)
            }
            // Adicionar campos solicitados se especificados
            if (queryPlan.selectFields?.length > 0) {
              queryPlan.selectFields.forEach(field => {
                if (field !== groupByField) {
                  result[field] = null // Será preenchido se necessário
                }
              })
            }
            return result
          })
          .sort((a, b) => b.quantidade - a.quantidade)
        
        console.log('[OPX:DatabaseQueryAgent] 📊 Resultados formatados:', {
          totalItems: resultData.length,
          top3: resultData.slice(0, 3).map(r => ({ [groupByField]: r[groupByField], quantidade: r.quantidade }))
        })
        
        // Criar resumo baseado na descrição do plano
        const topItem = resultData[0]
        const summary = queryPlan.description || 
          `Agrupamento por ${groupByField}: Total de ${companies.length} registros em ${resultData.length} grupos. ` +
          `Maior grupo: ${topItem[groupByField]} com ${topItem.quantidade} (${topItem.percentual}%).`
        
        // Determinar tipo de visualização
        const chartType = queryPlan.expectedResultFormat === 'chart' ? 'bar' : 
                          (resultData.length <= 5 ? 'pie' : 'bar')
        
        const finalResult = {
          success: true,
          results: resultData,
          summary: summary,
          isAggregate: true,
          isGrouped: true,
          chartConfig: {
            chartType: chartType,
            xColumn: groupByField,
            yColumn: 'quantidade',
            title: `Distribuição por ${groupByField}`
          }
        }
        
        console.log('[OPX:DatabaseQueryAgent] ✅ ========== AGRUPAMENTO CONCLUÍDO ==========')
        console.log('[OPX:DatabaseQueryAgent] 📋 Resultado final:', {
          success: finalResult.success,
          resultsCount: finalResult.results.length,
          summary: finalResult.summary?.substring(0, 150),
          chartType: finalResult.chartConfig.chartType,
          isGrouped: finalResult.isGrouped
        })
        console.log('[OPX:DatabaseQueryAgent] 📊 Dados completos:', JSON.stringify(finalResult, null, 2))
        
        return finalResult
      }
      
      // Para outras tabelas, usar busca direta
      console.log('[OPX:DatabaseQueryAgent] ⚠️ Tabela não suportada para agrupamento:', tableName)
      return {
        success: false,
        error: `Agrupamento por ${groupByField} na tabela ${tableName} ainda não suportado`,
        results: []
      }
    } catch (error) {
      console.error('[OPX:DatabaseQueryAgent] ❌ ========== ERRO NO AGRUPAMENTO DINÂMICO ==========')
      console.error('[OPX:DatabaseQueryAgent] ❌ Erro:', error)
      console.error('[OPX:DatabaseQueryAgent] ❌ Stack:', error.stack)
      console.error('[OPX:DatabaseQueryAgent] ❌ Contexto:', {
        groupBy: queryPlan.groupBy,
        tableName: queryPlan.tables?.[0],
        userId: user?.id
      })
      return {
        success: false,
        error: error.message || 'Erro ao executar agrupamento dinâmico',
        results: []
      }
    }
  }

  /**
   * Executa agregação dinâmica seguindo os passos do plano da IA
   */
  async executeDynamicAggregate(queryPlan, user, params) {
    console.log('[OPX:DatabaseQueryAgent] 📊 ========== EXECUTANDO AGREGAÇÃO DINÂMICA ==========')
    console.log('[OPX:DatabaseQueryAgent] 📋 Plano:', {
      queryType: queryPlan.queryType,
      aggregationType: queryPlan.aggregationType,
      groupBy: queryPlan.groupBy,
      executionSteps: queryPlan.executionSteps,
      description: queryPlan.description
    })
    
    // Se tiver groupBy, usar executeDynamicGroupBy
    if (queryPlan.groupBy) {
      console.log('[OPX:DatabaseQueryAgent] 🔄 Redirecionando para executeDynamicGroupBy (tem groupBy)')
      return await this.executeDynamicGroupBy(queryPlan, user, params)
    }
    
    // Caso contrário, usar busca semântica como fallback genérico
    console.log('[OPX:DatabaseQueryAgent] 🔄 Usando busca semântica como fallback genérico')
    const limit = params?.limit || 20
    const tableName = queryPlan.tables?.[0] || null
    const vectorResults = await this.vectorSearch.semanticSearch('', tableName, limit)
    const result = {
      success: true,
      results: this.formatVectorResults(vectorResults.results || []),
      summary: vectorResults.summary || 'Resultados encontrados via busca semântica',
      vectorSearchUsed: true,
      isAggregate: true
    }
    console.log('[OPX:DatabaseQueryAgent] 📊 Resultado da agregação:', {
      success: result.success,
      hasResults: !!result.results,
      resultsCount: result.results?.length || 0,
      summary: result.summary?.substring(0, 100)
    })
    return result
  }
}

