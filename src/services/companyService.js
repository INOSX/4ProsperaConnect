/**
 * Serviço para gestão de empresas
 */
export class CompanyService {
  /**
   * Buscar empresa por ID
   * @param {string} companyId - ID da empresa
   * @returns {Promise<Object>} Dados da empresa
   */
  static async getCompany(companyId) {
    try {
      const response = await fetch(`/api/companies?id=${companyId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching company:', error)
      throw error
    }
  }

  /**
   * Buscar empresa por CNPJ
   * @param {string} cnpj - CNPJ da empresa
   * @returns {Promise<Object>} Dados da empresa
   */
  static async getCompanyByCNPJ(cnpj) {
    try {
      const response = await fetch(`/api/companies?cnpj=${cnpj}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching company by CNPJ:', error)
      throw error
    }
  }

  /**
   * Listar empresas do usuário (ou todas se for admin)
   * @param {string} ownerUserId - ID do dono
   * @param {boolean} isAdmin - Se o usuário é admin
   * @returns {Promise<Object>} Lista de empresas
   */
  static async getUserCompanies(ownerUserId, isAdmin = false) {
    try {
      // Se for admin, buscar todas as empresas
      const url = isAdmin 
        ? '/api/companies' // Buscar todas
        : `/api/companies?ownerUserId=${ownerUserId}` // Buscar apenas do usuário
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching user companies:', error)
      throw error
    }
  }

  /**
   * Criar nova empresa (apenas admins)
   * @param {Object} companyData - Dados da empresa
   * @param {string} userId - ID do usuário que está criando
   * @returns {Promise<Object>} Empresa criada
   */
  static async createCompany(companyData, userId) {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...companyData,
          userId // Passar userId para verificação de admin na API
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating company:', error)
      throw error
    }
  }

  /**
   * Atualizar empresa
   * @param {string} companyId - ID da empresa
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<Object>} Empresa atualizada
   */
  static async updateCompany(companyId, updates) {
    try {
      const response = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: companyId, ...updates })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  }
}

