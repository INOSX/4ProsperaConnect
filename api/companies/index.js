/**
 * API Route para CRUD de empresas
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
        const { id, cnpj, ownerUserId } = req.query

        if (id) {
          // Buscar empresa específica
          const { data, error } = await adminClient
            .from('companies')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error
          return res.status(200).json({ success: true, company: data })
        }

        if (cnpj) {
          // Buscar por CNPJ
          const { data, error } = await adminClient
            .from('companies')
            .select('*')
            .eq('cnpj', cnpj)
            .maybeSingle()

          if (error) throw error
          return res.status(200).json({ success: true, company: data })
        }

        if (ownerUserId) {
          // Buscar empresas do usuário
          const { data, error } = await adminClient
            .from('companies')
            .select('*')
            .eq('owner_user_id', ownerUserId)
            .order('created_at', { ascending: false })

          if (error) throw error
          return res.status(200).json({ success: true, companies: data || [] })
        }

        // Listar todas (com limite)
        const { data, error } = await adminClient
          .from('companies')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        return res.status(200).json({ success: true, companies: data || [] })
      }

      case 'POST': {
        const { cnpj, company_name, trade_name, company_type, email, phone, address, owner_user_id, industry, annual_revenue } = req.body

        if (!cnpj || !company_name || !owner_user_id) {
          return res.status(400).json({ error: 'cnpj, company_name, and owner_user_id are required' })
        }

        // Verificar se já existe
        const { data: existing } = await adminClient
          .from('companies')
          .select('*')
          .eq('cnpj', cnpj)
          .maybeSingle()

        if (existing) {
          return res.status(409).json({ error: 'Company with this CNPJ already exists', company: existing })
        }

        const { data, error } = await adminClient
          .from('companies')
          .insert({
            cnpj,
            company_name,
            trade_name,
            company_type,
            email,
            phone,
            address,
            owner_user_id,
            industry,
            annual_revenue,
            banking_status: 'partial'
          })
          .select()
          .single()

        if (error) throw error
        return res.status(201).json({ success: true, company: data })
      }

      case 'PUT': {
        const { id, ...updates } = req.body

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        const { data, error } = await adminClient
          .from('companies')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, company: data })
      }

      case 'DELETE': {
        const { id } = req.query

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        // Soft delete
        const { data, error } = await adminClient
          .from('companies')
          .update({ is_active: false })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, company: data })
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in companies API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process request'
    })
  }
}

