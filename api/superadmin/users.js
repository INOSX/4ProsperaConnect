import { getAdminClient } from '../lib/supabase-admin'

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const adminClient = getAdminClient()

  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // Verificar se é super_admin
    const { data: client, error: clientError } = await adminClient
      .from('clients')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (clientError || client?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas Super Admin pode acessar.' })
    }

    // GET - Buscar todos os usuários
    if (req.method === 'GET') {
      const { page = 1, pageSize = 50, role, status = 'all' } = req.query

      console.log('🔍 [API SuperAdmin] Buscando usuários...', { page, pageSize, role, status })

      // Buscar TODOS os usuários (sem RLS)
      let query = adminClient
        .from('clients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Filtrar por role se fornecido
      if (role && role !== 'all') {
        query = query.eq('role', role)
      }

      const { data: allUsers, error, count } = await query

      if (error) {
        console.error('❌ [API SuperAdmin] Erro ao buscar usuários:', error)
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
        return res.status(500).json({ error: error.message })
      }

      console.log('✅ [API SuperAdmin] Total de usuários retornados:', allUsers?.length)
      console.log('📊 [API SuperAdmin] Primeiros 3 usuários:', allUsers?.slice(0, 3).map(u => ({ name: u.name, role: u.role, email: u.email })))

      // Buscar emails do auth.users para cada usuário
      const usersWithAuth = await Promise.all(
        allUsers.map(async (client) => {
          try {
            const { data: authUser } = await adminClient.auth.admin.getUserById(client.user_id)
            return {
              ...client,
              user: {
                email: authUser?.user?.email || `user-${client.user_id?.substring(0, 8)}@example.com`,
                created_at: authUser?.user?.created_at || client.created_at
              }
            }
          } catch (err) {
            console.log('⚠️ Não foi possível buscar email para:', client.user_id)
            return {
              ...client,
              user: {
                email: `user-${client.user_id?.substring(0, 8)}@example.com`,
                created_at: client.created_at
              }
            }
          }
        })
      )

      // Filtrar por status
      let filteredByStatus = usersWithAuth
      if (status === 'active') {
        filteredByStatus = usersWithAuth.filter(u => u.is_active !== false)
      } else if (status === 'inactive') {
        filteredByStatus = usersWithAuth.filter(u => u.is_active === false)
      }

      console.log('✅ [API SuperAdmin] Após filtro de status:', filteredByStatus.length)

      // Aplicar paginação
      const totalFiltered = filteredByStatus.length
      const pageNum = parseInt(page)
      const size = parseInt(pageSize)
      const startIndex = (pageNum - 1) * size
      const endIndex = startIndex + size
      const paginatedUsers = filteredByStatus.slice(startIndex, endIndex)

      console.log('📄 [API SuperAdmin] Retornando:', {
        users: paginatedUsers.length,
        total: totalFiltered,
        pages: Math.ceil(totalFiltered / size)
      })

      return res.status(200).json({
        users: paginatedUsers,
        total: totalFiltered,
        pages: Math.ceil(totalFiltered / size)
      })
    }

    // PUT - Atualizar usuário (role ou status)
    if (req.method === 'PUT') {
      const { userId, updates } = req.body

      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' })
      }

      console.log('🔄 [API SuperAdmin] Atualizando usuário:', userId, updates)

      const { data, error } = await adminClient
        .from('clients')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ [API SuperAdmin] Erro ao atualizar:', error)
        return res.status(500).json({ error: error.message })
      }

      // Registrar no audit log
      await adminClient.from('audit_logs').insert({
        user_id: user.id,
        action: 'UPDATE_USER',
        resource_type: 'client',
        resource_id: userId,
        details: updates,
        created_at: new Date().toISOString()
      })

      console.log('✅ [API SuperAdmin] Usuário atualizado com sucesso')

      return res.status(200).json(data)
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('❌ [API SuperAdmin] Erro geral:', error)
    return res.status(500).json({ error: error.message })
  }
}
