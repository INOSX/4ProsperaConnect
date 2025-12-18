/**
 * Serviço para enriquecimento de prospects com múltiplas fontes de dados
 */
export class ProspectEnrichmentService {
  /**
   * Enriquecer prospects com fontes selecionadas
   * @param {Array<string>} prospectIds - IDs dos prospects
   * @param {Array<Object>} sourceConfigs - Configurações das fontes [{sourceType, sourceId, fieldMapping}]
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado com job ID
   */
  static async enrichProspects(prospectIds, sourceConfigs, userId) {
    try {
      const response = await fetch('/api/prospects/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectIds,
          sourceConfigs,
          userId
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error enriching prospects:', error)
      throw error
    }
  }

  /**
   * Obter status de um job de enriquecimento
   * @param {string} jobId - ID do job
   * @returns {Promise<Object>} Status do job
   */
  static async getEnrichmentJobStatus(jobId) {
    try {
      const response = await fetch(`/api/prospects/enrich?jobId=${jobId}`)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting job status:', error)
      throw error
    }
  }

  /**
   * Listar fontes disponíveis para prospecção
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Fontes disponíveis
   */
  static async getAvailableSources(userId) {
    try {
      const { supabase } = await import('./supabase.js')
      const { DataIntegrationService } = await import('./dataIntegrationService.js')

      // Buscar uploads
      const { data: uploads, error: uploadsError } = await supabase
        .from('data_sources_new')
        .select('*')
        .eq('is_available_for_prospecting', true)
        .order('created_at', { ascending: false })

      // Buscar conexões
      let connections = []
      try {
        const connectionsResult = await DataIntegrationService.getConnections(userId)
        if (connectionsResult.success) {
          connections = (connectionsResult.connections || []).filter(
            c => c.is_available_for_prospecting !== false
          )
        }
      } catch (error) {
        console.warn('Error loading connections:', error)
      }

      // Buscar APIs externas
      const { data: apis, error: apisError } = await supabase
        .from('external_api_integrations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      return {
        success: true,
        sources: {
          uploads: uploads || [],
          connections: connections || [],
          externalApis: apis || []
        }
      }
    } catch (error) {
      console.error('Error getting available sources:', error)
      return {
        success: false,
        error: error.message,
        sources: {
          uploads: [],
          connections: [],
          externalApis: []
        }
      }
    }
  }

  /**
   * Mapear campos automaticamente entre fonte e prospect
   * @param {string} sourceType - Tipo da fonte (upload, database, external_api)
   * @param {string} sourceId - ID da fonte
   * @returns {Promise<Object>} Mapeamento de campos
   */
  static async mapFields(sourceType, sourceId) {
    try {
      const response = await fetch('/api/prospects/map-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          sourceId
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
   * Obter histórico de enriquecimento de um prospect
   * @param {string} prospectId - ID do prospect
   * @returns {Promise<Object>} Histórico de enriquecimento
   */
  static async getEnrichmentHistory(prospectId) {
    try {
      const { supabase } = await import('./supabase.js')

      const { data, error } = await supabase
        .from('prospect_enrichment_history')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        history: data || []
      }
    } catch (error) {
      console.error('Error getting enrichment history:', error)
      return {
        success: false,
        error: error.message,
        history: []
      }
    }
  }

  /**
   * Obter fontes de dados vinculadas a um prospect
   * @param {string} prospectId - ID do prospect
   * @returns {Promise<Object>} Fontes vinculadas
   */
  static async getProspectDataSources(prospectId) {
    try {
      const { supabase } = await import('./supabase.js')

      const { data, error } = await supabase
        .from('prospect_data_sources')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        dataSources: data || []
      }
    } catch (error) {
      console.error('Error getting prospect data sources:', error)
      return {
        success: false,
        error: error.message,
        dataSources: []
      }
    }
  }
}

