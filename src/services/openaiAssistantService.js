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
    Mantenha suas respostas breves e diretas, adequadas para conversação por voz.
    
    REGRAS IMPORTANTES:
    - NUNCA mencione nomes de arquivos, datasets, vectorstores ou IDs técnicos nas suas respostas
    - NUNCA inclua referências como "vendas_padaria_agosto_2025.csv" ou similar
    - Responda naturalmente sobre os dados sem mencionar arquivos ou fontes técnicas
    - Foque apenas no conteúdo e nas informações relevantes para o usuário
    
    REGRAS SOBRE CÁLCULOS E FÓRMULAS:
    - NUNCA recite fórmulas matemáticas detalhadas ou complexas na sua resposta
    - NUNCA mencione equações como "y = mx + b" ou fórmulas similares
    - Se precisar mencionar cálculos, faça apenas em ALTO NÍVEL usando linguagem natural
    - Exemplos de como mencionar cálculos:
      * BOM: "Calculei a média dos valores" ou "Somei todas as vendas do mês"
      * BOM: "Fiz uma análise de tendência comparando os períodos"
      * RUIM: "y = Σ(xi - μ)² / n" ou "f(x) = ax² + bx + c"
    - Sempre descreva os cálculos em linguagem natural, como se estivesse explicando para alguém em uma conversa`

    try {
      // Se um assistantId foi fornecido, usar o assistente existente
      if (assistantId) {
        this.assistant = { id: assistantId }
        console.log('✅ Using existing OpenAI Assistant:', this.assistant.id)
      } else {
        // Criar um novo assistente apenas se nenhum ID foi fornecido
        this.assistant = await this.client.beta.assistants.create({
          name: '4Prospera Connect Assistant',
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
   * @param {string} fileName - Nome do arquivo/dataset selecionado (opcional)
   * @returns {Promise<string>} Resposta do assistente
   */
  async getResponse(userMessage, fileName = null) {
    if (!this.assistant || !this.thread) {
      throw new Error('Assistant not initialized. Call initialize() first.')
    }

    try {
      // Construir mensagem com contexto do arquivo se fornecido
      let contextualMessage = userMessage
      if (fileName) {
        contextualMessage = `Contexto interno (NÃO mencione o nome do arquivo na sua resposta): O usuário está trabalhando com o arquivo/dataset "${fileName}". 
        
Pergunta do usuário: ${userMessage}

INSTRUÇÕES CRÍTICAS:
- Use o contexto do arquivo "${fileName}" para responder corretamente sobre o conteúdo dos dados
- NUNCA mencione o nome do arquivo "${fileName}" na sua resposta
- NUNCA mencione extensões de arquivo como ".csv", ".xlsx" ou similares
- NUNCA mencione termos técnicos como "dataset", "vectorstore" ou "arquivo"
- Responda naturalmente como se estivesse falando sobre os dados diretamente
- Se a pergunta não estiver relacionada ao arquivo, responda normalmente sem mencionar arquivos
- Foque apenas nas informações e análises dos dados, nunca nas fontes ou arquivos técnicos

REGRAS SOBRE CÁLCULOS E FÓRMULAS:
- NUNCA recite fórmulas matemáticas detalhadas ou complexas
- NUNCA mencione equações como "y = mx + b", "Σ(xi - μ)² / n" ou fórmulas similares
- Se precisar mencionar cálculos, faça apenas em ALTO NÍVEL usando linguagem natural
- Exemplos: "Calculei a média", "Somei os valores", "Comparei os períodos"
- Sempre descreva os cálculos em linguagem natural, adequada para conversação por voz`
        console.log('🔵 Sending message with file context:', { fileName, userMessage })
      } else {
        console.log('🔵 Sending message to OpenAI Assistant:', userMessage)
      }

      // Adicionar mensagem do usuário à thread
      await this.client.beta.threads.messages.create(this.thread.id, {
        role: 'user',
        content: contextualMessage,
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
          let response = lastMessage.content[0].text.value
          
          // Remover menções ao nome do arquivo da resposta (se fileName foi fornecido)
          if (fileName) {
            // Remover o nome do arquivo exato (com e sem aspas)
            const fileNameEscaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const patterns = [
              new RegExp(`"${fileNameEscaped}"`, 'gi'),
              new RegExp(`'${fileNameEscaped}'`, 'gi'),
              new RegExp(`\\b${fileNameEscaped}\\b`, 'gi'),
              new RegExp(`arquivo\\s+["']?${fileNameEscaped}["']?`, 'gi'),
              new RegExp(`dataset\\s+["']?${fileNameEscaped}["']?`, 'gi'),
            ]
            
            patterns.forEach(pattern => {
              response = response.replace(pattern, '')
            })
            
            // Limpar espaços duplos e quebras de linha extras
            response = response.replace(/\s+/g, ' ').trim()
            
            // Remover frases que começam com "no arquivo", "do arquivo", etc se ficarem vazias
            response = response.replace(/^(no|do|da|do arquivo|do dataset|no dataset)\s+[^a-záàâãéêíóôõúç]*/gi, '').trim()
          }
          
          // Remover fórmulas matemáticas complexas da resposta
          // Padrões para detectar fórmulas matemáticas
          const formulaPatterns = [
            // Equações lineares: y = mx + b, f(x) = ax + b, etc
            /\b[yf]\s*=\s*[a-z0-9\s*+\-()^]+/gi,
            // Fórmulas com somatórios: Σ(xi), Σ(xi - μ)², etc
            /[Σ∑]\s*\([^)]+\)/gi,
            // Fórmulas estatísticas: μ = Σx/n, σ² = Σ(xi - μ)²/n, etc
            /[μσ]\s*=\s*[^a-záàâãéêíóôõúç]+/gi,
            // Fórmulas com frações complexas: (a+b)/(c+d), etc
            /\([^)]+\)\s*\/\s*\([^)]+\)/g,
            // Fórmulas com potências: x², x³, a²+b², etc (mas manter números simples como 2², 3³)
            /\b[a-z]\s*[²³⁴⁵⁶⁷⁸⁹]+/gi,
            // Fórmulas com subscritos: xi, x̄, etc
            /\b[a-z]\s*[₀₁₂₃₄₅₆₇₈₉]+/gi,
          ]
          
          formulaPatterns.forEach(pattern => {
            response = response.replace(pattern, '')
          })
          
          // Limpar espaços duplos novamente após remover fórmulas
          response = response.replace(/\s+/g, ' ').trim()
          
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

