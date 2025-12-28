/**
 * Serviço para gerenciar vetorização de dados
 * Facilita chamadas à API de vetorização
 */
class VectorizationService {
  /**
   * Processa registros pendentes (criados por triggers mas sem embedding)
   */
  async processPending(batchSize = 50) {
    try {
      const response = await fetch('/api/vectorization/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'processPending',
          batchSize
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process pending embeddings')
      }

      return await response.json()
    } catch (error) {
      console.error('Error processing pending embeddings:', error)
      throw error
    }
  }

  /**
   * Vetoriza todos os dados de uma tabela específica
   */
  async vectorizeTable(tableName) {
    try {
      const response = await fetch('/api/vectorization/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'vectorizeTable',
          tableName
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to vectorize table')
      }

      return await response.json()
    } catch (error) {
      console.error(`Error vectorizing table ${tableName}:`, error)
      throw error
    }
  }

  /**
   * Vetoriza todas as tabelas configuradas
   */
  async vectorizeAll() {
    try {
      console.log('[VectorizationService] Starting vectorizeAll...')
      const response = await fetch('/api/vectorization/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'vectorizeAll'
        })
      })

      console.log('[VectorizationService] Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
          console.error('[VectorizationService] Error response:', errorData)
        } catch (e) {
          const text = await response.text()
          console.error('[VectorizationService] Error response (not JSON):', text)
          throw new Error(`HTTP ${response.status}: ${text || response.statusText}`)
        }
        throw new Error(errorData.error || errorData.message || 'Failed to vectorize all tables')
      }

      const result = await response.json()
      console.log('[VectorizationService] VectorizeAll result:', result)
      return result
    } catch (error) {
      console.error('[VectorizationService] Error vectorizing all tables:', error)
      throw error
    }
  }

  /**
   * Obtém status da vetorização
   */
  async getStatus() {
    try {
      const response = await fetch('/api/vectorization/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getStatus'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting vectorization status:', error)
      throw error
    }
  }

  /**
   * Processa registros pendentes continuamente até não haver mais pendentes
   */
  async processAllPending(onProgress = null) {
    let totalProcessed = 0
    let hasMore = true

    while (hasMore) {
      const result = await this.processPending(50)
      
      if (result.processed > 0) {
        totalProcessed += result.processed
        if (onProgress) {
          onProgress({
            processed: totalProcessed,
            batchProcessed: result.processed,
            message: result.message
          })
        }
      } else {
        hasMore = false
      }

      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return {
      success: true,
      totalProcessed,
      message: `Processados ${totalProcessed} registros pendentes`
    }
  }
}

export default new VectorizationService()

