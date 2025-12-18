const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { 
        id, 
        bankingStatus, 
        minScore, 
        status, 
        industry, 
        priority, 
        limit = 50, 
        offset = 0, 
        orderBy = 'identification_score', 
        orderDirection = 'desc' 
      } = req.query
      const userId = req.headers['x-user-id']

      const adminClient = getAdminClient()

      // Se buscar por ID específico
      if (id) {
        const { data, error } = await adminClient
          .from('unbanked_companies')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Supabase error fetching single company:', error)
          throw new Error(error.message)
        }

        return res.status(200).json({ success: true, company: data })
      }

      // Construir query com filtros
      let query = adminClient
        .from('unbanked_companies')
        .select('*', { count: 'exact' })

      // Filtrar por usuário se fornecido (para RLS)
      if (userId) {
        query = query.eq('created_by', userId)
      }

      // Aplicar filtros
      if (bankingStatus) {
        query = query.eq('banking_status', bankingStatus)
      }

      if (minScore) {
        query = query.gte('identification_score', parseFloat(minScore))
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (industry) {
        query = query.eq('industry', industry)
      }

      if (priority) {
        query = query.gte('priority', parseInt(priority))
      }

      // Ordenação
      if (orderBy) {
        query = query.order(orderBy, { ascending: orderDirection === 'asc' })
      }

      // Paginação
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error fetching companies list:', error)
        throw new Error(error.message)
      }

      return res.status(200).json({
        success: true,
        companies: data || [],
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })
    } catch (error) {
      console.error('Error fetching unbanked companies:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch unbanked companies',
        details: error.details || error.message,
        hint: error.hint
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const companyData = req.body
      const userId = req.headers['x-user-id'] || companyData.created_by

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        })
      }

      if (!companyData.cnpj || !companyData.company_name) {
        return res.status(400).json({
          success: false,
          error: 'CNPJ and company_name are required'
        })
      }

      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('unbanked_companies')
        .insert([{
          cnpj: companyData.cnpj,
          company_name: companyData.company_name,
          trade_name: companyData.trade_name || null,
          company_type: companyData.company_type || null,
          banking_status: companyData.banking_status || 'not_banked',
          products_contracted: companyData.products_contracted || [],
          potential_products: companyData.potential_products || [],
          identification_score: companyData.identification_score || 0,
          revenue_estimate: companyData.revenue_estimate || null,
          employee_count: companyData.employee_count || 0,
          industry: companyData.industry || null,
          contact_info: companyData.contact_info || {},
          data_sources: companyData.data_sources || [],
          status: companyData.status || 'identified',
          priority: companyData.priority || 0,
          notes: companyData.notes || null,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating company:', error)
        throw new Error(error.message)
      }

      return res.status(201).json({
        success: true,
        company: data
      })
    } catch (error) {
      console.error('Error in POST /api/unbanked-companies:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create company',
        details: error.details || error.message,
        hint: error.hint
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
        .from('unbanked_companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error updating company:', error)
        throw new Error(error.message)
      }

      return res.status(200).json({
        success: true,
        company: data
      })
    } catch (error) {
      console.error('Error updating unbanked company:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update company',
        details: error.details || error.message,
        hint: error.hint
      })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID is required'
        })
      }

      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('unbanked_companies')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase error deleting company:', error)
        throw new Error(error.message)
      }

      return res.status(200).json({
        success: true,
        message: 'Company deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting unbanked company:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete company',
        details: error.details || error.message,
        hint: error.hint
      })
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  })
}

