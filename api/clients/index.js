/**
 * API Route para CRUD de clientes
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const adminClient = getAdminClient()

  try {
    switch (req.method) {
      case 'GET': {
        const { userId, id } = req.query

        if (userId) {
          // Buscar cliente por user_id
          const { data, error } = await adminClient
            .from('clients')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()

          if (error) throw error
          return res.status(200).json({ success: true, client: data })
        }

        if (id) {
          // Buscar cliente por ID
          const { data, error } = await adminClient
            .from('clients')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error
          return res.status(200).json({ success: true, client: data })
        }

        // Listar todos (com limite)
        const { data, error } = await adminClient
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        return res.status(200).json({ success: true, clients: data || [] })
      }

      case 'PUT': {
        const { id, ...updates } = req.body

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        // Validar role se estiver sendo atualizado
        if (updates.role && !['user', 'admin'].includes(updates.role)) {
          return res.status(400).json({ error: 'role must be "user" or "admin"' })
        }

        const { data, error } = await adminClient
          .from('clients')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, client: data })
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in clients API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process request'
    })
  }
}

