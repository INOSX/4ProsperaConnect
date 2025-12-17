/**
 * Serviço para gestão de benefícios
 */
export class BenefitService {
  /**
   * Listar benefícios de uma empresa
   * @param {string} companyId - ID da empresa
   * @returns {Promise<Object>} Lista de benefícios
   */
  static async getCompanyBenefits(companyId) {
    try {
      const response = await fetch(`/api/benefits?companyId=${companyId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching company benefits:', error)
      throw error
    }
  }

  /**
   * Buscar benefício por ID
   * @param {string} benefitId - ID do benefício
   * @returns {Promise<Object>} Dados do benefício
   */
  static async getBenefit(benefitId) {
    try {
      const response = await fetch(`/api/benefits?id=${benefitId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching benefit:', error)
      throw error
    }
  }

  /**
   * Criar novo benefício
   * @param {Object} benefitData - Dados do benefício
   * @returns {Promise<Object>} Benefício criado
   */
  static async createBenefit(benefitData) {
    try {
      const response = await fetch('/api/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(benefitData)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating benefit:', error)
      throw error
    }
  }

  /**
   * Atualizar benefício
   * @param {string} benefitId - ID do benefício
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<Object>} Benefício atualizado
   */
  static async updateBenefit(benefitId, updates) {
    try {
      const response = await fetch('/api/benefits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: benefitId, ...updates })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating benefit:', error)
      throw error
    }
  }
}

