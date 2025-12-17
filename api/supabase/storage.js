import { createClient } from '@supabase/supabase-js'

// Valores padrão do projeto Supabase
const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

let supabaseAdmin
function getAdminClient() {
  if (!supabaseAdmin) {
    // Tentar diferentes nomes de variáveis de ambiente, com fallback para valores padrão
    const url = (process.env.SUPABASE_URL || 
                 process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 DEFAULT_SUPABASE_URL).trim()
    
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE || 
                        process.env.SUPABASE_SERVICE_ROLE_KEY ||
                        process.env.SUPABASE_SERVICE_KEY ||
                        DEFAULT_SERVICE_KEY).trim()
    
    // Debug: verificar se as variáveis estão sendo lidas
    console.log('Supabase Storage API - Debug:', {
      hasUrl: !!url,
      hasServiceKey: !!serviceKey,
      urlLength: url?.length,
      serviceKeyLength: serviceKey?.length,
      usingDefaults: {
        url: url === DEFAULT_SUPABASE_URL,
        serviceKey: serviceKey === DEFAULT_SERVICE_KEY
      },
      envVars: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY
      }
    })
    
    // Validação: garantir que temos valores válidos (não vazios)
    if (!url || url.length === 0 || !serviceKey || serviceKey.length === 0) {
      console.error('Supabase credentials missing:', { 
        url: url || 'MISSING', 
        urlLength: url?.length || 0,
        serviceKey: serviceKey ? 'PRESENT' : 'MISSING',
        serviceKeyLength: serviceKey?.length || 0
      })
      throw new Error('Supabase admin credentials missing (SUPABASE_URL and SUPABASE_SERVICE_ROLE)')
    }
    
    supabaseAdmin = createClient(url, serviceKey)
  }
  return supabaseAdmin
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, userId } = req.body || {}
  
  console.log('Storage API called:', { action, userId, timestamp: new Date().toISOString() })
  
  try {
    const admin = getAdminClient()
    console.log('Admin client initialized successfully')

    switch (action) {
      case 'ensureBucket': {
        if (!userId) return res.status(400).json({ error: 'userId is required' })
        
        console.log('ensureBucket called for userId:', userId)
        
        // Tentar obter bucket
        const { data: got, error: getErr } = await admin.storage.getBucket(userId)
        console.log('getBucket result:', { got: !!got, error: getErr?.message })
        
        if (got && !getErr) {
          console.log('Bucket already exists:', userId)
          return res.status(200).json({ bucket: userId, existed: true })
        }

        // Criar bucket (público por enquanto; ajuste depois conforme regras)
        console.log('Creating bucket:', userId)
        const { data: created, error: createErr } = await admin.storage.createBucket(userId, {
          public: true,
        })
        
        console.log('createBucket result:', { created: !!created, error: createErr?.message })
        
        if (createErr && !String(createErr.message || '').toLowerCase().includes('already exists')) {
          console.error('Error creating bucket:', createErr)
          throw createErr
        }
        
        console.log('Bucket created successfully:', userId)
        return res.status(200).json({ bucket: userId, existed: false })
      }

      case 'upload': {
        const { bucket, path, data, contentType } = req.body || {}
        if (!bucket || !path || !data) return res.status(400).json({ error: 'bucket, path e data são obrigatórios' })
        const buffer = Buffer.from(data, 'base64')
        const { error: upErr } = await admin.storage.from(bucket).upload(path, buffer, {
          upsert: true,
          contentType: contentType || 'application/octet-stream'
        })
        if (upErr) throw upErr
        return res.status(200).json({ ok: true })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (err) {
    console.error('Supabase admin API error:', err)
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}


