/**
 * Serviço para gerenciar clientes CPF com potencial de conversão para CNPJ/MEI
 */
export class CPFClientService {
  /**
   * Buscar clientes CPF com filtros
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Object>} Lista de clientes e metadados
   */
  static async getCPFClients(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.minScore !== undefined) params.append('minScore', filters.minScore)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority !== undefined) params.append('priority', filters.priority)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.offset) params.append('offset', filters.offset)
      if (filters.orderBy) params.append('orderBy', filters.orderBy)
      if (filters.orderDirection) params.append('orderDirection', filters.orderDirection)

      const response = await fetch(`/api/cpf-clients?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching CPF clients:', error)
      throw error
    }
  }

  /**
   * Obter detalhes de um cliente CPF específico
   * @param {string} id - ID do cliente
   * @returns {Promise<Object>} Dados do cliente
   */
  static async getCPFClient(id) {
    try {
      const response = await fetch(`/api/cpf-clients?id=${id}`)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.client
    } catch (error) {
      console.error('Error fetching CPF client:', error)
      throw error
    }
  }

  /**
   * Calcular potencial de conversão para um cliente CPF
   * @param {Object} cpfClient - Dados do cliente CPF
   * @returns {Promise<Object>} Scores calculados
   */
  static async calculateConversionPotential(cpfClient) {
    try {
      const response = await fetch('/api/cpf-clients/calculate-potential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: cpfClient })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.scores[0] // Retorna o primeiro score (único cliente)
    } catch (error) {
      console.error('Error calculating conversion potential:', error)
      throw error
    }
  }

  /**
   * Analisar múltiplos clientes CPF em lote
   * @param {Array<string>} cpfClientIds - IDs dos clientes a analisar
   * @returns {Promise<Object>} Resultado da análise
   */
  static async analyzeCPFClients(cpfClientIds) {
    try {
      const response = await fetch('/api/cpf-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          clientIds: cpfClientIds
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error analyzing CPF clients:', error)
      throw error
    }
  }

  /**
   * Atualizar status de um cliente CPF
   * @param {string} id - ID do cliente
   * @param {string} status - Novo status
   * @returns {Promise<Object>} Cliente atualizado
   */
  static async updateCPFClientStatus(id, status) {
    try {
      const response = await fetch('/api/cpf-clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.client
    } catch (error) {
      console.error('Error updating CPF client status:', error)
      throw error
    }
  }

  /**
   * Converter cliente CPF para prospect CNPJ
   * @param {string} id - ID do cliente CPF
   * @param {Object} additionalData - Dados adicionais para o prospect
   * @returns {Promise<Object>} Prospect criado
   */
  static async convertToProspect(id, additionalData = {}) {
    try {
      // Buscar dados do cliente CPF
      const cpfClient = await this.getCPFClient(id)

      // Obter userId do contexto de autenticação
      const { supabase } = await import('./supabase.js')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Criar prospect a partir do cliente CPF
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          cpf: cpfClient.cpf,
          name: cpfClient.name,
          email: cpfClient.email,
          phone: cpfClient.phone,
          score: cpfClient.conversion_potential_score || 0,
          qualification_status: 'pending',
          market_signals: cpfClient.market_signals || {},
          behavior_data: {
            transaction_volume: cpfClient.transaction_volume,
            frequency: cpfClient.transaction_frequency,
            average_transaction_value: cpfClient.average_transaction_value
          },
          consumption_profile: cpfClient.consumption_profile || {},
          conversion_probability: cpfClient.conversion_probability,
          priority: cpfClient.priority || 0,
          notes: `Convertido de CPF Client: ${cpfClient.name} (${cpfClient.cpf})`,
          created_by: user.id,
          ...additionalData
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const prospectResult = await response.json()

      // Atualizar status do cliente CPF para 'converted'
      await this.updateCPFClientStatus(id, 'converted')

      return prospectResult.prospect
    } catch (error) {
      console.error('Error converting CPF client to prospect:', error)
      throw error
    }
  }

  /**
   * Criar novo cliente CPF
   * @param {Object} clientData - Dados do cliente
   * @returns {Promise<Object>} Cliente criado
   */
  static async createCPFClient(clientData) {
    try {
      const response = await fetch('/api/cpf-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.client
    } catch (error) {
      console.error('Error creating CPF client:', error)
      throw error
    }
  }

  /**
   * Atualizar cliente CPF
   * @param {string} id - ID do cliente
   * @param {Object} updates - Dados a atualizar
   * @returns {Promise<Object>} Cliente atualizado
   */
  static async updateCPFClient(id, updates) {
    try {
      const response = await fetch('/api/cpf-clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.client
    } catch (error) {
      console.error('Error updating CPF client:', error)
      throw error
    }
  }

  /**
   * Deletar cliente CPF
   * @param {string} id - ID do cliente
   * @returns {Promise<Object>} Resultado da exclusão
   */
  static async deleteCPFClient(id) {
    try {
      const response = await fetch(`/api/cpf-clients?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting CPF client:', error)
      throw error
    }
  }
}

