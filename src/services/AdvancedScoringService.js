/**
 * Serviço para cálculo avançado de scores de prospecção
 * Calcula conversion probability, LTV estimate e churn risk de forma equilibrada
 */
export class AdvancedScoringService {
  /**
   * Calcular probabilidade de conversão CPF → CNPJ
   * @param {Object} prospect - Dados do prospect
   * @returns {Promise<number>} Probabilidade de conversão (0-100)
   */
  static async calculateConversionProbability(prospect) {
    let probability = 0

    // Fator 1: Score atual (peso 0.3)
    const baseScore = prospect.score || 0
    probability += baseScore * 0.3

    // Fator 2: Padrões transacionais (peso 0.25)
    const transactionVolume = prospect.behavior_data?.transaction_volume || 0
    const transactionFrequency = prospect.behavior_data?.frequency || 0
    const transactionScore = Math.min(
      (transactionVolume > 10000 ? 30 : transactionVolume > 5000 ? 20 : 10) +
      (transactionFrequency > 20 ? 20 : transactionFrequency > 10 ? 15 : 10),
      50
    )
    probability += transactionScore * 0.25

    // Fator 3: Indicadores de atividade empresarial (peso 0.25)
    let businessActivityScore = 0
    if (prospect.cnpj) businessActivityScore += 20
    if (prospect.market_signals?.business_activity) businessActivityScore += 15
    if (prospect.market_signals?.high_transaction_volume) businessActivityScore += 10
    if (prospect.market_signals?.frequent_activity) businessActivityScore += 5
    probability += Math.min(businessActivityScore, 50) * 0.25

    // Fator 4: Dados de APIs externas (peso 0.2)
    let externalDataScore = 0
    if (prospect.consumption_profile?.credit_score) {
      const creditScore = prospect.consumption_profile.credit_score
      externalDataScore += creditScore > 700 ? 30 : creditScore > 600 ? 20 : 10
    }
    if (prospect.consumption_profile?.payment_history) {
      const paymentHistory = prospect.consumption_profile.payment_history
      externalDataScore += paymentHistory === 'good' ? 20 : paymentHistory === 'fair' ? 10 : 0
    }
    probability += Math.min(externalDataScore, 50) * 0.2

    return Math.min(Math.round(probability), 100)
  }

  /**
   * Estimar Lifetime Value (LTV)
   * @param {Object} prospect - Dados do prospect
   * @returns {Promise<number>} LTV estimado em reais
   */
  static async estimateLTV(prospect) {
    let ltv = 0

    // Base: Receita estimada da empresa
    const estimatedRevenue = prospect.consumption_profile?.estimated_revenue || 0
    if (estimatedRevenue > 0) {
      // LTV = Receita anual * 3 anos (estimativa conservadora)
      ltv = estimatedRevenue * 3
    } else {
      // Estimar baseado em transações
      const transactionVolume = prospect.behavior_data?.transaction_volume || 0
      if (transactionVolume > 0) {
        // Estimar receita anual como 12x o volume mensal médio
        const monthlyVolume = transactionVolume / 12
        const estimatedAnnualRevenue = monthlyVolume * 12
        ltv = estimatedAnnualRevenue * 3
      } else {
        // LTV base padrão para PMEs
        ltv = 50000 // R$ 50.000 base
      }
    }

    // Ajustar baseado em produtos bancários potenciais
    const potentialProducts = prospect.consumption_profile?.potential_products || []
    const productMultiplier = 1 + (potentialProducts.length * 0.1)
    ltv *= productMultiplier

    // Ajustar baseado em histórico de clientes similares
    const similarClientsMultiplier = prospect.consumption_profile?.similar_clients_ltv_multiplier || 1
    ltv *= similarClientsMultiplier

    // Limitar entre R$ 10.000 e R$ 1.000.000
    ltv = Math.max(10000, Math.min(ltv, 1000000))

    return Math.round(ltv)
  }

  /**
   * Calcular risco de churn
   * @param {Object} prospect - Dados do prospect
   * @returns {Promise<number>} Risco de churn (0-100)
   */
  static async calculateChurnRisk(prospect) {
    let churnRisk = 50 // Base média

    // Fator 1: Estabilidade financeira (peso 0.3)
    let stabilityScore = 50
    if (prospect.consumption_profile?.financial_stability) {
      const stability = prospect.consumption_profile.financial_stability
      if (stability === 'high') stabilityScore = 20
      else if (stability === 'medium') stabilityScore = 40
      else if (stability === 'low') stabilityScore = 70
    }
    churnRisk = churnRisk * 0.7 + stabilityScore * 0.3

    // Fator 2: Padrões de uso de serviços (peso 0.25)
    const serviceUsage = prospect.behavior_data?.service_usage || {}
    let usageScore = 50
    if (serviceUsage.frequency) {
      if (serviceUsage.frequency > 20) usageScore = 20
      else if (serviceUsage.frequency > 10) usageScore = 40
      else usageScore = 60
    }
    churnRisk = churnRisk * 0.75 + usageScore * 0.25

    // Fator 3: Indicadores de mercado (peso 0.25)
    const marketIndicators = prospect.market_signals || {}
    let marketScore = 50
    if (marketIndicators.market_volatility) marketScore += 20
    if (marketIndicators.competitor_activity) marketScore += 15
    if (marketIndicators.industry_trend === 'declining') marketScore += 25
    churnRisk = churnRisk * 0.75 + marketScore * 0.25

    // Fator 4: Score de crédito (peso 0.2)
    const creditScore = prospect.consumption_profile?.credit_score || 600
    let creditRisk = 50
    if (creditScore < 500) creditRisk = 80
    else if (creditScore < 600) creditRisk = 60
    else if (creditScore < 700) creditRisk = 40
    else creditRisk = 20
    churnRisk = churnRisk * 0.8 + creditRisk * 0.2

    return Math.min(Math.round(churnRisk), 100)
  }

