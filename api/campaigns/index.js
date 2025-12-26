/**
 * API Route para CRUD de campanhas
 */
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
    return res.status(401).json({ error: 'User ID is required' })
  }

  const isBankAdmin = await checkBankAdmin(adminClient, userId)
  if (!isBankAdmin) {
    return res.status(403).json({ error: 'Apenas administradores do banco podem acessar campanhas de marketing' })
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { id, status, type, createdBy } = req.query

        if (id) {
          const { data, error } = await adminClient
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error
          return res.status(200).json({ success: true, campaign: data })
        }

        let query = adminClient.from('campaigns').select('*')

        if (status) query = query.eq('status', status)
        if (type) query = query.eq('campaign_type', type)
        if (createdBy) query = query.eq('created_by', createdBy)

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return res.status(200).json({ success: true, campaigns: data || [] })
      }

      case 'POST': {
        const { name, description, campaign_type, target_segment, products_recommended, start_date, end_date, created_by } = req.body

        if (!name || !campaign_type || !target_segment || !created_by) {
          return res.status(400).json({ error: 'name, campaign_type, target_segment, and created_by are required' })
        }

        const { data, error } = await adminClient
          .from('campaigns')
          .insert({
            name,
            description,
            campaign_type,
            target_segment,
            products_recommended: products_recommended || [],
            status: 'draft',
            start_date,
            end_date,
            metrics: {},
            created_by
          })
          .select()
          .single()

        if (error) throw error
        return res.status(201).json({ success: true, campaign: data })
      }

      case 'PUT': {
        const { id, ...updates } = req.body

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        const { data, error } = await adminClient
          .from('campaigns')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, campaign: data })
      }

      case 'DELETE': {
        const { id } = req.query

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        // Soft delete (mudar status para cancelled)
        const { data, error } = await adminClient
          .from('campaigns')
          .update({ status: 'cancelled' })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, campaign: data })
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in campaigns API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process request'
    })
  }
}

