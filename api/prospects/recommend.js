/**
 * API Route para recomendar produtos para prospects
 * Baseado em perfil, comportamento e IA
 */
import OpenAI from 'openai'

const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey)
}

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

  try {
    const { prospectId, useAI = true } = req.body

    if (!prospectId) {
      return res.status(400).json({ error: 'prospectId is required' })
    }

    const adminClient = getAdminClient()

    // Buscar prospect
    const { data: prospect, error } = await adminClient
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single()

    if (error || !prospect) {
      return res.status(404).json({ error: 'Prospect not found' })
    }

    // Buscar catálogo de produtos
    const { data: products, error: productsError } = await adminClient
      .from('product_catalog')
      .select('*')
      .eq('is_active', true)

    if (productsError) {
      console.error('Error fetching products:', productsError)
    }

    const availableProducts = products || []

    // Gerar recomendações
    let recommendations = []

    if (useAI && process.env.OPENAI_API_KEY) {
      // Usar IA para gerar recomendações
      const openaiClient = initializeOpenAI()
      if (openaiClient) {
        recommendations = await generateAIRecommendations(openaiClient, prospect, availableProducts)
      } else {
        // Fallback para recomendações baseadas em regras
        recommendations = generateRuleBasedRecommendations(prospect, availableProducts)
      }
    } else {
      // Usar regras simples
      recommendations = generateRuleBasedRecommendations(prospect, availableProducts)
    }

    // Salvar recomendações no banco
    const savedRecommendations = []
    for (const rec of recommendations) {
      const { data, error: insertError } = await adminClient
        .from('recommendations')
        .insert({
          target_type: 'prospect',
          target_id: prospectId,
          recommendation_type: 'product',
          product_id: rec.product_id,
          title: rec.title,
          description: rec.description,
          reasoning: rec.reasoning,
          priority: rec.priority,
          ai_generated: useAI
        })
        .select()
        .single()

      if (!insertError && data) {
        savedRecommendations.push(data)
      }
    }

    return res.status(200).json({
      success: true,
      recommendations: savedRecommendations,
      total: savedRecommendations.length
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return res.status(500).json({
      error: error.message || 'Failed to generate recommendations'
    })
  }
}

async function generateAIRecommendations(openaiClient, prospect, products) {
  try {
    const prompt = `Analise o seguinte prospect e recomende produtos financeiros adequados:

Perfil do Prospect:
- Nome: ${prospect.name}
- CPF: ${prospect.cpf}
- Score: ${prospect.score}
- Status: ${prospect.qualification_status}
- Sinais de Mercado: ${JSON.stringify(prospect.market_signals)}
- Perfil de Consumo: ${JSON.stringify(prospect.consumption_profile)}

Produtos Disponíveis:
${products.map(p => `- ${p.name} (${p.product_type}): ${p.description}`).join('\n')}

Gere até 3 recomendações de produtos, priorizando aqueles mais adequados ao perfil.
Para cada recomendação, forneça:
1. ID do produto
2. Título da recomendação
3. Descrição/razão
4. Prioridade (1-10)

Responda em formato JSON:
{
  "recommendations": [
    {
      "product_id": "uuid",
      "title": "Título",
      "description": "Descrição",
      "reasoning": "Por que este produto é adequado",
      "priority": 8
    }
  ]
}`

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em produtos financeiros para PMEs e MEIs.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const content = JSON.parse(response.choices[0].message.content)
    return content.recommendations || []
  } catch (error) {
    console.error('Error in AI recommendation generation:', error)
    return []
  }
}

function generateRuleBasedRecommendations(prospect, products) {
  const recommendations = []

  // Regras básicas baseadas em score e tipo
  if (prospect.score >= 70) {
    // Prospects qualificados - recomendar produtos premium
    const premiumProducts = products.filter(p => 
      p.product_type === 'account' || p.product_type === 'credit'
    )
    
    premiumProducts.slice(0, 2).forEach(product => {
      recommendations.push({
        product_id: product.id,
        title: `Recomendamos: ${product.name}`,
        description: product.description,
        reasoning: `Produto adequado para prospects qualificados com score ${prospect.score}`,
        priority: 8
      })
    })
  } else if (prospect.score >= 50) {
    // Prospects médios - recomendar produtos básicos
    const basicProducts = products.filter(p => 
      p.product_type === 'account' || p.product_type === 'service'
    )
    
    basicProducts.slice(0, 1).forEach(product => {
      recommendations.push({
        product_id: product.id,
        title: `Sugestão: ${product.name}`,
        description: product.description,
        reasoning: `Produto adequado para prospects com potencial de crescimento`,
        priority: 5
      })
    })
  }

  return recommendations
}

