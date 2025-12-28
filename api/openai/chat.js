/**
 * API Route para chat com OpenAI (usado pelo QueryPlanningAgent)
 */
import OpenAI from 'openai'

function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in environment variables')
    return null
  }

  return new OpenAI({
    apiKey: apiKey
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
    const { messages, model = 'gpt-4o-mini', temperature = 0.3, response_format } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    console.log('[OpenAI Chat API] Processing chat request:', {
      model,
      messagesCount: messages.length,
      hasResponseFormat: !!response_format
    })

    const completion = await openaiClient.chat.completions.create({
      model: model,
      messages: messages,
      temperature: temperature,
      response_format: response_format || undefined
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return res.status(500).json({ error: 'No response from OpenAI' })
    }

    return res.status(200).json({
      choices: [{
        message: {
          content: response
        }
      }]
    })
  } catch (error) {
    console.error('[OpenAI Chat API] Error:', error)
    return res.status(500).json({
      error: error.message || 'Error processing chat request'
    })
  }
}

