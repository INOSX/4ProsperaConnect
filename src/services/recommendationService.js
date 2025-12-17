/**
 * Serviço para gerar e gerenciar recomendações
 */
export class RecommendationService {
  /**
   * Gerar recomendações para um target
   * @param {string} targetType - Tipo (prospect, company, employee)
   * @param {string} targetId - ID do target
   * @param {boolean} useAI - Usar IA para gerar
   * @returns {Promise<Object>} Recomendações geradas
   */
  static async generateRecommendations(targetType, targetId, useAI = true) {
    try {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, useAI })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw error
    }
  }

  /**
   * Rastrear aceitação/rejeição de recomendação
   * @param {string} recommendationId - ID da recomendação
   * @param {string} status - Status (accepted, rejected, expired)
   * @param {string} feedback - Feedback opcional
   * @returns {Promise<Object>} Recomendação atualizada
   */
  static async trackRecommendation(recommendationId, status, feedback = null) {
    try {
      const response = await fetch('/api/recommendations/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, status, feedback })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error tracking recommendation:', error)
      throw error
    }
  }

  /**
   * Buscar recomendações para um target
   * @param {string} targetType - Tipo do target
   * @param {string} targetId - ID do target
   * @param {string} status - Status das recomendações (opcional)
   * @returns {Promise<Array>} Lista de recomendações
   */
  static async getRecommendations(targetType, targetId, status = null) {
    try {
      const { supabase } = await import('./supabase.js')
      
      let query = supabase
        .from('recommendations')
        .select('*, product_catalog (*)')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, recommendations: data || [] }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return { success: false, error: error.message }
    }
  }
}

