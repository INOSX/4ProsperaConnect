import { createClient } from '@supabase/supabase-js'

/**
 * API Serverless para deletar usuários usando service_role key
 * Endpoint: POST /api/delete-user
 */
export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    // Validações
    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing required field: userId'
      })
    }

    console.log('🗑️ [API] Deletando usuário:', userId)

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

    // 1. Deletar da tabela clients
    const { error: clientError } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('user_id', userId)

    if (clientError) {
      console.error('❌ [API] Erro ao deletar cliente:', clientError)
      return res.status(400).json({ 
        error: 'Failed to delete client record',
        details: clientError.message 
      })
    }

    console.log('✅ [API] Cliente deletado')

    // 2. Deletar do Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.warn('⚠️ [API] Erro ao deletar do auth:', authError)
      // Continua mesmo com erro no auth
    } else {
      console.log('✅ [API] Usuário deletado do auth')
    }

    // 3. Retornar sucesso
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('❌ [API] Erro geral:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}
