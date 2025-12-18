/**
 * Serviço para sincronizar dados de prospecção com o vectorstore
 */
export class ProspectVectorstoreService {
  /**
   * Sincronizar todos os prospects do usuário para o vectorstore
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da sincronização
   */
  static async syncProspectsToVectorstore(userId) {
    try {
      const response = await fetch('/api/prospects/sync-to-vectorstore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, syncAll: true })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error syncing prospects to vectorstore:', error)
      throw error
    }
  }

  /**
   * Sincronizar um prospect específico para o vectorstore
   * @param {string} prospectId - ID do prospect
   * @returns {Promise<Object>} Resultado da sincronização
   */
  static async syncProspectToVectorstore(prospectId) {
    try {
      const response = await fetch('/api/prospects/sync-to-vectorstore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectIds: [prospectId] })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error syncing prospect to vectorstore:', error)
      throw error
    }
  }

  /**
   * Formatar dados de um prospect para embedding no vectorstore
   * @param {Object} prospect - Dados do prospect
   * @param {Object} metrics - Métricas de scoring (opcional)
   * @returns {string} Texto formatado para embedding
   */
  static formatProspectForVectorstore(prospect, metrics = null) {
    let text = `Prospect: ${prospect.name}\n`
    
    if (prospect.cpf) {
      text += `CPF: ${prospect.cpf}\n`
    }
    
    if (prospect.cnpj) {
      text += `CNPJ: ${prospect.cnpj}\n`
    }
    
    if (prospect.email) {
      text += `Email: ${prospect.email}\n`
    }
    
    if (prospect.phone) {
      text += `Telefone: ${prospect.phone}\n`
    }
    
    text += `Score: ${prospect.score || 0}\n`
    text += `Status: ${prospect.qualification_status}\n`
    text += `Prioridade: ${prospect.priority || 0}/10\n`
    
    if (metrics) {
      text += `Probabilidade de Conversão: ${metrics.conversion_probability || 0}%\n`
      text += `LTV Estimado: R$ ${(metrics.ltv_estimate || 0).toLocaleString('pt-BR')}\n`
      text += `Risco de Churn: ${metrics.churn_risk || 0}%\n`
    } else if (prospect.ltv_estimate) {
      text += `LTV Estimado: R$ ${prospect.ltv_estimate.toLocaleString('pt-BR')}\n`
    }
    
    if (prospect.churn_risk) {
      text += `Risco de Churn: ${prospect.churn_risk}%\n`
    }
    
    if (prospect.market_signals && Object.keys(prospect.market_signals).length > 0) {
      text += `Sinais de Mercado: ${Object.keys(prospect.market_signals).join(', ')}\n`
    }
    
    if (prospect.notes) {
      text += `Observações: ${prospect.notes}\n`
    }
    
    return text
  }
}

