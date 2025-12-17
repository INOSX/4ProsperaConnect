/**
 * API Route para gerar recomendações via IA
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
    const { targetType, targetId, useAI = true } = req.body

    if (!targetType || !targetId) {
      return res.status(400).json({ error: 'targetType and targetId are required' })
    }

    const adminClient = getAdminClient()

    // Buscar dados do target
    let targetData = null
    let contextData = {}

    switch (targetType) {
      case 'prospect': {
        const { data, error } = await adminClient
          .from('prospects')
          .select('*')
          .eq('id', targetId)
          .single()

        if (error) throw error
        targetData = data
        contextData = {
          score: data.score,
          market_signals: data.market_signals,
          consumption_profile: data.consumption_profile
        }
        break
      }

      case 'company': {
        const { data, error } = await adminClient
          .from('companies')
          .select(`
            *,
            employees (*),
            company_benefits (*)
          `)
          .eq('id', targetId)
          .single()

        if (error) throw error
        targetData = data
        contextData = {
          company_type: data.company_type,
          employee_count: data.employee_count,
          annual_revenue: data.annual_revenue,
          products_contracted: data.products_contracted,
          benefits_count: data.company_benefits?.length || 0
        }
        break
      }

      case 'employee': {
        const { data, error } = await adminClient
          .from('employees')
          .select(`
            *,
            companies (*),
            employee_benefits (*)
          `)
          .eq('id', targetId)
          .single()

        if (error) throw error
        targetData = data
        contextData = {
          position: data.position,
          department: data.department,
          salary: data.salary,
          company_type: data.companies?.company_type,
          benefits_count: data.employee_benefits?.length || 0
        }
        break
      }

      default:
        return res.status(400).json({ error: `Invalid targetType: ${targetType}` })
    }

    // Buscar produtos disponíveis
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
      const openaiClient = initializeOpenAI()
      if (openaiClient) {
        recommendations = await generateAIRecommendations(openaiClient, targetType, targetData, contextData, availableProducts)
      } else {
        recommendations = generateRuleBasedRecommendations(targetType, contextData, availableProducts)
      }
    } else {
      recommendations = generateRuleBasedRecommendations(targetType, contextData, availableProducts)
    }

    // Salvar recomendações
    const savedRecommendations = []
    for (const rec of recommendations) {
      const { data, error: insertError } = await adminClient
        .from('recommendations')
        .insert({
          target_type: targetType,
          target_id: targetId,
          recommendation_type: rec.type || 'product',
          product_id: rec.product_id,
          title: rec.title,
          description: rec.description,
          reasoning: rec.reasoning,
          priority: rec.priority,
          ai_generated: useAI && !!process.env.OPENAI_API_KEY
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

async function generateAIRecommendations(openaiClient, targetType, targetData, contextData, products) {
  try {
    const prompt = `Gere recomendações personalizadas de produtos financeiros:

Tipo de Target: ${targetType}
Contexto: ${JSON.stringify(contextData, null, 2)}

Produtos Disponíveis:
${products.map(p => `- ${p.name} (${p.product_type}): ${p.description}`).join('\n')}

Gere até 3 recomendações personalizadas. Para cada uma, forneça:
1. product_id
2. title
3. description
4. reasoning (por que é adequado)
5. priority (1-10)
6. type (product/service/benefit/action)

Formato JSON:
{
  "recommendations": [
    {
      "product_id": "uuid",
      "title": "Título",
      "description": "Descrição",
      "reasoning": "Razão",
      "priority": 8,
      "type": "product"
    }
  ]
}`

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em produtos financeiros e recomendações personalizadas.' },
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

function generateRuleBasedRecommendations(targetType, contextData, products) {
  const recommendations = []

  if (targetType === 'prospect') {
    if (contextData.score >= 70) {
      const premiumProducts = products.filter(p => p.product_type === 'account' || p.product_type === 'credit')
      premiumProducts.slice(0, 2).forEach(product => {
        recommendations.push({
          product_id: product.id,
          title: `Recomendamos: ${product.name}`,
          description: product.description,
          reasoning: `Adequado para prospects qualificados`,
          priority: 8,
          type: 'product'
        })
      })
    }
  } else if (targetType === 'company') {
    if (contextData.employee_count > 10) {
      const benefitProducts = products.filter(p => p.product_type === 'benefit')
      benefitProducts.slice(0, 1).forEach(product => {
        recommendations.push({
          product_id: product.id,
          title: `Benefício para sua equipe: ${product.name}`,
          description: product.description,
          reasoning: `Ideal para empresas com ${contextData.employee_count} colaboradores`,
          priority: 7,
          type: 'benefit'
        })
      })
    }
  } else if (targetType === 'employee') {
    const personalProducts = products.filter(p => 
      p.product_type === 'account' || p.product_type === 'service'
    )
    personalProducts.slice(0, 1).forEach(product => {
      recommendations.push({
        product_id: product.id,
        title: `Produto pessoal: ${product.name}`,
        description: product.description,
        reasoning: `Recomendado para colaboradores`,
        priority: 6,
        type: 'product'
      })
    })
  }

  return recommendations
}

