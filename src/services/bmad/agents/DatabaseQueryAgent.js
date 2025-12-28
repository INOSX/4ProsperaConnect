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
          summary: `Encontrados ${vectorResults.results?.length || 0 + sqlResults.length} resultados (semânticos + SQL)`,
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
      // Por enquanto, retorna resultados básicos
      // Em produção, usaria um gerador de SQL com LLM
      const tableName = params?.tableName || 'companies'
      const limit = params?.limit || 20
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(limit)
      
      if (error) throw error
      
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

