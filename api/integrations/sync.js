/**
 * API Route para sincronizar dados externos
 */
const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey)
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const adminClient = getAdminClient()

  try {
    if (req.method === 'POST') {
      const { connectionId, force = false } = req.body

      if (!connectionId) {
        return res.status(400).json({ error: 'connectionId is required' })
      }

      // Buscar conexão
      const { data: connection, error: connError } = await adminClient
        .from('data_connections')
        .select('*')
        .eq('id', connectionId)
        .single()

      if (connError || !connection) {
        return res.status(404).json({ error: 'Connection not found' })
      }

      // Verificar se já está sincronizando
      if (!force) {
        const { data: runningJob } = await adminClient
          .from('data_sync_jobs')
          .select('*')
          .eq('connection_id', connectionId)
          .eq('status', 'running')
          .maybeSingle()

        if (runningJob) {
          return res.status(409).json({ error: 'Sync already running', jobId: runningJob.id })
        }
      }

      // Criar job de sincronização
      const { data: job, error: jobError } = await adminClient
        .from('data_sync_jobs')
        .insert({
          connection_id: connectionId,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Executar sincronização em background (não bloquear resposta)
      syncData(adminClient, connection, job.id).catch(err => {
        console.error('Sync error:', err)
      })

      return res.status(202).json({
        success: true,
        jobId: job.id,
        message: 'Sync started'
      })
    }

    if (req.method === 'GET') {
      const { connectionId, jobId } = req.query

      if (jobId) {
        const { data, error } = await adminClient
          .from('data_sync_jobs')
          .select('*')
          .eq('id', jobId)
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, job: data })
      }

      if (connectionId) {
        const { data, error } = await adminClient
          .from('data_sync_jobs')
          .select('*')
          .eq('connection_id', connectionId)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        return res.status(200).json({ success: true, jobs: data || [] })
      }

      return res.status(400).json({ error: 'connectionId or jobId is required' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error in sync API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process request'
    })
  }
}

async function syncData(adminClient, connection, jobId) {
  try {
    let recordsProcessed = 0
    let recordsFailed = 0
    const errors = []

    // Descriptografar credenciais
    const credentials = connection.credentials_encrypted
      ? decryptCredentials(connection.credentials_encrypted)
      : null

    // Sincronizar baseado no tipo
    switch (connection.connection_type) {
      case 'api': {
        // Sincronizar via API
        const response = await fetch(connection.connection_config.url, {
          method: connection.connection_config.method || 'GET',
          headers: {
            ...(credentials?.headers || {}),
            'Content-Type': 'application/json'
          },
          body: connection.connection_config.method !== 'GET' && connection.connection_config.body
            ? JSON.stringify(connection.connection_config.body)
            : undefined
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        const records = Array.isArray(data) ? data : (data.records || data.data || [])

        // Processar registros (exemplo básico)
        for (const record of records) {
          try {
            // Aqui você processaria cada registro conforme o mapeamento
            recordsProcessed++
          } catch (err) {
            recordsFailed++
            errors.push(err.message)
          }
        }
        break
      }

      case 'csv':
      case 'excel': {
        // Para CSV/Excel, normalmente já foi feito upload
        // Esta sincronização seria para re-processar
        recordsProcessed = 0
        break
      }

      case 'database': {
        // Conectar ao banco e sincronizar
        // Implementação específica conforme tipo de banco
        recordsProcessed = 0
        break
      }

      default:
        throw new Error(`Unsupported connection type: ${connection.connection_type}`)
    }

    // Atualizar job como completo
    await adminClient
      .from('data_sync_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_processed: recordsProcessed,
        records_failed: recordsFailed,
        error_log: errors.length > 0 ? errors.join('\n') : null
      })
      .eq('id', jobId)

    // Atualizar última sincronização da conexão
    await adminClient
      .from('data_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', connection.id)

  } catch (error) {
    // Marcar job como falho
    await adminClient
      .from('data_sync_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_log: error.message
      })
      .eq('id', jobId)

    // Atualizar status da conexão
    await adminClient
      .from('data_connections')
      .update({
        status: 'error',
        error_log: error.message
      })
      .eq('id', connection.id)
  }
}

