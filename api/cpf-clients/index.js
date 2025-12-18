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
      const { id, minScore, status, priority, limit = 50, offset = 0, orderBy = 'conversion_potential_score', orderDirection = 'desc' } = req.query
      const userId = req.headers['x-user-id']

      const adminClient = getAdminClient()

      // Se buscar por ID específico
      if (id) {
        const { data, error } = await adminClient
          .from('cpf_clients')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        return res.status(200).json({ success: true, client: data })
      }

      // Construir query com filtros
      let query = adminClient
        .from('cpf_clients')
        .select('*', { count: 'exact' })

      // Filtrar por usuário se fornecido (para RLS)
      if (userId) {
        query = query.eq('created_by', userId)
      }

      // Aplicar filtros
      if (minScore) {
        query = query.gte('conversion_potential_score', parseFloat(minScore))
      }

      if (status) {
        query = query.eq('status', status)
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
        console.error('Supabase error:', error)
        throw error
      }

      return res.status(200).json({
        success: true,
        clients: data || [],
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })
    } catch (error) {
      console.error('Error fetching CPF clients:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch CPF clients',
        details: error.details || error.hint || null,
        code: error.code || null
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const { action } = req.body

      if (action === 'analyze') {
        // Analisar e recalcular scores em lote
        const { clientIds } = req.body

        if (!clientIds || !Array.isArray(clientIds)) {
          return res.status(400).json({
            success: false,
            error: 'clientIds array is required'
          })
        }

        const adminClient = getAdminClient()

        // Buscar clientes
        const { data: clients, error: fetchError } = await adminClient
          .from('cpf_clients')
          .select('*')
          .in('id', clientIds)

        if (fetchError) throw fetchError

        // Recalcular scores (chamar API de cálculo)
        const calculateResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/cpf-clients/calculate-potential`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clients })
        })

        if (!calculateResponse.ok) {
          throw new Error('Failed to calculate potential')
        }

        const { scores } = await calculateResponse.json()

        // Atualizar clientes com novos scores
        const updates = clients.map((client, index) => ({
          id: client.id,
          conversion_potential_score: scores[index]?.conversion_potential_score || client.conversion_potential_score,
          conversion_probability: scores[index]?.conversion_probability || client.conversion_probability,
          recommended_action: scores[index]?.recommended_action || client.recommended_action,
          priority: scores[index]?.priority || client.priority,
          last_analyzed_at: new Date().toISOString()
        }))

        const updatePromises = updates.map(update =>
          adminClient
            .from('cpf_clients')
            .update({
              conversion_potential_score: update.conversion_potential_score,
              conversion_probability: update.conversion_probability,
              recommended_action: update.recommended_action,
              priority: update.priority,
              last_analyzed_at: update.last_analyzed_at
            })
            .eq('id', update.id)
        )

        await Promise.all(updatePromises)

        return res.status(200).json({
          success: true,
          message: `Analyzed ${clients.length} clients`,
          updated: clients.length
        })
      }

      // Criar novo cliente CPF
      const { cpf, name, email, phone, ...otherData } = req.body

      if (!cpf || !name) {
        return res.status(400).json({
          success: false,
          error: 'CPF and name are required'
        })
      }

      const adminClient = getAdminClient()
      const userId = req.headers['x-user-id']

      const { data, error } = await adminClient
        .from('cpf_clients')
        .insert([{
          cpf,
          name,
          email,
          phone,
          ...otherData,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({
        success: true,
        client: data
      })
    } catch (error) {
      console.error('Error in POST /api/cpf-clients:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to process request'
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
        .from('cpf_clients')
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
        client: data
      })
    } catch (error) {
      console.error('Error updating CPF client:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update client'
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
        .from('cpf_clients')
        .delete()
        .eq('id', id)

      if (error) throw error

      return res.status(200).json({
        success: true,
        message: 'Client deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting CPF client:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete client'
      })
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  })
}

