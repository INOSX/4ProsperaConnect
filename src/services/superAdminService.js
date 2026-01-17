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
  async getAllUsers({ page = 1, pageSize = 50, role = null, search = '' } = {}) {
    try {
      let query = supabase
        .from('clients')
        .select('*, user:user_id(email, created_at)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      // Filtrar por role
      if (role) {
        query = query.eq('role', role)
      }

      // Buscar por nome ou email
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        users: data,
        total: count,
        pages: Math.ceil(count / pageSize)
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
  async getRecentActivity({ limit = 20 } = {}) {
    try {
      // Por enquanto, vamos simular com dados de created_at/updated_at
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, role, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao obter atividades:', error)
      throw error
    }
  },

  /**
   * Registrar ação no audit log (placeholder - criar tabela depois)
   */
  async logAction(action, details) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('Audit Log:', {
        action,
        user_id: user?.id,
        details,
        timestamp: new Date().toISOString()
      })

      // TODO: Criar tabela audit_logs e salvar lá
      // await supabase.from('audit_logs').insert({ ... })
    } catch (error) {
      console.error('Erro ao registrar ação:', error)
    }
  }
}

export default superAdminService
