import { supabase } from './supabase'

/**
 * Serviço para operações de Super Admin
 */
export const superAdminService = {
  /**
   * Obter estatísticas gerais do sistema
   */
  async getSystemStats() {
    try {
      // Total de usuários por role
      const { data: usersStats, error: usersError } = await supabase
        .from('clients')
        .select('role')

      if (usersError) throw usersError

      // Contar por role
      const roleStats = usersStats.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {})

      // Total de empresas
      const { count: companiesCount, error: companiesError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })

      if (companiesError) throw companiesError

      // Total de colaboradores
      const { count: employeesCount, error: employeesError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })

      if (employeesError) throw employeesError

      // Total de prospects
      const { count: prospectsCount, error: prospectsError } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })

      if (prospectsError) throw prospectsError

      // Total de campanhas
      const { count: campaignsCount, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })

      if (campaignsError) throw campaignsError

      return {
        users: {
          total: usersStats.length,
          byRole: roleStats
        },
        companies: companiesCount || 0,
        employees: employeesCount || 0,
        prospects: prospectsCount || 0,
        campaigns: campaignsCount || 0
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      throw error
    }
  },

  /**
   * Obter todos os usuários (com paginação)
   */
  async getAllUsers({ page = 1, pageSize = 50, role = null, search = '', status = 'all' } = {}) {
    try {
      console.log('🔍 [SuperAdminService] Iniciando getAllUsers via API...', { page, pageSize, role, search, status })
      
      // Buscar token de autenticação
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      // Chamar API que usa adminClient (sem RLS)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        status: status || 'all'
      })

      if (role && role !== 'all') {
        params.append('role', role)
      }

      console.log('📡 [SuperAdminService] Chamando API /api/superadmin/users...')
      const response = await fetch(`/api/superadmin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error('❌ [SuperAdminService] Erro na API:', error)
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()

      console.log('✅ [SuperAdminService] Dados recebidos da API:', {
        usersCount: result.users?.length,
        total: result.total,
        pages: result.pages
      })

      // Se há busca no frontend, filtrar localmente
      let filteredUsers = result.users
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim()
        console.log('🔍 [SuperAdminService] Aplicando busca local:', searchLower)
        
        filteredUsers = result.users.filter(user => {
          const name = (user.name || '').toLowerCase()
          const email = (user.user?.email || '').toLowerCase()
          const matches = name.includes(searchLower) || email.includes(searchLower)
          return matches
        })
        
        console.log('🔍 [SuperAdminService] Após busca local:', filteredUsers?.length)
      }

      const finalResult = {
        users: filteredUsers,
        total: search ? filteredUsers.length : result.total,
        pages: search ? Math.ceil(filteredUsers.length / pageSize) : result.pages
      }

      console.log('🎯 [SuperAdminService] Retornando resultado final:', {
        usersCount: finalResult.users.length,
        total: finalResult.total,
        pages: finalResult.pages
      })

      return finalResult
    } catch (error) {
      console.error('❌ [SuperAdminService] ERRO GERAL:', error)
      throw error
    }
  },

  /**
   * Atualizar role de um usuário
   */
  async updateUserRole(userId, newRole) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      const response = await fetch('/api/superadmin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          updates: { role: newRole }
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      throw error
    }
  },

  /**
   * Ativar/Desativar usuário
   */
  async toggleUserStatus(userId, isActive) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      const response = await fetch('/api/superadmin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          updates: { is_active: isActive }
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      throw error
    }
  },

  /**
   * Obter todas as empresas
   */
  async getAllCompanies({ page = 1, pageSize = 50, search = '' } = {}) {
    try {
      console.log('🔍 [SuperAdminService] Iniciando getAllCompanies...', { page, pageSize, search })
      
      // Buscar TODAS as empresas SEM JOIN (para evitar erro de schema)
      let query = supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      console.log('📡 [SuperAdminService] Executando query...')
      const { data: allCompanies, error, count } = await query

      if (error) {
        console.error('❌ [SuperAdminService] ERRO na query:', error)
        throw error
      }

      console.log('✅ [SuperAdminService] Query executada com sucesso!')
      console.log('📊 Dados recebidos:', { 
        totalCompanies: allCompanies?.length, 
        count,
        firstCompany: allCompanies?.[0] 
      })

      // Se há busca, filtrar por nome OU CNPJ
      let filteredCompanies = allCompanies
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim()
        console.log('🔍 [SuperAdminService] Aplicando busca:', searchLower)
        
        filteredCompanies = allCompanies.filter(company => {
          const name = (company.company_name || '').toLowerCase()
          const cnpj = (company.cnpj || '').toLowerCase()
          const matches = name.includes(searchLower) || cnpj.includes(searchLower)
          if (matches) {
            console.log('✅ Match encontrado:', { name, cnpj })
          }
          return matches
        })
        
        console.log('🔍 [SuperAdminService] Após busca:', filteredCompanies?.length)
      }

      // Aplicar paginação manualmente
      const totalFiltered = filteredCompanies.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

      console.log('📄 [SuperAdminService] Paginação aplicada:', {
        totalFiltered,
        startIndex,
        endIndex,
        paginatedCount: paginatedCompanies.length
      })

      // Buscar dados dos owners se houver
      const companiesWithOwner = await Promise.all(
        paginatedCompanies.map(async (company) => {
          if (company.owner_user_id) {
            try {
              const { data: ownerData } = await supabase
                .from('clients')
                .select('name, email')
                .eq('user_id', company.owner_user_id)
                .single()
              
              if (ownerData) {
                return {
                  ...company,
                  owner: {
                    name: ownerData.name,
                    email: ownerData.email || 'N/A'
                  }
                }
              }
            } catch (err) {
              console.log('⚠️ Não foi possível buscar owner:', err)
            }
          }
          return company
        })
      )

      const result = {
        companies: companiesWithOwner,
        total: totalFiltered,
        pages: Math.ceil(totalFiltered / pageSize)
      }

      console.log('🎯 [SuperAdminService] Retornando resultado:', {
        companiesCount: result.companies.length,
        total: result.total,
        pages: result.pages
      })

      return result
    } catch (error) {
      console.error('❌ [SuperAdminService] ERRO GERAL:', error)
      throw error
    }
  },

  /**
   * Obter atividades recentes (audit log)
   */
  async getRecentActivity({ limit = 20, action = null, startDate = null, endDate = null } = {}) {
    try {
      console.log('🔍 [SuperAdminService] Carregando audit logs...', { limit, action, startDate, endDate })
      
      // Buscar TODOS os logs SEM JOIN (para evitar erro de schema)
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (action) {
        query = query.eq('action', action)
      }

      if (startDate) {
        query = query.gte('created_at', startDate)
      }

      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      console.log('📡 [SuperAdminService] Executando query audit logs...')
      const { data, error } = await query

      if (error) {
        console.error('❌ [SuperAdminService] ERRO na query audit logs:', error)
        throw error
      }

      console.log('✅ [SuperAdminService] Audit logs carregados:', data?.length)

      // Buscar emails dos usuários separadamente
      const logsWithUser = await Promise.all(
        data.map(async (log) => {
          if (log.user_id) {
            try {
              // Buscar na tabela clients (que tem o email)
              const { data: clientData } = await supabase
                .from('clients')
                .select('email')
                .eq('user_id', log.user_id)
                .single()
              
              if (clientData && clientData.email) {
                return {
                  ...log,
                  user: {
                    email: clientData.email
                  }
                }
              }
            } catch (err) {
              console.log('⚠️ Não foi possível buscar user:', err)
            }
          }
          return {
            ...log,
            user: {
              email: log.user_id ? `user-${log.user_id.substring(0, 8)}` : 'Sistema'
            }
          }
        })
      )

      console.log('🎯 [SuperAdminService] Retornando logs com users:', logsWithUser.length)
      return logsWithUser
    } catch (error) {
      console.error('❌ [SuperAdminService] ERRO GERAL ao obter atividades:', error)
      throw error
    }
  },

  /**
   * Registrar ação no audit log
   */
  async logAction(action, details = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action,
          resource_type: details.resourceType || null,
          resource_id: details.resourceId || null,
          details,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erro ao registrar no audit log:', error)
      }
    } catch (error) {
      console.error('Erro ao registrar ação:', error)
    }
  },

  /**
   * Obter estatísticas do audit log
   */
  async getAuditStats({ startDate = null, endDate = null } = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select('action, created_at')

      if (startDate) {
        query = query.gte('created_at', startDate)
      }

      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      // Contar por ação
      const actionStats = data.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {})

      // Contar por dia
      const dailyStats = data.reduce((acc, log) => {
        const date = new Date(log.created_at).toLocaleDateString('pt-BR')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      return {
        total: data.length,
        byAction: actionStats,
        byDay: dailyStats
      }
    } catch (error) {
      console.error('Erro ao obter stats do audit:', error)
      throw error
    }
  }
}

export default superAdminService
