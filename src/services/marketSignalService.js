/**
 * Serviço para análise de sinais de mercado
 */
export class MarketSignalService {
  /**
   * Identificar sinais de mercado a partir de dados
   * @param {Object} data - Dados do prospect/cliente
   * @returns {Object} Sinais identificados
   */
  static identifySignals(data) {
    const signals = {}

    // Sinais de volume de transações
    if (data.transaction_volume) {
      if (data.transaction_volume > 50000) {
        signals.high_transaction_volume = true
        signals.transaction_volume_level = 'high'
      } else if (data.transaction_volume > 10000) {
        signals.transaction_volume_level = 'medium'
      } else {
        signals.transaction_volume_level = 'low'
      }
    }

    // Sinais de frequência
    if (data.frequency) {
      if (data.frequency > 20) {
        signals.high_frequency = true
        signals.frequency_level = 'high'
      } else if (data.frequency > 10) {
        signals.frequency_level = 'medium'
      }
    }

    // Sinais de atividade empresarial
    if (data.business_indicators) {
      signals.business_activity = true
      if (data.business_indicators.includes('cnpj')) {
        signals.has_cnpj = true
      }
      if (data.business_indicators.includes('invoice')) {
        signals.issues_invoices = true
      }
    }

    // Sinais de padrão de consumo
    if (data.consumption_pattern) {
      if (data.consumption_pattern.includes('business')) {
        signals.business_consumption = true
      }
      if (data.consumption_pattern.includes('growth')) {
        signals.growth_trend = true
      }
    }

    // Sinais de mercado externos
    if (data.market_trends) {
      signals.market_alignment = data.market_trends
    }

    return signals
  }

  /**
   * Calcular força de um sinal
   * @param {string} signalType - Tipo do sinal
   * @param {Object} signalData - Dados do sinal
   * @returns {number} Força do sinal (0-1)
   */
  static calculateSignalStrength(signalType, signalData) {
    let strength = 0.5 // Base

    switch (signalType) {
      case 'transaction':
        if (signalData.volume > 50000) strength = 0.9
        else if (signalData.volume > 10000) strength = 0.7
        else strength = 0.5
        break

      case 'behavior':
        const signalCount = Object.keys(signalData).length
        strength = Math.min(signalCount * 0.1, 0.9)
        break

      case 'market_trend':
        strength = 0.8
        break

      default:
        strength = 0.5
    }

    return Math.round(strength * 100) / 100
  }

  /**
   * Agregar múltiplos sinais em um score único
   * @param {Array<Object>} signals - Lista de sinais
   * @returns {number} Score agregado (0-100)
   */
  static aggregateSignals(signals) {
    if (!signals || signals.length === 0) return 0

    const totalStrength = signals.reduce((sum, signal) => {
      return sum + (signal.strength || 0.5)
    }, 0)

    return Math.round((totalStrength / signals.length) * 100)
  }
}

