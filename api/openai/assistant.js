/**
 * API Route para OpenAI Assistant
 * Mantém a chave da API segura no servidor
 */
import OpenAI from 'openai'

function getOpenAIProjectId() {
  return process.env.OPENAI_PROJECT_ID || 'proj_rRapPtQ3Q0EOtuqYNUcVglYk'
}

function initializeOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    defaultHeaders: {
      'OpenAI-Project': getOpenAIProjectId(),
    },
  })
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const openaiClient = initializeOpenAI()
  if (!openaiClient) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  try {
    const { action, ...params } = req.body

    if (!action) {
      return res.status(400).json({ error: 'Action is required' })
    }

    switch (action) {
      case 'createThread': {
        console.log('Creating OpenAI thread...')
        const thread = await openaiClient.beta.threads.create()
        console.log('✅ Thread created:', thread.id)
        return res.status(200).json({ threadId: thread.id })
      }

      case 'getResponse': {
        const { threadId, assistantId, message, fileName } = params

        if (!threadId || !assistantId || !message) {
          return res.status(400).json({ error: 'threadId, assistantId, and message are required' })
        }

        console.log('Getting response from OpenAI Assistant...', {
          threadId,
          assistantId,
          messageLength: message.length,
          fileName
        })

        // Construir mensagem com contexto do arquivo se fornecido
        let contextualMessage = message
        if (fileName) {
          contextualMessage = `Você é um assistente especializado em análise de dados. O usuário está trabalhando com dados de um arquivo chamado "${fileName}".

INSTRUÇÕES CRÍTICAS:
- Use os dados do vectorstore vinculado a este assistant para responder perguntas sobre os dados
- NUNCA mencione o nome do arquivo "${fileName}" na sua resposta
- NUNCA mencione extensões de arquivo como ".csv", ".xlsx" ou similares
- NUNCA mencione termos técnicos como "dataset", "vectorstore" ou "arquivo"
- Responda naturalmente como se estivesse falando sobre os dados diretamente
- Se a pergunta for sobre gráficos, análises ou dados, use as informações do vectorstore para fornecer uma resposta precisa e útil
- Foque apenas nas informações e análises dos dados, nunca nas fontes ou arquivos técnicos

REGRAS SOBRE CÁLCULOS E FÓRMULAS:
- NUNCA recite fórmulas matemáticas detalhadas ou complexas
- NUNCA mencione equações como "y = mx + b", "Σ(xi - μ)² / n" ou fórmulas similares
- Se precisar mencionar cálculos, faça apenas em ALTO NÍVEL usando linguagem natural
- Exemplos: "Calculei a média", "Somei os valores", "Comparei os períodos"
- Sempre descreva os cálculos em linguagem natural, adequada para conversação por voz

Pergunta do usuário: ${message}`
        }

        // Adicionar mensagem do usuário à thread
        await openaiClient.beta.threads.messages.create(threadId, {
          role: 'user',
          content: contextualMessage
        })

        // Executar o assistente
        const run = await openaiClient.beta.threads.runs.create(threadId, {
          assistant_id: assistantId,
        })

        console.log('✅ Run created:', run.id)

        // Aguardar conclusão do run
        let runStatus = await openaiClient.beta.threads.runs.retrieve(threadId, run.id)
        let attempts = 0
        const maxAttempts = 60 // 60 segundos máximo

        while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
          if (attempts >= maxAttempts) {
            throw new Error('Timeout waiting for assistant response')
          }
          await new Promise(resolve => setTimeout(resolve, 1000)) // Aguardar 1 segundo
          runStatus = await openaiClient.beta.threads.runs.retrieve(threadId, run.id)
          attempts++
        }

        if (runStatus.status === 'failed') {
          console.error('Run failed:', runStatus.last_error)
          throw new Error(runStatus.last_error?.message || 'Assistant run failed')
        }

        // Obter mensagens da thread
        const messages = await openaiClient.beta.threads.messages.list(threadId, {
          limit: 1
        })

        const assistantMessage = messages.data[0]
        if (!assistantMessage || assistantMessage.role !== 'assistant') {
          throw new Error('No assistant message found')
        }

        // Extrair texto da resposta
        const content = assistantMessage.content[0]
        if (content.type !== 'text') {
          throw new Error('Assistant response is not text')
        }

        const responseText = content.text.value
        console.log('✅ Assistant response received:', responseText.substring(0, 100) + '...')

        return res.status(200).json({ response: responseText })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Error in OpenAI Assistant API:', error)
    return res.status(500).json({ 
      error: error.message || 'Failed to process request',
      details: error.stack?.substring(0, 500)
    })
  }
}

