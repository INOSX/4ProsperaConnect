/**
 * Serviço para gerenciar integrações de dados
 */
export class DataIntegrationService {
  /**
   * Listar conexões de dados do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Lista de conexões
   */
  static async getConnections(userId) {
    try {
      const response = await fetch(`/api/integrations/connections?userId=${userId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching connections:', error)
      throw error
    }
  }

  /**
   * Criar nova conexão (apenas admins)
   * @param {Object} connectionData - Dados da conexão
   * @param {string} userId - ID do usuário que está criando
   * @returns {Promise<Object>} Conexão criada
   */
  static async createConnection(connectionData, userId) {
    try {
      const response = await fetch('/api/integrations/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...connectionData,
          userId // Passar userId para verificação de admin na API
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating connection:', error)
      throw error
    }
  }

  /**
   * Atualizar conexão (apenas admins)
   * @param {string} connectionId - ID da conexão
   * @param {Object} updates - Dados para atualizar
   * @param {string} userId - ID do usuário que está atualizando
   * @returns {Promise<Object>} Conexão atualizada
   */
  static async updateConnection(connectionId, updates, userId) {
    try {
      const response = await fetch('/api/integrations/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: connectionId, 
          ...updates,
          userId // Passar userId para verificação de admin na API
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating connection:', error)
      throw error
    }
  }

  /**
   * Testar conexão
   * @param {Object} connectionData - Dados da conexão para testar
   * @returns {Promise<Object>} Resultado do teste
   */
  static async testConnection(connectionData) {
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionData)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error testing connection:', error)
      throw error
    }
  }

  /**
   * Sincronizar dados de uma conexão (apenas admins)
   * @param {string} connectionId - ID da conexão
   * @param {boolean} force - Forçar sincronização mesmo se já estiver rodando
   * @param {string} userId - ID do usuário que está executando a sincronização
   * @returns {Promise<Object>} Job de sincronização
   */
  static async syncConnection(connectionId, force = false, userId) {
    try {
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connectionId, 
          force,
          userId // Passar userId para verificação de admin na API
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error syncing connection:', error)
      throw error
    }
  }

  /**
   * Mapear campos de dados externos
   * @param {Array} sourceFields - Campos de origem
   * @param {Object} targetSchema - Schema de destino
   * @param {boolean} useAI - Usar IA para mapeamento
   * @param {string} connectionId - ID da conexão (opcional)
   * @returns {Promise<Object>} Mapeamento de campos
   */
  static async mapFields(sourceFields, targetSchema, useAI = true, connectionId = null) {
    try {
      const response = await fetch('/api/integrations/map-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceFields,
          targetSchema,
          useAI,
          connectionId
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error mapping fields:', error)
      throw error
    }
  }

  /**
   * Buscar status de sincronização
   * @param {string} connectionId - ID da conexão
   * @returns {Promise<Object>} Status e histórico de syncs
   */
  static async getSyncStatus(connectionId) {
    try {
      const response = await fetch(`/api/integrations/sync?connectionId=${connectionId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching sync status:', error)
      throw error
    }
  }

  /**
   * Buscar uma conexão por ID
   * @param {string} connectionId - ID da conexão
   * @returns {Promise<Object>} Conexão
   */
  static async getConnection(connectionId) {
    try {
      const response = await fetch(`/api/integrations/connections?id=${connectionId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching connection:', error)
      throw error
    }
  }

  /**
   * Deletar conexão (apenas admins)
   * @param {string} connectionId - ID da conexão
   * @param {string} userId - ID do usuário que está deletando
   * @returns {Promise<Object>} Resultado da exclusão
   */
  static async deleteConnection(connectionId, userId) {
    try {
      const response = await fetch(`/api/integrations/connections?id=${connectionId}&userId=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting connection:', error)
      throw error
    }
  }
}

