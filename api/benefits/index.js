/**
 * API Route para gestão de benefícios
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
        const { id, companyId, employeeId } = req.query

        if (id) {
          // Buscar benefício específico
          const { data, error } = await adminClient
            .from('company_benefits')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error
          return res.status(200).json({ success: true, benefit: data })
        }

        if (companyId) {
          // Buscar benefícios da empresa
          const { data, error } = await adminClient
            .from('company_benefits')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

          if (error) throw error
          return res.status(200).json({ success: true, benefits: data || [] })
        }

        if (employeeId) {
          // Buscar benefícios do colaborador
          const { data, error } = await adminClient
            .from('employee_benefits')
            .select(`
              *,
              company_benefits (*)
            `)
            .eq('employee_id', employeeId)
            .eq('status', 'active')

          if (error) throw error
          return res.status(200).json({ success: true, benefits: data || [] })
        }

        return res.status(400).json({ error: 'id, companyId, or employeeId is required' })
      }

      case 'POST': {
        const { company_id, benefit_type, name, description, configuration, eligibility_rules } = req.body

        if (!company_id || !benefit_type || !name) {
          return res.status(400).json({ error: 'company_id, benefit_type, and name are required' })
        }

        const { data, error } = await adminClient
          .from('company_benefits')
          .insert({
            company_id,
            benefit_type,
            name,
            description,
            configuration: configuration || {},
            eligibility_rules: eligibility_rules || {}
          })
          .select()
          .single()

        if (error) throw error
        return res.status(201).json({ success: true, benefit: data })
      }

      case 'PUT': {
        const { id, ...updates } = req.body

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        const { data, error } = await adminClient
          .from('company_benefits')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, benefit: data })
      }

      case 'DELETE': {
        const { id } = req.query

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        // Soft delete
        const { data, error } = await adminClient
          .from('company_benefits')
          .update({ is_active: false })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, benefit: data })
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in benefits API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process request'
    })
  }
}

