/**
 * Serviço para integração com OpenAI Assistant
 * Baseado na documentação: https://docs.heygen.com/docs/integrate-with-opeanai-assistant
 * 
 * NOTA: Para produção, recomenda-se fazer as chamadas no backend para manter a chave API segura.
 * Esta implementação usa dangerouslyAllowBrowser: true apenas para demonstração.
 */
import OpenAI from 'openai'

export class OpenAIAssistantService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }
    
    // Usar dangerouslyAllowBrowser: true apenas para demonstração
    // Em produção, fazer chamadas no backend
    this.client = new OpenAI({ 
      apiKey, 
      dangerouslyAllowBrowser: true 
    })
    
    this.assistant = null
    this.thread = null
  }

  /**
   * Inicializa o assistente OpenAI
   * @param {string} instructions - Instruções personalizadas para o assistente
   * @param {string} assistantId - ID do assistente existente (opcional). Se fornecido, usa o assistente existente ao invés de criar um novo.
   */
  async initialize(instructions = null, assistantId = null) {
    const defaultInstructions = `Você é um assistente inteligente e amigável. 
    Responda perguntas de forma clara, concisa e natural em português, inglês ou espanhol.
    Seja educado, profissional e ajude o usuário da melhor forma possível.
    Mantenha suas respostas breves e diretas, adequadas para conversação por voz.`

    try {
      // Se um assistantId foi fornecido, usar o assistente existente
      if (assistantId) {
        this.assistant = { id: assistantId }
        console.log('✅ Using existing OpenAI Assistant:', this.assistant.id)
      } else {
        // Criar um novo assistente apenas se nenhum ID foi fornecido
        this.assistant = await this.client.beta.assistants.create({
          name: 'Lucrax AI Assistant',
          instructions: instructions || defaultInstructions,
          tools: [],
          model: 'gpt-4-turbo-preview',
        })
        console.log('✅ OpenAI Assistant created:', this.assistant.id)
      }

      // Criar uma thread
      this.thread = await this.client.beta.threads.create()
      
      console.log('✅ OpenAI Thread created:', this.thread.id)

      return {
        assistantId: this.assistant.id,
        threadId: this.thread.id
      }
    } catch (error) {
      console.error('❌ Error initializing OpenAI Assistant:', error)
      throw error
    }
  }

  /**
   * Obtém uma resposta do assistente para uma mensagem do usuário
   * @param {string} userMessage - Mensagem do usuário
   * @returns {Promise<string>} Resposta do assistente
   */
  async getResponse(userMessage) {
    if (!this.assistant || !this.thread) {
      throw new Error('Assistant not initialized. Call initialize() first.')
    }

    try {
      console.log('🔵 Sending message to OpenAI Assistant:', userMessage)

      // Adicionar mensagem do usuário à thread
      await this.client.beta.threads.messages.create(this.thread.id, {
        role: 'user',
        content: userMessage,
      })

      // Criar e executar o assistente
      const run = await this.client.beta.threads.runs.createAndPoll(
        this.thread.id,
        { assistant_id: this.assistant.id }
      )

      if (run.status === 'completed') {
        // Obter as mensagens da thread
        const messages = await this.client.beta.threads.messages.list(
          this.thread.id
        )

        // Obter a última mensagem do assistente
        const lastMessage = messages.data.find(
          (msg) => msg.role === 'assistant'
        )

        if (lastMessage && lastMessage.content[0]?.type === 'text') {
          const response = lastMessage.content[0].text.value
          console.log('✅ OpenAI Assistant response:', response)
          return response
        }
      } else {
        console.error('❌ Run status:', run.status, run)
        throw new Error(`Run failed with status: ${run.status}`)
      }

      return 'Desculpe, não consegui processar sua solicitação.'
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
    return !!(this.assistant && this.thread)
  }
}

export default OpenAIAssistantService

