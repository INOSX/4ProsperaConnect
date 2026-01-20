/**
 * API Route para benefícios por colaborador
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
        const { employeeId } = req.query

        if (!employeeId) {
          return res.status(400).json({ error: 'employeeId is required' })
        }

        const { data, error } = await adminClient
          .from('employee_benefits')
          .select(`
            *,
            company_benefits (*)
          `)
          .eq('employee_id', employeeId)
          .order('activation_date', { ascending: false })

        if (error) throw error
        return res.status(200).json({ success: true, benefits: data || [] })
      }

      case 'POST': {
        const { employee_id, company_benefit_id, expiration_date } = req.body

        if (!employee_id || !company_benefit_id) {
          return res.status(400).json({ error: 'employee_id and company_benefit_id are required' })
        }

        // Verificar se já existe
        const { data: existing } = await adminClient
          .from('employee_benefits')
          .select('*')
          .eq('employee_id', employee_id)
          .eq('company_benefit_id', company_benefit_id)
          .maybeSingle()

        if (existing) {
          // Atualizar se existir
          const { data, error } = await adminClient
            .from('employee_benefits')
            .update({
              status: 'active',
              expiration_date,
              activation_date: existing.activation_date || new Date().toISOString().split('T')[0]
            })
            .eq('id', existing.id)
            .select()
            .single()

          if (error) throw error
          return res.status(200).json({ success: true, benefit: data })
        }

        // Criar novo
        const { data, error } = await adminClient
          .from('employee_benefits')
          .insert({
            employee_id,
            company_benefit_id,
            status: 'active',
            expiration_date
          })
          .select()
          .single()

        if (error) throw error
        return res.status(201).json({ success: true, benefit: data })
      }

      case 'PUT': {
        const { id, status, expiration_date, usage_data } = req.body

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        const updates = {}
        if (status) updates.status = status
        if (expiration_date) updates.expiration_date = expiration_date
        if (usage_data) updates.usage_data = usage_data

        const { data, error } = await adminClient
          .from('employee_benefits')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, benefit: data })
      }

      case 'DELETE': {
        const { employee_id, company_benefit_id } = req.query

        if (!employee_id || !company_benefit_id) {
          return res.status(400).json({ error: 'employee_id and company_benefit_id are required' })
        }

        // Deletar o registro completamente
        const { data, error } = await adminClient
          .from('employee_benefits')
          .delete()
          .eq('employee_id', employee_id)
          .eq('company_benefit_id', company_benefit_id)
          .select()
          .maybeSingle()

        if (error) throw error
        
        if (!data) {
          return res.status(404).json({ error: 'Benefit assignment not found' })
        }

        return res.status(200).json({ success: true, benefit: data })
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in employee benefits API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process request'
    })
  }
}

