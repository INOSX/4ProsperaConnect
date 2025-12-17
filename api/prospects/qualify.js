/**
 * API Route para qualificar prospects
 * Aplica critérios de qualificação, calcula score e prioriza
 */
import { supabase } from '../../src/services/supabase.js'

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
    const { prospectIds, criteriaId, userId } = req.body

    if (!prospectIds || !Array.isArray(prospectIds)) {
      return res.status(400).json({ error: 'prospectIds array is required' })
    }

    const adminClient = getAdminClient()

    // Buscar critérios de qualificação (ou usar padrão)
    let criteria = null
    if (criteriaId) {
      const { data, error } = await adminClient
        .from('qualification_criteria')
        .select('*')
        .eq('id', criteriaId)
        .eq('is_active', true)
        .single()

      if (!error && data) {
        criteria = data
      }
    }

    // Se não houver critérios, buscar critérios padrão ativos
    if (!criteria) {
      const { data } = await adminClient
        .from('qualification_criteria')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      criteria = data
    }

    // Critérios padrão se não houver nenhum
    const defaultCriteria = {
      criteria_rules: {
        min_score: 50,
        require_cnpj: false,
        require_market_signals: true
      },
      weights: {
        score: 0.4,
        market_signals: 0.3,
        behavior_data: 0.2,
        consumption_profile: 0.1
      },
      thresholds: {
        qualified: 70,
        high_priority: 80
      }
    }

    const qualificationRules = criteria?.criteria_rules || defaultCriteria.criteria_rules
    const weights = criteria?.weights || defaultCriteria.weights
    const thresholds = criteria?.thresholds || defaultCriteria.thresholds

    const qualifiedProspects = []

    for (const prospectId of prospectIds) {
      // Buscar prospect
      const { data: prospect, error } = await adminClient
        .from('prospects')
        .select('*')
        .eq('id', prospectId)
        .single()

      if (error || !prospect) {
        console.error(`Prospect ${prospectId} not found:`, error)
        continue
      }

      // Calcular score final baseado em pesos
      const finalScore = calculateQualificationScore(prospect, weights)

      // Aplicar critérios
      const qualification = applyQualificationCriteria(prospect, finalScore, qualificationRules, thresholds)

      // Atualizar prospect
      const { data: updatedProspect, error: updateError } = await adminClient
        .from('prospects')
        .update({
          score: finalScore,
          qualification_status: qualification.status,
          priority: qualification.priority,
          conversion_probability: finalScore / 100
        })
        .eq('id', prospectId)
        .select()
        .single()

      if (updateError) {
        console.error(`Error updating prospect ${prospectId}:`, updateError)
        continue
      }

      qualifiedProspects.push(updatedProspect)
    }

    // Ordenar por prioridade
    qualifiedProspects.sort((a, b) => b.priority - a.priority)

    return res.status(200).json({
      success: true,
      prospects: qualifiedProspects,
      total: qualifiedProspects.length,
      qualified: qualifiedProspects.filter(p => p.qualification_status === 'qualified').length
    })
  } catch (error) {
    console.error('Error qualifying prospects:', error)
    return res.status(500).json({
      error: error.message || 'Failed to qualify prospects'
    })
  }
}

function calculateQualificationScore(prospect, weights) {
  let finalScore = 0

  // Score base
  finalScore += (prospect.score || 0) * (weights.score || 0.4)

  // Market signals
  const marketSignalsCount = Object.keys(prospect.market_signals || {}).length
  finalScore += Math.min(marketSignalsCount * 10, 30) * (weights.market_signals || 0.3)

  // Behavior data
  const behaviorDataCount = Object.keys(prospect.behavior_data || {}).length
  finalScore += Math.min(behaviorDataCount * 5, 20) * (weights.behavior_data || 0.2)

  // Consumption profile
  const consumptionCount = Object.keys(prospect.consumption_profile || {}).length
  finalScore += Math.min(consumptionCount * 5, 10) * (weights.consumption_profile || 0.1)

  return Math.min(Math.round(finalScore), 100)
}

function applyQualificationCriteria(prospect, score, rules, thresholds) {
  let status = 'pending'
  let priority = 0

  // Verificar critérios mínimos
  if (score >= (thresholds.qualified || 70)) {
    status = 'qualified'
    priority = score >= (thresholds.high_priority || 80) ? 10 : 5
  } else if (score < 30) {
    status = 'rejected'
    priority = 0
  }

  // Verificar se requer CNPJ
  if (rules.require_cnpj && !prospect.cnpj) {
    status = 'pending'
    priority = Math.max(priority - 2, 0)
  }

  // Verificar se requer sinais de mercado
  if (rules.require_market_signals) {
    const hasSignals = Object.keys(prospect.market_signals || {}).length > 0
    if (!hasSignals) {
      status = 'pending'
      priority = Math.max(priority - 1, 0)
    }
  }

  return { status, priority }
}

