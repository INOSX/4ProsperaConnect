/**
 * Serviço para integração com OpenAI Assistant via API Route
 * Mantém a chave da API segura no backend
 */
export class OpenAIAssistantApiService {
  constructor(assistantId) {
    this.assistantId = assistantId
    this.threadId = null
  }

  /**
   * Inicializa o assistente criando uma thread
   */
  async initialize() {
    try {
      const response = await fetch('/api/openai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createThread' })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      this.threadId = data.threadId
      console.log('✅ OpenAI Assistant thread created:', this.threadId)
      return { threadId: this.threadId }
    } catch (error) {
      console.error('❌ Error initializing OpenAI Assistant:', error)
      throw error
    }
  }

  /**
   * Obtém uma resposta do assistente para uma mensagem do usuário
   * @param {string} userMessage - Mensagem do usuário
   * @param {string} fileName - Nome do arquivo/dataset selecionado (opcional)
   * @returns {Promise<string>} Resposta do assistente
   */
  async getResponse(userMessage, fileName = null) {
    if (!this.threadId || !this.assistantId) {
      throw new Error('Assistant not initialized. Call initialize() first.')
    }

    try {
      const response = await fetch('/api/openai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getResponse',
          threadId: this.threadId,
          assistantId: this.assistantId,
          message: userMessage,
          fileName: fileName
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('❌ Error getting response from OpenAI Assistant:', error)
      throw error
    }
  }

  /**
   * Verifica se o assistente está inicializado
   * @returns {boolean}
   */
  isInitialized() {
    return !!(this.threadId && this.assistantId)
  }
}

