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
      // Detectar se é uma consulta de contagem
      const isCountQuery = this.isCountQuery(text)
      
      if (isCountQuery) {
        // Para consultas de contagem, usar SQL direto
        return await this.handleCountQuery(text, user, params)
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
   * Lida com consultas de contagem usando serviços apropriados
   */
  async handleCountQuery(text, user, params) {
    try {
      const lowerText = text.toLowerCase()
      
      // Detectar qual tabela está sendo consultada
      if (lowerText.includes('empresa')) {
        const { CompanyService } = await import('../../../services/companyService')
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
          const count = result.companies.length
          return {
            success: true,
            results: [{ count, type: 'companies', label: 'Empresas' }],
            summary: `Total de empresas: ${count}`,
            vectorSearchUsed: false,
            isCount: true
          }
        }
      }
      
      // Para outras tabelas, usar busca semântica e contar resultados
      const vectorResults = await this.vectorSearch.semanticSearch(text, params?.tableName, 100)
      const count = vectorResults.results?.length || 0
      
      return {
        success: true,
        results: [{ count, type: 'general', label: 'Registros encontrados' }],
        summary: `Total encontrado: ${count}`,
        vectorSearchUsed: true,
        isCount: true
      }
    } catch (error) {
      console.error('Error in handleCountQuery:', error)
      return {
        success: false,
        error: error.message,
        results: []
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
    // Se for uma consulta para "conhecer" todos os dados
    if (intent === 'get_all_data' || intent === 'know_all_data' || params?.getAll) {
      return await this.getAllData(user, context)
    }

    // Caso contrário, usar busca semântica normal
    const queryText = params?.query || params?.text || intent
    return await this.query(queryText, user, context, params)
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

