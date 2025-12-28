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
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Text is required and must be non-empty')
    }

    // Verificar cache
    const cacheKey = `${this.model}:${text}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.embedding
    }

    try {
      // Chamar API route para gerar embedding
      const response = await fetch('/api/openai/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateEmbedding',
          text: text,
          model: this.model
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success || !result.embedding) {
        throw new Error('Failed to generate embedding')
      }

      // Armazenar no cache
      this.cache.set(cacheKey, {
        embedding: result.embedding,
        timestamp: Date.now()
      })

      return result.embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  async generateBatch(texts) {
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      throw new Error('Texts array is required')
    }

    try {
      // Chamar API route para gerar embeddings em batch
      const response = await fetch('/api/openai/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateBatch',
          texts: texts,
          model: this.model
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success || !result.embeddings) {
        throw new Error('Failed to generate embeddings')
      }

      // Armazenar no cache
      texts.forEach((text, index) => {
        const cacheKey = `${this.model}:${text}`
        this.cache.set(cacheKey, {
          embedding: result.embeddings[index],
          timestamp: Date.now()
        })
      })

      return result.embeddings
    } catch (error) {
      console.error('Error generating embeddings batch:', error)
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

