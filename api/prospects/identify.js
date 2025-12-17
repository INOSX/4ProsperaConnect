/**
 * API Route para identificar potenciais CNPJs
 * Analisa CPF, calcula scoring e identifica sinais de mercado
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
    const { cpfs, userId } = req.body

    if (!cpfs || !Array.isArray(cpfs) || cpfs.length === 0) {
      return res.status(400).json({ error: 'cpfs array is required' })
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const adminClient = getAdminClient()
    const prospects = []

    for (const cpfData of cpfs) {
      const cpf = typeof cpfData === 'string' ? cpfData : cpfData.cpf
      const name = typeof cpfData === 'object' ? cpfData.name : null
      const email = typeof cpfData === 'object' ? cpfData.email : null
      const phone = typeof cpfData === 'object' ? cpfData.phone : null

      // Calcular score básico (será melhorado com IA)
      const score = calculateBasicScore(cpfData)

      // Identificar sinais de mercado básicos
      const marketSignals = identifyMarketSignals(cpfData)

      // Verificar se já existe CNPJ vinculado
      const { data: existingMapping } = await adminClient
        .from('cpf_to_cnpj_mapping')
        .select('*')
        .eq('cpf', cpf)
        .eq('is_active', true)
        .maybeSingle()

      const prospect = {
        cpf,
        name: name || 'Nome não informado',
        email: email || null,
        phone: phone || null,
        score,
        qualification_status: 'pending',
        market_signals: marketSignals,
        behavior_data: typeof cpfData === 'object' ? cpfData.behavior || {} : {},
        consumption_profile: typeof cpfData === 'object' ? cpfData.consumption || {} : {},
        conversion_probability: score / 100,
        priority: Math.floor(score / 10),
        created_by: userId,
        cnpj: existingMapping?.cnpj || null
      }

      // Inserir ou atualizar prospect
      const { data: existingProspect } = await adminClient
        .from('prospects')
        .select('*')
        .eq('cpf', cpf)
        .maybeSingle()

      let prospectData
      if (existingProspect) {
        const { data, error } = await adminClient
          .from('prospects')
          .update(prospect)
          .eq('id', existingProspect.id)
          .select()
          .single()

        if (error) throw error
        prospectData = data
      } else {
        const { data, error } = await adminClient
          .from('prospects')
          .insert(prospect)
          .select()
          .single()

        if (error) throw error
        prospectData = data
      }

      // Criar sinais de mercado
      if (Object.keys(marketSignals).length > 0) {
        await adminClient
          .from('market_signals')
          .insert({
            prospect_id: prospectData.id,
            signal_type: 'behavior',
            signal_data: marketSignals,
            strength: score / 100,
            source: 'auto_analysis'
          })
      }

      prospects.push(prospectData)
    }

    return res.status(200).json({
      success: true,
      prospects,
      total: prospects.length
    })
  } catch (error) {
    console.error('Error identifying prospects:', error)
    return res.status(500).json({
      error: error.message || 'Failed to identify prospects'
    })
  }
}

function calculateBasicScore(cpfData) {
  let score = 0

  // Fatores básicos (será melhorado com IA)
  if (typeof cpfData === 'object') {
    if (cpfData.transaction_volume) score += 20
    if (cpfData.frequency) score += 15
    if (cpfData.business_indicators) score += 25
    if (cpfData.consumption_pattern) score += 20
    if (cpfData.market_signals) score += 20
  } else {
    // Score padrão para CPF simples
    score = 30
  }

  return Math.min(score, 100)
}

function identifyMarketSignals(cpfData) {
  const signals = {}

  if (typeof cpfData === 'object') {
    if (cpfData.transaction_volume) {
      signals.high_transaction_volume = cpfData.transaction_volume > 10000
    }
    if (cpfData.frequency) {
      signals.frequent_activity = cpfData.frequency > 10
    }
    if (cpfData.business_indicators) {
      signals.business_activity = true
    }
  }

  return signals
}