  /**
   * Calcular score combinado equilibrado
   * @param {Object} prospect - Dados do prospect
   * @param {Object} weights - Pesos opcionais para cada fator
   * @returns {Promise<Object>} Scores calculados
   */
  static async getCombinedScore(prospect, weights = {}) {
    const defaultWeights = {
      conversionProbability: 0.35,
      ltv: 0.30,
      churnRisk: 0.20,
      engagement: 0.15
    }

    const w = { ...defaultWeights, ...weights }

    // Calcular métricas individuais
    const conversionProbability = await this.calculateConversionProbability(prospect)
    const ltvEstimate = await this.estimateLTV(prospect)
    const churnRisk = await this.calculateChurnRisk(prospect)

    // Normalizar LTV para 0-100 (assumindo max de R$ 1.000.000)
    const ltvScore = Math.min((ltvEstimate / 1000000) * 100, 100)

    // Calcular engagement score
    const engagementScore = this.calculateEngagementScore(prospect)

    // Calcular score combinado
    const combinedScore = (
      conversionProbability * w.conversionProbability +
      ltvScore * w.ltv +
      (100 - churnRisk) * w.churnRisk + // Inverter churn (menor risco = maior score)
      engagementScore * w.engagement
    )

    return {
      conversionProbability,
      ltvEstimate,
      churnRisk,
      engagementScore,
      combinedScore: Math.round(combinedScore),
      financialHealthScore: this.calculateFinancialHealthScore(prospect)
    }
  }

  /**
   * Calcular score de engajamento
   * @param {Object} prospect - Dados do prospect
   * @returns {number} Score de engajamento (0-100)
   */
  static calculateEngagementScore(prospect) {
    let score = 0

    // Frequência de interação
    const interactionFrequency = prospect.behavior_data?.interaction_frequency || 0
    score += Math.min(interactionFrequency * 2, 40)

    // Diversidade de canais
    const channels = prospect.behavior_data?.channels || []
    score += Math.min(channels.length * 10, 30)

    // Recência
    const lastInteraction = prospect.behavior_data?.last_interaction
    if (lastInteraction) {
      const daysSince = (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) score += 30
      else if (daysSince < 30) score += 20
      else if (daysSince < 90) score += 10
    }

    return Math.min(score, 100)
  }

  /**
   * Calcular score de saúde financeira
   * @param {Object} prospect - Dados do prospect
   * @returns {number} Score de saúde financeira (0-100)
   */
  static calculateFinancialHealthScore(prospect) {
    let score = 50 // Base

    // Score de crédito
    const creditScore = prospect.consumption_profile?.credit_score || 600
    score = score * 0.5 + (creditScore / 10) * 0.5

    // Histórico de pagamentos
    const paymentHistory = prospect.consumption_profile?.payment_history
    if (paymentHistory === 'good') score += 20
    else if (paymentHistory === 'fair') score += 10
    else score -= 10

    // Estabilidade
    const stability = prospect.consumption_profile?.financial_stability
    if (stability === 'high') score += 15
    else if (stability === 'medium') score += 5
    else score -= 15

    return Math.max(0, Math.min(score, 100))
  }

  /**
   * Salvar métricas de scoring no banco
   * @param {string} prospectId - ID do prospect
   * @param {Object} metrics - Métricas calculadas
   * @returns {Promise<Object>} Resultado
   */
  static async saveScoringMetrics(prospectId, metrics) {
    try {
      const { supabase } = await import('./supabase.js')

      const { data, error } = await supabase
        .from('prospect_scoring_metrics')
        .upsert({
          prospect_id: prospectId,
          conversion_probability: metrics.conversionProbability,
          ltv_estimate: metrics.ltvEstimate,
          churn_risk: metrics.churnRisk,
          engagement_score: metrics.engagementScore,
          financial_health_score: metrics.financialHealthScore,
          combined_score: metrics.combinedScore,
          calculated_at: new Date().toISOString()
        }, {
          onConflict: 'prospect_id'
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar também na tabela prospects
      await supabase
        .from('prospects')
        .update({
          ltv_estimate: metrics.ltvEstimate,
          churn_risk: metrics.churnRisk,
          score: metrics.combinedScore,
          conversion_probability: metrics.conversionProbability / 100
        })
        .eq('id', prospectId)

      return {
        success: true,
        metrics: data
      }
    } catch (error) {
      console.error('Error saving scoring metrics:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

