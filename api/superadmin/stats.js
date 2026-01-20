const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey)
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
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

    // GET - Buscar estatísticas do sistema
    if (req.method === 'GET') {
      console.log('🔍 [API SuperAdmin Stats] Buscando estatísticas...')

      // Total de usuários por role e status (SEM RLS)
      const { data: usersStats, error: usersError } = await adminClient
        .from('clients')
        .select('role, is_active')

      if (usersError) {
        console.error('❌ [API SuperAdmin Stats] Erro ao buscar usuários:', usersError)
        return res.status(500).json({ error: usersError.message })
      }

      console.log('✅ [API SuperAdmin Stats] Total de usuários:', usersStats?.length)

      // Contar por role
      const roleStats = usersStats.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {})

      // Contar ativos e inativos
      const activeCount = usersStats.filter(u => u.is_active !== false).length
      const inactiveCount = usersStats.filter(u => u.is_active === false).length

      // Total de empresas
      const { count: companiesCount, error: companiesError } = await adminClient
        .from('companies')
        .select('*', { count: 'exact', head: true })

      if (companiesError) {
        console.error('❌ [API SuperAdmin Stats] Erro ao buscar empresas:', companiesError)
        return res.status(500).json({ error: companiesError.message })
      }

      // Total de colaboradores
      const { count: employeesCount, error: employeesError } = await adminClient
        .from('employees')
        .select('*', { count: 'exact', head: true })

      if (employeesError) {
        console.error('❌ [API SuperAdmin Stats] Erro ao buscar colaboradores:', employeesError)
        return res.status(500).json({ error: employeesError.message })
      }

      // Total de prospects
      const { count: prospectsCount, error: prospectsError } = await adminClient
        .from('prospects')
        .select('*', { count: 'exact', head: true })

      if (prospectsError) {
        console.error('❌ [API SuperAdmin Stats] Erro ao buscar prospects:', prospectsError)
        return res.status(500).json({ error: prospectsError.message })
      }

      // Total de campanhas
      const { count: campaignsCount, error: campaignsError } = await adminClient
        .from('campaigns')
        .select('*', { count: 'exact', head: true })

      if (campaignsError) {
        console.error('❌ [API SuperAdmin Stats] Erro ao buscar campanhas:', campaignsError)
        return res.status(500).json({ error: campaignsError.message })
      }

      const stats = {
        users: {
          total: usersStats.length,
          active: activeCount,
          inactive: inactiveCount,
          byRole: roleStats
        },
        companies: companiesCount || 0,
        employees: employeesCount || 0,
        prospects: prospectsCount || 0,
        campaigns: campaignsCount || 0
      }

      console.log('✅ [API SuperAdmin Stats] Estatísticas:', stats)

      return res.status(200).json(stats)
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('❌ [API SuperAdmin Stats] Erro geral:', error)
    return res.status(500).json({ error: error.message })
  }
}
