/**
 * Gerador de embeddings usando OpenAI Embeddings API
 */
export class EmbeddingGenerator {
  constructor(model = 'text-embedding-3-small') {
    this.cache = new Map()
    this.model = model
    this.cacheTTL = 24 * 60 * 60 * 1000 // 24 horas
  }

  async generateEmbedding(text) {
    console.log('[BMAD:EmbeddingGenerator] 🔮 ========== GERANDO EMBEDDING ==========')
    console.log('[BMAD:EmbeddingGenerator] 📝 Input:', {
      text: text?.substring(0, 200),
      textLength: text?.length || 0,
      model: this.model
    })
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.error('[BMAD:EmbeddingGenerator] ❌ Texto vazio ou inválido')
      throw new Error('Text is required and must be non-empty')
    }

    // Verificar cache
    const cacheKey = `${this.model}:${text}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log('[BMAD:EmbeddingGenerator] ✅ Embedding encontrado no cache')
      console.log('[BMAD:EmbeddingGenerator] 📤 Retornando embedding do cache (dimensões:', cached.embedding?.length || 'N/A', ')')
      return cached.embedding
    }
    console.log('[BMAD:EmbeddingGenerator] 🔄 Embedding não encontrado no cache, gerando novo...')

    const startTime = Date.now()
    try {
      const requestBody = {
        action: 'generateEmbedding',
        text: text,
        model: this.model
      }
      
      console.log('[BMAD:EmbeddingGenerator] 📤 Enviando requisição para OpenAI Embeddings API:', {
        model: this.model,
        textLength: text.length,
        action: requestBody.action
      })
      
      // Chamar API route para gerar embedding
      const response = await fetch('/api/openai/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const requestTime = Date.now() - startTime
      console.log('[BMAD:EmbeddingGenerator] 📥 Resposta recebida em', requestTime + 'ms, status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[BMAD:EmbeddingGenerator] ❌ Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error
        })
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('[BMAD:EmbeddingGenerator] 📦 Dados recebidos:', {
        success: result.success,
        hasEmbedding: !!result.embedding,
        embeddingDimensions: result.embedding?.length || 'N/A',
        model: result.model
      })
      
      if (!result.success || !result.embedding) {
        console.error('[BMAD:EmbeddingGenerator] ❌ Falha ao gerar embedding:', result)
        throw new Error('Failed to generate embedding')
      }

      // Armazenar no cache
      this.cache.set(cacheKey, {
        embedding: result.embedding,
        timestamp: Date.now()
      })
      console.log('[BMAD:EmbeddingGenerator] 💾 Embedding armazenado no cache')

      const totalTime = Date.now() - startTime
      console.log('[BMAD:EmbeddingGenerator] ✅ ========== EMBEDDING GERADO COM SUCESSO ==========')
      console.log('[BMAD:EmbeddingGenerator] 📊 Resumo:', {
        dimensions: result.embedding.length,
        model: this.model,
        totalTime: totalTime + 'ms',
        cached: false
      })
      
      return result.embedding
    } catch (error) {
      const totalTime = Date.now() - startTime
      console.error('[BMAD:EmbeddingGenerator] ❌ ========== ERRO AO GERAR EMBEDDING ==========')
      console.error('[BMAD:EmbeddingGenerator] ❌ Erro após', totalTime + 'ms:', error)
      console.error('[BMAD:EmbeddingGenerator] ❌ Stack:', error.stack)
      throw error
    }
  }

  async generateBatch(texts) {
    console.log('[BMAD:EmbeddingGenerator] 🔮 ========== GERANDO EMBEDDINGS EM BATCH ==========')
    console.log('[BMAD:EmbeddingGenerator] 📝 Input:', {
      textsCount: texts?.length || 0,
      texts: texts?.map(t => t.substring(0, 50)) || [],
      model: this.model
    })
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      console.error('[BMAD:EmbeddingGenerator] ❌ Array de textos vazio ou inválido')
      throw new Error('Texts array is required')
    }

    const startTime = Date.now()
    try {
      const requestBody = {
        action: 'generateBatch',
        texts: texts,
        model: this.model
      }
      
      console.log('[BMAD:EmbeddingGenerator] 📤 Enviando requisição batch para OpenAI Embeddings API:', {
        model: this.model,
        textsCount: texts.length,
        action: requestBody.action
      })
      
      // Chamar API route para gerar embeddings em batch
      const response = await fetch('/api/openai/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const requestTime = Date.now() - startTime
      console.log('[BMAD:EmbeddingGenerator] 📥 Resposta recebida em', requestTime + 'ms, status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[BMAD:EmbeddingGenerator] ❌ Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error
        })
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('[BMAD:EmbeddingGenerator] 📦 Dados recebidos:', {
        success: result.success,
        hasEmbeddings: !!result.embeddings,
        embeddingsCount: result.embeddings?.length || 0,
        model: result.model
      })
      
      if (!result.success || !result.embeddings) {
        console.error('[BMAD:EmbeddingGenerator] ❌ Falha ao gerar embeddings:', result)
        throw new Error('Failed to generate embeddings')
      }

      // Armazenar no cache
      console.log('[BMAD:EmbeddingGenerator] 💾 Armazenando embeddings no cache...')
      let cachedCount = 0
      texts.forEach((text, index) => {
        const cacheKey = `${this.model}:${text}`
        this.cache.set(cacheKey, {
          embedding: result.embeddings[index],
          timestamp: Date.now()
        })
        cachedCount++
      })
      console.log('[BMAD:EmbeddingGenerator] 💾', cachedCount, 'embeddings armazenados no cache')

      const totalTime = Date.now() - startTime
      console.log('[BMAD:EmbeddingGenerator] ✅ ========== EMBEDDINGS EM BATCH GERADOS COM SUCESSO ==========')
      console.log('[BMAD:EmbeddingGenerator] 📊 Resumo:', {
        embeddingsGenerated: result.embeddings.length,
        dimensions: result.embeddings[0]?.length || 'N/A',
        model: this.model,
        totalTime: totalTime + 'ms',
        cached: cachedCount
      })
      
      return result.embeddings
    } catch (error) {
      const totalTime = Date.now() - startTime
      console.error('[BMAD:EmbeddingGenerator] ❌ ========== ERRO AO GERAR EMBEDDINGS EM BATCH ==========')
      console.error('[BMAD:EmbeddingGenerator] ❌ Erro após', totalTime + 'ms:', error)
      console.error('[BMAD:EmbeddingGenerator] ❌ Stack:', error.stack)
      throw error
    }
  }

  clearCache() {
    this.cache.clear()
  }

  getCacheSize() {
    return this.cache.size
  }
}

export default EmbeddingGenerator

