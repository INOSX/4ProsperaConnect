/**
 * Serviço para lógica de prospecção e qualificação
 */
export class ProspectingService {
  /**
   * Identificar potenciais CNPJs a partir de lista de CPFs
   * @param {Array} cpfs - Lista de CPFs ou objetos com dados
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado com prospects identificados
   */
  static async identifyProspects(cpfs, userId) {
    try {
      const response = await fetch('/api/prospects/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpfs, userId })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error identifying prospects:', error)
      throw error
    }
  }

  /**
   * Qualificar prospects aplicando critérios
   * @param {Array<string>} prospectIds - IDs dos prospects
   * @param {string} criteriaId - ID dos critérios (opcional)
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado com prospects qualificados
   */
  static async qualifyProspects(prospectIds, userId, criteriaId = null) {
    try {
      const response = await fetch('/api/prospects/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectIds, criteriaId, userId })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error qualifying prospects:', error)
      throw error
    }
  }

  /**
   * Gerar recomendações de produtos para um prospect
   * @param {string} prospectId - ID do prospect
   * @param {boolean} useAI - Usar IA para gerar recomendações
   * @returns {Promise<Object>} Recomendações geradas
   */
  static async recommendProducts(prospectId, useAI = true) {
    try {
      const response = await fetch('/api/prospects/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId, useAI })
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
   * Buscar prospects com filtros
   * @param {Object} filters - Filtros (status, score, etc)
   * @returns {Promise<Array>} Lista de prospects
   */
  static async getProspects(filters = {}) {
    try {
      const { supabase } = await import('./supabase.js')
      
      let query = supabase
        .from('prospects')
        .select('*')
        .order('priority', { ascending: false })
        .order('score', { ascending: false })

      if (filters.status) {
        query = query.eq('qualification_status', filters.status)
      }

      if (filters.minScore !== undefined) {
        query = query.gte('score', filters.minScore)
      }

      if (filters.maxScore !== undefined) {
        query = query.lte('score', filters.maxScore)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, prospects: data || [] }
    } catch (error) {
      console.error('Error fetching prospects:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Buscar um prospect específico
   * @param {string} prospectId - ID do prospect
   * @returns {Promise<Object>} Dados do prospect
   */
  static async getProspect(prospectId) {
    try {
      const { supabase } = await import('./supabase.js')
      
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', prospectId)
        .single()

      if (error) throw error
      return { success: true, prospect: data }
    } catch (error) {
      console.error('Error fetching prospect:', error)
      return { success: false, error: error.message }
    }
  }
}

