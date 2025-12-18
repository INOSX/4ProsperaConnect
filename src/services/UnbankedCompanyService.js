/**
 * Serviço para gerenciar empresas não bancarizadas ou subexploradas
 */
export class UnbankedCompanyService {
  /**
   * Buscar empresas não bancarizadas com filtros
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Object>} Lista de empresas e metadados
   */
  static async getUnbankedCompanies(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.bankingStatus) params.append('bankingStatus', filters.bankingStatus)
      if (filters.minScore !== undefined) params.append('minScore', filters.minScore)
      if (filters.status) params.append('status', filters.status)
      if (filters.industry) params.append('industry', filters.industry)
      if (filters.priority !== undefined) params.append('priority', filters.priority)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.offset) params.append('offset', filters.offset)
      if (filters.orderBy) params.append('orderBy', filters.orderBy)
      if (filters.orderDirection) params.append('orderDirection', filters.orderDirection)

      const response = await fetch(`/api/unbanked-companies?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching unbanked companies:', error)
      throw error
    }
  }

  /**
   * Obter detalhes de uma empresa específica
   * @param {string} id - ID da empresa
   * @returns {Promise<Object>} Dados da empresa
   */
  static async getUnbankedCompany(id) {
    try {
      const response = await fetch(`/api/unbanked-companies?id=${id}`)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.company
    } catch (error) {
      console.error('Error fetching unbanked company:', error)
      throw error
    }
  }

  /**
   * Identificar empresas de fontes de dados
   * @param {Array<Object>} sourceConfigs - Configurações das fontes de dados
   * @returns {Promise<Object>} Resultado da identificação
   */
  static async identifyCompanies(sourceConfigs) {
    try {
      const { supabase } = await import('./supabase.js')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const response = await fetch('/api/unbanked-companies/identify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ sourceConfigs })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error identifying companies:', error)
      throw error
    }
  }

  /**
   * Enriquecer empresa com dados externos
   * @param {string} id - ID da empresa
   * @param {Array<Object>} sourceConfigs - Configurações das fontes de dados
   * @returns {Promise<Object>} Empresa enriquecida
   */
  static async enrichCompany(id, sourceConfigs) {
    try {
      const { supabase } = await import('./supabase.js')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const response = await fetch('/api/unbanked-companies/enrich', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ companyIds: [id], sourceConfigs })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.enrichedCompanies[0]
    } catch (error) {
      console.error('Error enriching company:', error)
      throw error
    }
  }

  /**
   * Atualizar status de uma empresa
   * @param {string} id - ID da empresa
   * @param {string} status - Novo status
   * @returns {Promise<Object>} Empresa atualizada
   */
  static async updateCompanyStatus(id, status) {
    try {
      const response = await fetch('/api/unbanked-companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.company
    } catch (error) {
      console.error('Error updating company status:', error)
      throw error
    }
  }

  /**
   * Converter empresa para cliente do banco
   * @param {string} id - ID da empresa
   * @param {Object} additionalData - Dados adicionais
   * @returns {Promise<Object>} Cliente criado
   */
  static async convertToClient(id, additionalData = {}) {
    try {
      const company = await this.getUnbankedCompany(id)

      const { supabase } = await import('./supabase.js')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Criar registro na tabela companies
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          cnpj: company.cnpj,
          company_name: company.company_name,
          trade_name: company.trade_name,
          company_type: company.company_type,
          email: company.contact_info?.email,
          phone: company.contact_info?.phone,
          address: company.contact_info?.address,
          banking_status: 'fully_banked',
          products_contracted: company.potential_products || [],
          employee_count: company.employee_count,
          annual_revenue: company.revenue_estimate,
          industry: company.industry,
          owner_user_id: user.id,
          ...additionalData
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      // Atualizar status da empresa para 'converted'
      await this.updateCompanyStatus(id, 'converted')

      return await response.json()
    } catch (error) {
      console.error('Error converting company to client:', error)
      throw error
    }
  }

  /**
   * Calcular potencial de múltiplas empresas
   * @param {Array<string>} companyIds - IDs das empresas
   * @returns {Promise<Object>} Resultado do cálculo
   */
  static async calculatePotential(companyIds) {
    try {
      const response = await fetch('/api/unbanked-companies/calculate-potential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyIds })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error calculating potential:', error)
      throw error
    }
  }

  /**
   * Criar nova empresa não bancarizada
   * @param {Object} companyData - Dados da empresa
   * @returns {Promise<Object>} Empresa criada
   */
  static async createUnbankedCompany(companyData) {
    try {
      const { supabase } = await import('./supabase.js')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const response = await fetch('/api/unbanked-companies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          ...companyData,
          created_by: user.id
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.company
    } catch (error) {
      console.error('Error creating unbanked company:', error)
      throw error
    }
  }

  /**
   * Atualizar empresa não bancarizada
   * @param {string} id - ID da empresa
   * @param {Object} updates - Dados a atualizar
   * @returns {Promise<Object>} Empresa atualizada
   */
  static async updateUnbankedCompany(id, updates) {
    try {
      const response = await fetch('/api/unbanked-companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.company
    } catch (error) {
      console.error('Error updating unbanked company:', error)
      throw error
    }
  }

  /**
   * Deletar empresa não bancarizada
   * @param {string} id - ID da empresa
   * @returns {Promise<Object>} Resultado da exclusão
   */
  static async deleteUnbankedCompany(id) {
    try {
      const response = await fetch(`/api/unbanked-companies?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting unbanked company:', error)
      throw error
    }
  }
}

