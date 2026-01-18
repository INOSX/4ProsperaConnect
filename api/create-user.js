import { createClient } from '@supabase/supabase-js'

/**
 * API Serverless para criar usuários usando service_role key
 * Endpoint: POST /api/create-user
 */
export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, password, role, isActive } = req.body

    // Validações
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'password', 'role']
      })
    }

    console.log('🔨 [API] Criando usuário:', email)

    // Criar cliente Supabase com SERVICE_ROLE_KEY
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name
      }
    })

    if (authError) {
      console.error('❌ [API] Erro ao criar no auth:', authError)
      return res.status(400).json({ 
        error: 'Failed to create user',
        details: authError.message 
      })
    }

    console.log('✅ [API] Usuário criado no auth:', authData.user.id)

    // 2. Criar registro na tabela clients
    const { error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        user_id: authData.user.id,
        name,
        email,
        role,
        is_active: isActive !== undefined ? isActive : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (clientError) {
      console.error('❌ [API] Erro ao criar cliente:', clientError)
      // Tentar deletar do auth se falhar
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({ 
        error: 'Failed to create client record',
        details: clientError.message 
      })
    }

    console.log('✅ [API] Cliente criado com sucesso!')

    // 3. Retornar sucesso
    return res.status(200).json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role
      }
    })

  } catch (error) {
    console.error('❌ [API] Erro geral:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}
