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
    console.log('[BMAD:VectorSearchService] 🔍 ========== BUSCA SEMÂNTICA ==========')
    console.log('[BMAD:VectorSearchService] 📝 Input:', {
      query: query?.substring(0, 200),
      queryLength: query?.length || 0,
      tableName: tableName,
      limit: limit
    })
    
    const startTime = Date.now()
    try {
      // Converter query em embedding
      console.log('[BMAD:VectorSearchService] 🔮 Gerando embedding da query...')
      const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query)
      console.log('[BMAD:VectorSearchService] ✅ Embedding gerado, dimensões:', queryEmbedding?.length || 'N/A')
      
      // Buscar similaridade usando pgvector (se tabela existir)
      try {
        console.log('[BMAD:VectorSearchService] 🔍 Tentando busca via RPC semantic_search...')
        const rpcParams = {
          query_embedding: queryEmbedding,
          table_filter: tableName,
          similarity_threshold: 0.7,
          result_limit: limit
        }
        console.log('[BMAD:VectorSearchService] 📤 Parâmetros RPC:', {
          hasEmbedding: !!rpcParams.query_embedding,
          embeddingDimensions: rpcParams.query_embedding?.length || 'N/A',
          tableFilter: rpcParams.table_filter,
          similarityThreshold: rpcParams.similarity_threshold,
          resultLimit: rpcParams.result_limit
        })
        
        // Usar função SQL semantic_search se existir
        const rpcResult = await supabase.rpc('semantic_search', rpcParams)
        const rpcTime = Date.now() - startTime

        const { data, error } = rpcResult

        console.log('[BMAD:VectorSearchService] 📥 Resposta RPC (elapsed:', rpcTime + 'ms):', {
          hasError: !!error,
          error: error?.message,
          dataCount: data?.length || 0,
          hasData: !!data && data.length > 0
        })

        if (!error && data && data.length > 0) {
          console.log('[BMAD:VectorSearchService] ✅ Busca RPC bem-sucedida,', data.length, 'resultados encontrados')
          const results = data.map(item => ({
            record_id: item.record_id,
            table_name: item.table_name,
            chunk_text: item.chunk_text,
            metadata: item.metadata,
            similarity: item.similarity
          }))
          
          console.log('[BMAD:VectorSearchService] 📊 Primeiros 3 resultados:', results.slice(0, 3).map(r => ({
            record_id: r.record_id,
            table_name: r.table_name,
            similarity: r.similarity?.toFixed(3)
          })))
          
          const finalResult = {
            results: results,
            summary: `Encontrados ${data.length} resultados semânticos`
          }
          
          const totalTime = Date.now() - startTime
          console.log('[BMAD:VectorSearchService] ✅ ========== BUSCA SEMÂNTICA CONCLUÍDA ==========')
          console.log('[BMAD:VectorSearchService] 📊 Resumo:', {
            resultsCount: finalResult.results.length,
            summary: finalResult.summary,
            totalTime: totalTime + 'ms',
            method: 'RPC semantic_search'
          })
          
          return finalResult
        }
        
        console.log('[BMAD:VectorSearchService] ⚠️ RPC não retornou resultados, usando fallback')
      } catch (rpcError) {
        const rpcTime = Date.now() - startTime
        console.warn('[BMAD:VectorSearchService] ⚠️ RPC semantic_search não disponível ou falhou (elapsed:', rpcTime + 'ms):', rpcError)
        console.warn('[BMAD:VectorSearchService] ⚠️ Usando fallback de busca vetorial...')
      }

      // Fallback: buscar usando cosine similarity manual
      console.log('[BMAD:VectorSearchService] 🔄 Usando fallback de busca vetorial...')
      return await this.fallbackVectorSearch(queryEmbedding, tableName, limit)
    } catch (error) {
      const totalTime = Date.now() - startTime
      console.error('[BMAD:VectorSearchService] ❌ ========== ERRO NA BUSCA SEMÂNTICA ==========')
      console.error('[BMAD:VectorSearchService] ❌ Erro após', totalTime + 'ms:', error)
      console.error('[BMAD:VectorSearchService] ❌ Stack:', error.stack)
      console.log('[BMAD:VectorSearchService] 🔄 Usando fallback de busca básica...')
      
      // Fallback para busca básica
      return await this.fallbackSearch(query, tableName, limit)
    }
  }

  async fallbackVectorSearch(queryEmbedding, tableName, limit) {
    console.log('[BMAD:VectorSearchService] 🔄 ========== FALLBACK DE BUSCA VETORIAL ==========')
    console.log('[BMAD:VectorSearchService] 📝 Input:', {
      tableName: tableName,
      limit: limit,
      queryEmbeddingLength: queryEmbedding?.length || 0,
      hasEmbedding: !!queryEmbedding
    })
    
    const startTime = Date.now()
    try {
      console.log('[BMAD:VectorSearchService] 🔍 Buscando embeddings no banco...')
      let query = supabase
        .from('data_embeddings')
        .select('*')
        .not('embedding', 'is', null)
        .limit(100) // Buscar mais para calcular similaridade

      if (tableName) {
        query = query.eq('table_name', tableName)
        console.log('[BMAD:VectorSearchService]   - Filtro por tabela:', tableName)
      }

      const { data, error } = await query
      const queryTime = Date.now() - startTime

      console.log('[BMAD:VectorSearchService] 📥 Resposta do banco (elapsed:', queryTime + 'ms):', {
        hasError: !!error,
        error: error?.message,
        dataCount: data?.length || 0,
        hasData: !!data && data.length > 0
      })

      if (error || !data || data.length === 0) {
        console.log('[BMAD:VectorSearchService] ⚠️ Nenhum embedding encontrado, usando fallback de busca básica')
        return await this.fallbackSearch('', tableName, limit)
      }

      console.log('[BMAD:VectorSearchService] 📊 Encontrados', data.length, 'embeddings para processar')

      // Calcular similaridade para cada resultado
      console.log('[BMAD:VectorSearchService] 🔄 Calculando similaridade...')
      const { cosineSimilarity } = await import('../utils/vectorSearch.js')
      const queryEmbeddingLength = queryEmbedding?.length || 0
      
      let processedCount = 0
      let validCount = 0
      let mismatchCount = 0
      let errorCount = 0
      
      const resultsWithSimilarity = data
        .map((item, index) => {
          processedCount++
          
          // Validar que os embeddings têm a mesma dimensão
          if (!item.embedding || !Array.isArray(item.embedding)) {
            return { ...item, similarity: 0 }
          }
          
          const itemEmbeddingLength = item.embedding.length
          if (queryEmbeddingLength !== itemEmbeddingLength) {
            mismatchCount++
            if (index < 3) {
              console.warn('[BMAD:VectorSearchService] ⚠️ Embedding dimension mismatch (item', index, '):', {
                query: queryEmbeddingLength,
                item: itemEmbeddingLength
              })
            }
            return { ...item, similarity: 0 }
          }
          
          try {
            const similarity = cosineSimilarity(queryEmbedding, item.embedding)
            if (similarity >= 0.7) {
              validCount++
            }
            return { ...item, similarity }
          } catch (error) {
            errorCount++
            if (index < 3) {
              console.warn('[BMAD:VectorSearchService] ⚠️ Erro ao calcular similaridade (item', index, '):', error)
            }
            return { ...item, similarity: 0 }
          }
        })
        .filter(item => item.similarity >= 0.7)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
      
      const similarityTime = Date.now() - startTime
      console.log('[BMAD:VectorSearchService] 📊 Processamento de similaridade:', {
        totalProcessed: processedCount,
        validSimilarities: validCount,
        dimensionMismatches: mismatchCount,
        calculationErrors: errorCount,
        finalResults: resultsWithSimilarity.length,
        elapsed: similarityTime + 'ms'
      })
      
      if (resultsWithSimilarity.length > 0) {
        console.log('[BMAD:VectorSearchService] 📊 Top 3 resultados:', resultsWithSimilarity.slice(0, 3).map(r => ({
          record_id: r.record_id,
          table_name: r.table_name,
          similarity: r.similarity?.toFixed(3)
        })))
      }
      
      const finalResult = {
        results: resultsWithSimilarity.map(item => ({
          record_id: item.record_id,
          table_name: item.table_name,
          chunk_text: item.chunk_text,
          metadata: item.metadata,
          similarity: item.similarity
        })),
        summary: `Encontrados ${resultsWithSimilarity.length} resultados semânticos`
      }
      
      const totalTime = Date.now() - startTime
      console.log('[BMAD:VectorSearchService] ✅ ========== FALLBACK VETORIAL CONCLUÍDO ==========')
      console.log('[BMAD:VectorSearchService] 📊 Resumo:', {
        resultsCount: finalResult.results.length,
        summary: finalResult.summary,
        totalTime: totalTime + 'ms',
        method: 'fallbackVectorSearch'
      })
      
      return finalResult
    } catch (error) {
      const totalTime = Date.now() - startTime
      console.error('[BMAD:VectorSearchService] ❌ ========== ERRO NO FALLBACK VETORIAL ==========')
      console.error('[BMAD:VectorSearchService] ❌ Erro após', totalTime + 'ms:', error)
      console.error('[BMAD:VectorSearchService] ❌ Stack:', error.stack)
      console.log('[BMAD:VectorSearchService] 🔄 Usando fallback de busca básica...')
      
      return await this.fallbackSearch('', tableName, limit)
    }
  }

  async fallbackSearch(query, tableName, limit) {
    console.log('[BMAD:VectorSearchService] 🔄 ========== FALLBACK DE BUSCA BÁSICA ==========')
    console.log('[BMAD:VectorSearchService] 📝 Input:', {
      query: query?.substring(0, 100),
      tableName: tableName,
      limit: limit
    })
    
    console.log('[BMAD:VectorSearchService] ⚠️ Busca básica requer contexto de usuário')
    console.log('[BMAD:VectorSearchService] 💡 DatabaseQueryAgent deve usar serviços apropriados diretamente')
    
    const result = {
      results: [],
      summary: 'Busca requer contexto de usuário. Use serviços apropriados no DatabaseQueryAgent.'
    }
    
    console.log('[BMAD:VectorSearchService] 📤 Resultado:', JSON.stringify(result, null, 2))
    return result
  }

  async hybridSearch(query, filters, limit = 10) {
    console.log('[BMAD:VectorSearchService] 🔄 ========== BUSCA HÍBRIDA ==========')
    console.log('[BMAD:VectorSearchService] 📝 Input:', {
      query: query?.substring(0, 200),
      filters: filters,
      limit: limit
    })
    
    const startTime = Date.now()
    try {
      console.log('[BMAD:VectorSearchService] 🔍 Executando busca semântica...')
      // Combina busca vetorial com filtros SQL
      const vectorResults = await this.semanticSearch(query, null, limit)
      
      console.log('[BMAD:VectorSearchService] 📊 Resultados da busca semântica:', {
        count: vectorResults.results?.length || 0,
        summary: vectorResults.summary
      })
      
      // Aplicar filtros adicionais se necessário
      if (filters) {
        console.log('[BMAD:VectorSearchService] 🔍 Aplicando filtros adicionais:', JSON.stringify(filters, null, 2))
        // Filtrar resultados
      }

      const elapsed = Date.now() - startTime
      console.log('[BMAD:VectorSearchService] ✅ ========== BUSCA HÍBRIDA CONCLUÍDA ==========')
      console.log('[BMAD:VectorSearchService] 📊 Resumo:', {
        resultsCount: vectorResults.results?.length || 0,
        hasFilters: !!filters,
        elapsed: elapsed + 'ms'
      })
      
      return vectorResults
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[BMAD:VectorSearchService] ❌ ========== ERRO NA BUSCA HÍBRIDA ==========')
      console.error('[BMAD:VectorSearchService] ❌ Erro após', elapsed + 'ms:', error)
      throw error
    }
  }

  async crossTableSearch(query, tableNames, limit = 10) {
    console.log('[BMAD:VectorSearchService] 🔄 ========== BUSCA CRUZADA ENTRE TABELAS ==========')
    console.log('[BMAD:VectorSearchService] 📝 Input:', {
      query: query?.substring(0, 200),
      tableNames: tableNames,
      limit: limit
    })
    
    const startTime = Date.now()
    try {
      // Busca cruzada entre múltiplas tabelas
      const allResults = []
      
      console.log('[BMAD:VectorSearchService] 🔍 Buscando em', tableNames.length, 'tabelas...')
      for (let i = 0; i < tableNames.length; i++) {
        const tableName = tableNames[i]
        console.log('[BMAD:VectorSearchService]   📋 Tabela', i + 1, 'de', tableNames.length, ':', tableName)
        
        const results = await this.semanticSearch(query, tableName, limit)
        const tableResults = results.results || []
        allResults.push(...tableResults)
        
        console.log('[BMAD:VectorSearchService]   ✅', tableResults.length, 'resultados encontrados em', tableName)
      }

      const finalResults = allResults.slice(0, limit)
      const elapsed = Date.now() - startTime
      
      console.log('[BMAD:VectorSearchService] 📊 Resumo da busca cruzada:', {
        tablesSearched: tableNames.length,
        totalResults: allResults.length,
        finalResults: finalResults.length,
        elapsed: elapsed + 'ms'
      })
      
      const result = {
        results: finalResults,
        summary: `Encontrados ${allResults.length} resultados em ${tableNames.length} tabelas`
      }
      
      console.log('[BMAD:VectorSearchService] ✅ ========== BUSCA CRUZADA CONCLUÍDA ==========')
      console.log('[BMAD:VectorSearchService] 📤 Resultado:', JSON.stringify(result, null, 2))
      
      return result
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[BMAD:VectorSearchService] ❌ ========== ERRO NA BUSCA CRUZADA ==========')
      console.error('[BMAD:VectorSearchService] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[BMAD:VectorSearchService] ❌ Stack:', error.stack)
      throw error
    }
  }
}

