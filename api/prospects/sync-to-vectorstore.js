/**
 * API Route para sincronizar dados de prospecção com o vectorstore
 */
const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey)
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
    const { userId, prospectIds, syncAll } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const adminClient = getAdminClient()
    const { ProspectVectorstoreService } = await import('../../src/services/ProspectVectorstoreService.js')
    const { ClientService } = await import('../../src/services/clientService.js')
    const { OpenAIService } = await import('../../src/services/openaiService.js')

    // Buscar cliente e vectorstore
    const clientResult = await ClientService.getClientByUserId(userId)
    if (!clientResult.success || !clientResult.client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const client = clientResult.client
    if (!client.vectorstore_id) {
      return res.status(400).json({ error: 'Vectorstore not configured for this client' })
    }

    // Buscar prospects
    let prospects = []
    if (syncAll) {
      const { data, error } = await adminClient
        .from('prospects')
        .select('*')
        .or(`created_by.eq.${userId},created_by.is.null`)
        .limit(1000)

      if (error) throw error
      prospects = data || []
    } else if (prospectIds && Array.isArray(prospectIds)) {
      const { data, error } = await adminClient
        .from('prospects')
        .select('*')
        .in('id', prospectIds)

      if (error) throw error
      prospects = data || []
    } else {
      return res.status(400).json({ error: 'prospectIds or syncAll is required' })
    }

    // Buscar métricas de scoring
    const prospectIdsList = prospects.map(p => p.id)
    const { data: metricsData } = await adminClient
      .from('prospect_scoring_metrics')
      .select('*')
      .in('prospect_id', prospectIdsList)

    const metricsMap = {}
    if (metricsData) {
      metricsData.forEach(m => {
        metricsMap[m.prospect_id] = m
      })
    }

    // Formatar e fazer upload para vectorstore
    // Converter para formato de array de objetos para o uploadDataToVectorstore
    const dataForUpload = []
    for (const prospect of prospects) {
      const metrics = metricsMap[prospect.id] || null
      const formattedText = ProspectVectorstoreService.formatProspectForVectorstore(prospect, metrics)
      // Criar objeto com a estrutura esperada
      dataForUpload.push({
        prospect_id: prospect.id,
        name: prospect.name,
        cpf: prospect.cpf,
        cnpj: prospect.cnpj || '',
        score: prospect.score || 0,
        ltv_estimate: prospect.ltv_estimate || metrics?.ltv_estimate || 0,
        churn_risk: prospect.churn_risk || metrics?.churn_risk || 0,
        conversion_probability: (prospect.conversion_probability || metrics?.conversion_probability || 0) * 100,
        qualification_status: prospect.qualification_status,
        data: formattedText
      })
    }

    // Fazer upload para vectorstore
    const uploadResult = await OpenAIService.uploadDataToVectorstore(
      client.vectorstore_id,
      dataForUpload,
      'prospects_data.csv'
    )

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload to vectorstore')
    }

    return res.status(200).json({
      success: true,
      synced: prospects.length,
      vectorstoreId: client.vectorstore_id
    })
  } catch (error) {
    console.error('Error in sync-to-vectorstore API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to sync prospects to vectorstore'
    })
  }
}

