/**
 * Serviço para cálculo de scores e priorização
 */
export class ScoringService {
  /**
   * Calcular score de conversão para um prospect
   * @param {Object} prospect - Dados do prospect
   * @param {Object} weights - Pesos para cada fator
   * @returns {number} Score calculado (0-100)
   */
  static calculateConversionScore(prospect, weights = {}) {
    const defaultWeights = {
      baseScore: 0.4,
      marketSignals: 0.3,
      behaviorData: 0.2,
      consumptionProfile: 0.1
    }

    const w = { ...defaultWeights, ...weights }
    let score = 0

    // Score base
    score += (prospect.score || 0) * w.baseScore

    // Market signals
    const signalsCount = Object.keys(prospect.market_signals || {}).length
    score += Math.min(signalsCount * 10, 30) * w.marketSignals

    // Behavior data
    const behaviorCount = Object.keys(prospect.behavior_data || {}).length
    score += Math.min(behaviorCount * 5, 20) * w.behaviorData

    // Consumption profile
    const consumptionCount = Object.keys(prospect.consumption_profile || {}).length
    score += Math.min(consumptionCount * 5, 10) * w.consumptionProfile

    return Math.min(Math.round(score), 100)
  }

  /**
   * Priorizar prospects baseado em score e outros fatores
   * @param {Array<Object>} prospects - Lista de prospects
   * @returns {Array<Object>} Prospects ordenados por prioridade
   */
  static prioritizeProspects(prospects) {
    return prospects
      .map(prospect => ({
        ...prospect,
        priority: this.calculatePriority(prospect)
      }))
      .sort((a, b) => {
        // Ordenar por prioridade, depois por score
        if (b.priority !== a.priority) {
          return b.priority - a.priority
        }
        return b.score - a.score
      })
  }

  /**
   * Calcular prioridade de um prospect
   * @param {Object} prospect - Dados do prospect
   * @returns {number} Prioridade (0-10)
   */
  static calculatePriority(prospect) {
    let priority = 0

    // Score alto = alta prioridade
    if (prospect.score >= 80) priority += 5
    else if (prospect.score >= 60) priority += 3
    else if (prospect.score >= 40) priority += 1

    // Status qualificado = alta prioridade
    if (prospect.qualification_status === 'qualified') priority += 3

    // Tem CNPJ = maior prioridade
    if (prospect.cnpj) priority += 2

    // Muitos sinais de mercado = maior prioridade
    const signalsCount = Object.keys(prospect.market_signals || {}).length
    if (signalsCount >= 3) priority += 1

    return Math.min(priority, 10)
  }
}

