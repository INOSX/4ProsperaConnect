/**
 * API Route para rastrear aceitação/rejeição de recomendações
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { recommendationId, status, feedback } = req.body

    if (!recommendationId || !status) {
      return res.status(400).json({ error: 'recommendationId and status are required' })
    }

    if (!['accepted', 'rejected', 'expired'].includes(status)) {
      return res.status(400).json({ error: 'status must be accepted, rejected, or expired' })
    }

    const adminClient = getAdminClient()

    // Atualizar recomendação
    const updates = {
      status,
      acceptance_tracked_at: new Date().toISOString()
    }

    if (feedback) {
      updates.description = (updates.description || '') + `\n\nFeedback: ${feedback}`
    }

    const { data, error } = await adminClient
      .from('recommendations')
      .update(updates)
      .eq('id', recommendationId)
      .select()
      .single()

    if (error) throw error

    // Se aceito, pode atualizar métricas de campanha se houver
    if (status === 'accepted') {
      // Buscar campanha relacionada se houver
      // (implementação futura)
    }

    return res.status(200).json({
      success: true,
      recommendation: data
    })
  } catch (error) {
    console.error('Error tracking recommendation:', error)
    return res.status(500).json({
      error: error.message || 'Failed to track recommendation'
    })
  }
}

