/**
 * API Route para gerenciar conexões de dados
 */
const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey)
}

// Função simples de criptografia (em produção, usar biblioteca adequada)
function encryptCredentials(credentials) {
  // Por enquanto, apenas base64 (em produção, usar crypto adequado)
  return Buffer.from(JSON.stringify(credentials)).toString('base64')
}

function decryptCredentials(encrypted) {
  try {
    return JSON.parse(Buffer.from(encrypted, 'base64').toString())
  } catch (e) {
    return null
  }
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
        const { id, userId } = req.query

        if (id) {
          const { data, error } = await adminClient
            .from('data_connections')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          // Não retornar credenciais descriptografadas
          if (data.credentials_encrypted) {
            data.has_credentials = true
            delete data.credentials_encrypted
          }

          return res.status(200).json({ success: true, connection: data })
        }

        if (userId) {
          const { data, error } = await adminClient
            .from('data_connections')
            .select('*')
            .eq('created_by', userId)
            .order('created_at', { ascending: false })

          if (error) throw error

          // Remover credenciais
          const safeData = (data || []).map(conn => {
            if (conn.credentials_encrypted) {
              conn.has_credentials = true
              delete conn.credentials_encrypted
            }
            return conn
          })

          return res.status(200).json({ success: true, connections: safeData })
        }

        return res.status(400).json({ error: 'id or userId is required' })
      }

      case 'POST': {
        const { name, connection_type, connection_config, credentials, sync_frequency, created_by, userId } = req.body

        if (!name || !connection_type || !connection_config) {
          return res.status(400).json({ error: 'name, connection_type, and connection_config are required' })
        }

        // Verificar se o usuário é admin
        const requestingUserId = userId || created_by || req.headers['x-user-id']
        if (!requestingUserId) {
          return res.status(401).json({ error: 'User ID is required' })
        }

        // Buscar o cliente para verificar se é admin
        const { data: client, error: clientError } = await adminClient
          .from('clients')
          .select('role')
          .eq('user_id', requestingUserId)
          .maybeSingle()

        if (clientError) throw clientError
        if (!client) {
          return res.status(404).json({ error: 'Client not found' })
        }

        // Apenas admins podem criar conexões
        if (client.role !== 'admin') {
          return res.status(403).json({ error: 'Apenas administradores podem criar conexões de banco de dados' })
        }

        // Criptografar credenciais se fornecidas
        let credentials_encrypted = null
        if (credentials) {
          credentials_encrypted = encryptCredentials(credentials)
        }

        const { data, error } = await adminClient
          .from('data_connections')
          .insert({
            name,
            connection_type,
            connection_config,
            credentials_encrypted,
            sync_frequency: sync_frequency || 'manual',
            status: 'inactive',
            created_by: requestingUserId
          })
          .select()
          .single()

        if (error) throw error

        // Não retornar credenciais
        if (data.credentials_encrypted) {
          data.has_credentials = true
          delete data.credentials_encrypted
        }

        return res.status(201).json({ success: true, connection: data })
      }

      case 'PUT': {
        const { id, name, connection_config, credentials, sync_frequency, status, userId } = req.body

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        // Verificar se o usuário é admin
        const requestingUserId = userId || req.headers['x-user-id']
        if (!requestingUserId) {
          return res.status(401).json({ error: 'User ID is required' })
        }

        // Buscar o cliente para verificar se é admin
        const { data: client, error: clientError } = await adminClient
          .from('clients')
          .select('role')
          .eq('user_id', requestingUserId)
          .maybeSingle()

        if (clientError) throw clientError
        if (!client) {
          return res.status(404).json({ error: 'Client not found' })
        }

        // Apenas admins podem atualizar conexões
        if (client.role !== 'admin') {
          return res.status(403).json({ error: 'Apenas administradores podem atualizar conexões de banco de dados' })
        }

        const updates = {}
        if (name) updates.name = name
        if (connection_config) updates.connection_config = connection_config
        if (sync_frequency) updates.sync_frequency = sync_frequency
        if (status) updates.status = status

        // Atualizar credenciais se fornecidas
        if (credentials) {
          updates.credentials_encrypted = encryptCredentials(credentials)
        }

        const { data, error } = await adminClient
          .from('data_connections')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Não retornar credenciais
        if (data.credentials_encrypted) {
          data.has_credentials = true
          delete data.credentials_encrypted
        }

        return res.status(200).json({ success: true, connection: data })
      }

      case 'DELETE': {
        const { id, userId } = req.query

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        // Verificar se o usuário é admin
        const requestingUserId = userId || req.headers['x-user-id']
        if (!requestingUserId) {
          return res.status(401).json({ error: 'User ID is required' })
        }

        // Buscar o cliente para verificar se é admin
        const { data: client, error: clientError } = await adminClient
          .from('clients')
          .select('role')
          .eq('user_id', requestingUserId)
          .maybeSingle()

        if (clientError) throw clientError
        if (!client) {
          return res.status(404).json({ error: 'Client not found' })
        }

        // Apenas admins podem deletar conexões
        if (client.role !== 'admin') {
          return res.status(403).json({ error: 'Apenas administradores podem deletar conexões de banco de dados' })
        }

        const { error } = await adminClient
          .from('data_connections')
          .delete()
          .eq('id', id)

        if (error) throw error
        return res.status(200).json({ success: true })
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in data connections API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process request'
    })
  }
}

