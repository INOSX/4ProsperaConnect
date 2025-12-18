/**
 * API Route para calcular scores avançados de prospecção
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
    const { prospectIds, weights } = req.body

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return res.status(400).json({ error: 'prospectIds array is required' })
    }

    const adminClient = getAdminClient()
    const { AdvancedScoringService } = await import('../../src/services/AdvancedScoringService.js')

    const results = []

    for (const prospectId of prospectIds) {
      try {
        // Buscar prospect
        const { data: prospect, error: prospectError } = await adminClient
          .from('prospects')
          .select('*')
          .eq('id', prospectId)
          .single()

        if (prospectError || !prospect) {
          results.push({
            prospectId,
            success: false,
            error: 'Prospect not found'
          })
          continue
        }

        // Calcular scores
        const metrics = await AdvancedScoringService.getCombinedScore(prospect, weights)

        // Salvar métricas
        await AdvancedScoringService.saveScoringMetrics(prospectId, metrics)

        results.push({
          prospectId,
          success: true,
          metrics
        })
      } catch (error) {
        console.error(`Error calculating score for prospect ${prospectId}:`, error)
        results.push({
          prospectId,
          success: false,
          error: error.message
        })
      }
    }

    return res.status(200).json({
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length
    })
  } catch (error) {
    console.error('Error in calculate-advanced-score API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to calculate scores'
    })
  }
}

