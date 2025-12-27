/**
 * API Route para geração de embeddings usando OpenAI Embeddings API
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
      case 'generateEmbedding': {
        const { text, model = 'text-embedding-3-large' } = params

        if (!text) {
          return res.status(400).json({ error: 'Text is required' })
        }

        console.log('Generating embedding for text:', text.substring(0, 50) + '...')

        const response = await openaiClient.embeddings.create({
          model: model,
          input: text,
          dimensions: model === 'text-embedding-3-large' ? 3072 : 1536
        })

        const embedding = response.data[0].embedding

        return res.status(200).json({
          success: true,
          embedding,
          model: response.model,
          dimensions: embedding.length
        })
      }

      case 'generateBatch': {
        const { texts, model = 'text-embedding-3-large' } = params

        if (!texts || !Array.isArray(texts) || texts.length === 0) {
          return res.status(400).json({ error: 'Texts array is required' })
        }

        // Limitar batch size para evitar rate limits
        const maxBatchSize = 100
        const batches = []
        for (let i = 0; i < texts.length; i += maxBatchSize) {
          batches.push(texts.slice(i, i + maxBatchSize))
        }

        const allEmbeddings = []
        for (const batch of batches) {
          console.log(`Generating embeddings for batch of ${batch.length} texts...`)

          const response = await openaiClient.embeddings.create({
            model: model,
            input: batch,
            dimensions: model === 'text-embedding-3-large' ? 3072 : 1536
          })

          allEmbeddings.push(...response.data.map(item => item.embedding))
        }

        return res.status(200).json({
          success: true,
          embeddings: allEmbeddings,
          model: model,
          dimensions: allEmbeddings[0]?.length || 0,
          count: allEmbeddings.length
        })
      }

      default:
        return res.status(400).json({ error: 'Unknown action' })
    }
  } catch (error) {
    console.error('Error in embeddings API:', error)
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

