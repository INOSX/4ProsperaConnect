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
      // Buscar TODOS os usuários com seus dados
      let query = supabase
        .from('clients')
        .select('*, user:user_id(email, created_at)', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Filtrar por role
      if (role) {
        query = query.eq('role', role)
      }

      const { data: allUsers, error, count } = await query

      if (error) throw error

      // Filtrar por status
      let filteredByStatus = allUsers
      if (status === 'active') {
        filteredByStatus = allUsers.filter(u => u.is_active !== false)
      } else if (status === 'inactive') {
        filteredByStatus = allUsers.filter(u => u.is_active === false)
      }

      // Se há busca, filtrar por nome OU email
      let filteredUsers = filteredByStatus
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim()
        filteredUsers = filteredByStatus.filter(user => {
          const name = (user.name || '').toLowerCase()
          const email = (user.user?.email || '').toLowerCase()
          return name.includes(searchLower) || email.includes(searchLower)
        })
      }

      // Aplicar paginação manualmente
      const totalFiltered = filteredUsers.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

      return {
        users: paginatedUsers,
        total: totalFiltered,
        pages: Math.ceil(totalFiltered / pageSize)
      }
    } catch (error) {
      console.error('Erro ao obter usuários:', error)
      throw error
    }
  },

  /**
   * Atualizar role de um usuário
   */
  async updateUserRole(userId, newRole) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ role: newRole })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // Registrar no audit log
      await this.logAction('UPDATE_USER_ROLE', {
        userId,
        newRole,
        timestamp: new Date().toISOString()
      })

      return data
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
      const { data, error } = await supabase
        .from('clients')
        .update({ is_active: isActive })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // Registrar no audit log
      await this.logAction('TOGGLE_USER_STATUS', {
        userId,
        isActive,
        timestamp: new Date().toISOString()
      })

      return data
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
      let query = supabase
        .from('companies')
        .select('*, owner:owner_user_id(name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (search) {
        query = query.or(`company_name.ilike.%${search}%,cnpj.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        companies: data,
        total: count,
        pages: Math.ceil(count / pageSize)
      }
    } catch (error) {
      console.error('Erro ao obter empresas:', error)
      throw error
    }
  },

  /**
   * Obter atividades recentes (audit log)
   */
  async getRecentActivity({ limit = 20, action = null, startDate = null, endDate = null } = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*, user:user_id(email)')
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

      const { data, error } = await query

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao obter atividades:', error)
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
