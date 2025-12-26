const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey)
}

// Função helper para verificar se é Admin do Banco
async function checkBankAdmin(adminClient, userId) {
  if (!userId) return false
  const { data: client } = await adminClient
    .from('clients')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()
  return client?.role === 'admin'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const adminClient = getAdminClient()

  // Verificar se é Admin do Banco para todas as operações
  // Tentar obter userId do token de autorização
  let userId = null
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    try {
      const { data: userResponse } = await adminClient.auth.getUser(token)
      if (userResponse?.user) {
        userId = userResponse.user.id
      }
    } catch (e) {
      console.warn('Error getting user from token:', e)
    }
  }
  
  // Fallback para outros métodos
  if (!userId) {
    userId = req.headers['x-user-id'] || req.body?.userId || req.query?.userId
  }

  if (!userId) {
    return res.status(401).json({ success: false, error: 'User ID is required' })
  }

  const isBankAdmin = await checkBankAdmin(adminClient, userId)
  if (!isBankAdmin) {
    return res.status(403).json({ success: false, error: 'Apenas administradores do banco podem acessar prospecção de clientes' })
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query
      
      if (id) {
        // Buscar prospect específico
        const { data, error } = await adminClient
          .from('prospects')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        return res.status(200).json({
          success: true,
          prospect: data
        })
      }

      // Listar prospects
      const { limit = 50, offset = 0, status, minScore } = req.query

      let query = adminClient
        .from('prospects')
        .select('*', { count: 'exact' })

      if (status) {
        query = query.eq('qualification_status', status)
      }

      if (minScore) {
        query = query.gte('score', parseFloat(minScore))
      }

      query = query.order('priority', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

      const { data, error, count } = await query

      if (error) throw error

      return res.status(200).json({
        success: true,
        prospects: data || [],
        total: count || 0
      })
    } catch (error) {
      console.error('Error fetching prospects:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch prospects'
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const prospectData = req.body
      
      // Preparar dados do prospect
      const prospect = {
        cpf: prospectData.cpf,
        cnpj: prospectData.cnpj || null,
        name: prospectData.name,
        email: prospectData.email || null,
        phone: prospectData.phone || null,
        score: prospectData.score || 0,
        qualification_status: prospectData.qualification_status || 'pending',
        market_signals: prospectData.market_signals || {},
        behavior_data: prospectData.behavior_data || {},
        consumption_profile: prospectData.consumption_profile || {},
        conversion_probability: prospectData.conversion_probability || null,
        priority: prospectData.priority || 0,
        notes: prospectData.notes || null,
        created_by: userId
      }

      // Inserir prospect
      const { data, error } = await adminClient
        .from('prospects')
        .insert(prospect)
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({
        success: true,
        prospect: data
      })
    } catch (error) {
      console.error('Error creating prospect:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create prospect'
      })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID is required'
        })
      }

      const adminClient = getAdminClient()
      
      const { data, error } = await adminClient
        .from('prospects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({
        success: true,
        prospect: data
      })
    } catch (error) {
      console.error('Error updating prospect:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update prospect'
      })
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  })
}
