/**
 * API Route para mapear campos de dados externos
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
    const { sourceFields, targetSchema, useAI = true, connectionId } = req.body

    if (!sourceFields || !Array.isArray(sourceFields)) {
      return res.status(400).json({ error: 'sourceFields array is required' })
    }

    if (!targetSchema || typeof targetSchema !== 'object') {
      return res.status(400).json({ error: 'targetSchema object is required' })
    }

    let fieldMapping = {}

    if (useAI && process.env.OPENAI_API_KEY) {
      // Usar IA para mapear campos automaticamente
      const openaiClient = initializeOpenAI()
      if (openaiClient) {
        fieldMapping = await generateAIFieldMapping(openaiClient, sourceFields, targetSchema)
      } else {
        // Fallback para mapeamento básico
        fieldMapping = generateBasicFieldMapping(sourceFields, targetSchema)
      }
    } else {
      // Mapeamento básico por similaridade de nomes
      fieldMapping = generateBasicFieldMapping(sourceFields, targetSchema)
    }

    // Salvar mapeamento se connectionId fornecido
    if (connectionId) {
      const adminClient = getAdminClient()
      
      // Buscar ou criar external_data_source
      const { data: existing } = await adminClient
        .from('external_data_sources')
        .select('*')
        .eq('connection_id', connectionId)
        .maybeSingle()

      const dataSourceData = {
        connection_id: connectionId,
        source_name: 'External Data Source',
        data_structure: { fields: sourceFields },
        field_mapping: fieldMapping,
        validation_rules: {}
      }

      if (existing) {
        await adminClient
          .from('external_data_sources')
          .update(dataSourceData)
          .eq('id', existing.id)
      } else {
        await adminClient
          .from('external_data_sources')
          .insert(dataSourceData)
      }
    }

    return res.status(200).json({
      success: true,
      fieldMapping,
      aiGenerated: useAI && !!process.env.OPENAI_API_KEY
    })
  } catch (error) {
    console.error('Error mapping fields:', error)
    return res.status(500).json({
      error: error.message || 'Failed to map fields'
    })
  }
}

async function generateAIFieldMapping(openaiClient, sourceFields, targetSchema) {
  try {
    const prompt = `Mapeie os campos de origem para os campos de destino:

Campos de Origem:
${sourceFields.map((f, i) => `${i + 1}. ${f.name} (${f.type || 'unknown'})`).join('\n')}

Schema de Destino:
${Object.keys(targetSchema).map(key => `- ${key}: ${targetSchema[key]}`).join('\n')}

Gere um mapeamento JSON onde cada campo de origem é mapeado para o campo de destino mais apropriado.
Se um campo não tiver correspondência clara, use null.

Formato:
{
  "mappings": {
    "campo_origem_1": "campo_destino_1",
    "campo_origem_2": "campo_destino_2",
    ...
  }
}`

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um especialista em mapeamento de dados e integração de sistemas.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const content = JSON.parse(response.choices[0].message.content)
    return content.mappings || {}
  } catch (error) {
    console.error('Error in AI field mapping:', error)
    return {}
  }
}

function generateBasicFieldMapping(sourceFields, targetSchema) {
  const mapping = {}
  const targetKeys = Object.keys(targetSchema).map(k => k.toLowerCase())

  for (const sourceField of sourceFields) {
    const sourceName = sourceField.name.toLowerCase()
    
    // Buscar correspondência exata
    let matched = targetKeys.find(t => t === sourceName)
    
    // Buscar correspondência parcial
    if (!matched) {
      matched = targetKeys.find(t => 
        sourceName.includes(t) || t.includes(sourceName) ||
        sourceName.replace(/_/g, '') === t.replace(/_/g, '')
      )
    }

    // Buscar por palavras-chave comuns
    if (!matched) {
      const keywords = {
        'cpf': ['cpf', 'document', 'id'],
        'nome': ['name', 'nome', 'name'],
        'email': ['email', 'e-mail'],
        'telefone': ['phone', 'telefone', 'tel'],
        'cnpj': ['cnpj', 'company_id']
      }

      for (const [key, variations] of Object.entries(keywords)) {
        if (variations.some(v => sourceName.includes(v))) {
          matched = targetKeys.find(t => t.includes(key))
          if (matched) break
        }
      }
    }

    mapping[sourceField.name] = matched || null
  }

  return mapping
}

