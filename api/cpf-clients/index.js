import { supabase } from '../../../src/services/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { id, minScore, status, priority, limit = 50, offset = 0, orderBy = 'conversion_potential_score', orderDirection = 'desc' } = req.query

      // Se buscar por ID específico
      if (id) {
        const { data, error } = await supabase
          .from('cpf_clients')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        return res.status(200).json({ success: true, client: data })
      }

      // Construir query com filtros
      let query = supabase
        .from('cpf_clients')
        .select('*', { count: 'exact' })

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

      if (error) throw error

      return res.status(200).json({
        success: true,
        clients: data || [],
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })
    } catch (error) {
      console.error('Error fetching CPF clients:', error)
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch CPF clients'
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

        // Buscar clientes
        const { data: clients, error: fetchError } = await supabase
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
          supabase
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

      const { data, error } = await supabase
        .from('cpf_clients')
        .insert([{
          cpf,
          name,
          email,
          phone,
          ...otherData,
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

      const { data, error } = await supabase
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

      const { error } = await supabase
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

