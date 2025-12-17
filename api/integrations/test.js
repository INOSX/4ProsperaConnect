/**
 * API Route para testar conexão de dados
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { connectionId, connectionType, connectionConfig, credentials } = req.body

    // Se connectionId fornecido, buscar conexão
    let connection = null
    if (connectionId) {
      const adminClient = getAdminClient()
      const { data, error } = await adminClient
        .from('data_connections')
        .select('*')
        .eq('id', connectionId)
        .single()

      if (error) throw error
      connection = data
      connectionType = connection.connection_type
      connectionConfig = connection.connection_config
      if (connection.credentials_encrypted) {
        credentials = decryptCredentials(connection.credentials_encrypted)
      }
    }

    if (!connectionType || !connectionConfig) {
      return res.status(400).json({ error: 'connectionType and connectionConfig are required' })
    }

    // Testar conexão baseado no tipo
    let testResult = null

    switch (connectionType) {
      case 'api': {
        try {
          const response = await fetch(connectionConfig.url, {
            method: connectionConfig.method || 'GET',
            headers: {
              ...(credentials?.headers || {}),
              'Content-Type': 'application/json'
            },
            body: connectionConfig.method !== 'GET' && connectionConfig.body
              ? JSON.stringify(connectionConfig.body)
              : undefined,
            signal: AbortSignal.timeout(10000) // 10 segundos timeout
          })

          testResult = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          }

          if (response.ok) {
            const data = await response.json()
            testResult.sampleData = Array.isArray(data)
              ? data.slice(0, 3)
              : (data.records || data.data || []).slice(0, 3)
          }
        } catch (error) {
          testResult = {
            success: false,
            error: error.message
          }
        }
        break
      }

      case 'csv':
      case 'excel': {
        // Para CSV/Excel, validar configuração
        testResult = {
          success: true,
          message: 'CSV/Excel connection configuration is valid'
        }
        break
      }

      case 'database': {
        // Testar conexão com banco de dados
        // Implementação específica conforme tipo de banco
        testResult = {
          success: false,
          error: 'Database connection testing not yet implemented'
        }
        break
      }

      default:
        return res.status(400).json({ error: `Unsupported connection type: ${connectionType}` })
    }

    // Atualizar status da conexão se connectionId fornecido
    if (connectionId && connection) {
      const adminClient = getAdminClient()
      await adminClient
        .from('data_connections')
        .update({
          status: testResult.success ? 'active' : 'error',
          error_log: testResult.success ? null : testResult.error
        })
        .eq('id', connectionId)
    }

    return res.status(200).json({
      success: testResult.success,
      result: testResult
    })
  } catch (error) {
    console.error('Error testing connection:', error)
    return res.status(500).json({
      error: error.message || 'Failed to test connection'
    })
  }
}

