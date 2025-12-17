/**
 * Serviço para gestão de campanhas
 */
export class CampaignService {
  /**
   * Listar campanhas
   * @param {Object} filters - Filtros (status, type, createdBy)
   * @returns {Promise<Object>} Lista de campanhas
   */
  static async getCampaigns(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.type) params.append('type', filters.type)
      if (filters.createdBy) params.append('createdBy', filters.createdBy)

      const response = await fetch(`/api/campaigns?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      throw error
    }
  }

  /**
   * Criar nova campanha
   * @param {Object} campaignData - Dados da campanha
   * @returns {Promise<Object>} Campanha criada
   */
  static async createCampaign(campaignData) {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  }

  /**
   * Atualizar campanha
   * @param {string} campaignId - ID da campanha
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<Object>} Campanha atualizada
   */
  static async updateCampaign(campaignId, updates) {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, ...updates })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating campaign:', error)
      throw error
    }
  }

  /**
   * Ativar campanha
   * @param {string} campaignId - ID da campanha
   * @returns {Promise<Object>} Campanha ativada
   */
  static async activateCampaign(campaignId) {
    return this.updateCampaign(campaignId, { status: 'active' })
  }

  /**
   * Pausar campanha
   * @param {string} campaignId - ID da campanha
   * @returns {Promise<Object>} Campanha pausada
   */
  static async pauseCampaign(campaignId) {
    return this.updateCampaign(campaignId, { status: 'paused' })
  }
}

