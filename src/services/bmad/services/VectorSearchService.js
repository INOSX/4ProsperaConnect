/**
 * VectorSearchService - Serviço de busca vetorial semântica
 */
import { supabase } from '../../../services/supabase'
import EmbeddingGenerator from '../utils/embeddingGenerator.js'

export default class VectorSearchService {
  constructor() {
    this.embeddingGenerator = new EmbeddingGenerator('text-embedding-3-small')
  }

  async semanticSearch(query, tableName = null, limit = 10) {
    try {
      // Converter query em embedding
      const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query)
      
      // Buscar similaridade usando pgvector (se tabela existir)
      try {
        // Usar função SQL semantic_search se existir
        const rpcResult = await supabase.rpc('semantic_search', {
          query_embedding: queryEmbedding,
          table_filter: tableName,
          similarity_threshold: 0.7,
          result_limit: limit
        })

        const { data, error } = rpcResult

        if (!error && data && data.length > 0) {
          return {
            results: data.map(item => ({
              record_id: item.record_id,
              table_name: item.table_name,
              chunk_text: item.chunk_text,
              metadata: item.metadata,
              similarity: item.similarity
            })),
            summary: `Encontrados ${data.length} resultados semânticos`
          }
        }
      } catch (rpcError) {
        console.warn('RPC semantic_search not available, using fallback:', rpcError)
      }

      // Fallback: buscar usando cosine similarity manual
      return await this.fallbackVectorSearch(queryEmbedding, tableName, limit)
    } catch (error) {
      console.error('Error in semantic search:', error)
      // Fallback para busca básica
      return await this.fallbackSearch(query, tableName, limit)
    }
  }

  async fallbackVectorSearch(queryEmbedding, tableName, limit) {
    // Buscar embeddings e calcular similaridade manualmente
    try {
      let query = supabase
        .from('data_embeddings')
        .select('*')
        .not('embedding', 'is', null)
        .limit(100) // Buscar mais para calcular similaridade

      if (tableName) {
        query = query.eq('table_name', tableName)
      }

      const { data, error } = await query

      if (error || !data || data.length === 0) {
        return await this.fallbackSearch('', tableName, limit)
      }

      // Calcular similaridade para cada resultado
      const { cosineSimilarity } = await import('../utils/vectorSearch.js')
      const queryEmbeddingLength = queryEmbedding?.length || 0
      
      const resultsWithSimilarity = data
        .map(item => {
          // Validar que os embeddings têm a mesma dimensão
          if (!item.embedding || !Array.isArray(item.embedding)) {
            return { ...item, similarity: 0 }
          }
          
          const itemEmbeddingLength = item.embedding.length
          if (queryEmbeddingLength !== itemEmbeddingLength) {
            console.warn(`[fallbackVectorSearch] Embedding dimension mismatch: query=${queryEmbeddingLength}, item=${itemEmbeddingLength}`)
            return { ...item, similarity: 0 }
          }
          
          try {
            const similarity = cosineSimilarity(queryEmbedding, item.embedding)
            return { ...item, similarity }
          } catch (error) {
            console.warn(`[fallbackVectorSearch] Error calculating similarity:`, error)
            return { ...item, similarity: 0 }
          }
        })
        .filter(item => item.similarity >= 0.7)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

      return {
        results: resultsWithSimilarity.map(item => ({
          record_id: item.record_id,
          table_name: item.table_name,
          chunk_text: item.chunk_text,
          metadata: item.metadata,
          similarity: item.similarity
        })),
        summary: `Encontrados ${resultsWithSimilarity.length} resultados semânticos`
      }
    } catch (error) {
      console.error('Error in fallbackVectorSearch:', error)
      return await this.fallbackSearch('', tableName, limit)
    }
  }

  async fallbackSearch(query, tableName, limit) {
    // Busca básica nas tabelas principais
    // Usar serviços em vez de queries diretas para evitar problemas de RLS
    // O DatabaseQueryAgent deve usar serviços apropriados diretamente
    return {
      results: [],
      summary: 'Busca requer contexto de usuário. Use serviços apropriados no DatabaseQueryAgent.'
    }
  }

  async hybridSearch(query, filters, limit = 10) {
    // Combina busca vetorial com filtros SQL
    const vectorResults = await this.semanticSearch(query, null, limit)
    
    // Aplicar filtros adicionais se necessário
    if (filters) {
      // Filtrar resultados
    }

    return vectorResults
  }

  async crossTableSearch(query, tableNames, limit = 10) {
    // Busca cruzada entre múltiplas tabelas
    const allResults = []
    
    for (const tableName of tableNames) {
      const results = await this.semanticSearch(query, tableName, limit)
      allResults.push(...results.results)
    }

    return {
      results: allResults.slice(0, limit),
      summary: `Encontrados ${allResults.length} resultados em ${tableNames.length} tabelas`
    }
  }
}

