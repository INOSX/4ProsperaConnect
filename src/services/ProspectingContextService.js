/**
 * Serviço para buscar e formatar contexto de prospecção para o avatar
 */
export class ProspectingContextService {
  /**
   * Obter contexto de prospecção baseado na página atual
   * @param {string} userId - ID do usuário
   * @param {string} currentPage - Página atual ('dashboard', 'list', 'detail')
   * @param {string} prospectId - ID do prospect (se em página de detalhes)
   * @returns {Promise<Object>} Contexto formatado
   */
  static async getProspectingContext(userId, currentPage, prospectId = null) {
    try {
      const { supabase } = await import('./supabase.js')
      const { AdvancedScoringService } = await import('./AdvancedScoringService.js')

      // Buscar estatísticas gerais
      const stats = await this.getProspectingStats(userId)

      // Buscar prospect atual se em página de detalhes
      let currentProspect = null
      if (currentPage === 'detail' && prospectId) {
        const prospectResult = await this.getProspectSummary(prospectId)
        if (prospectResult.success) {
          currentProspect = prospectResult.prospect
        }
      }

      return {
        currentPage,
        prospectId,
        stats,
        currentProspect
      }
    } catch (error) {
      console.error('Error getting prospecting context:', error)
      return {
        currentPage,
        prospectId,
        stats: {
          total: 0,
          qualified: 0,
          averageScore: 0,
          averageLTV: 0,
          averageChurnRisk: 0
        },
        currentProspect: null
      }
    }
  }

  /**
   * Obter estatísticas agregadas de prospecção
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Estatísticas
   */
  static async getProspectingStats(userId) {
    try {
      const { supabase } = await import('./supabase.js')

      // Buscar todos os prospects do usuário
      const { data: prospects, error } = await supabase
        .from('prospects')
        .select('*')
        .or(`created_by.eq.${userId},created_by.is.null`)

      if (error) throw error

      const total = prospects?.length || 0
      const qualified = prospects?.filter(p => p.qualification_status === 'qualified').length || 0
      
      const scores = prospects?.map(p => p.score || 0).filter(s => s > 0) || []
      const averageScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0

      const ltvs = prospects?.map(p => p.ltv_estimate || 0).filter(l => l > 0) || []
      const averageLTV = ltvs.length > 0
        ? ltvs.reduce((sum, l) => sum + l, 0) / ltvs.length
        : 0

      const churnRisks = prospects?.map(p => p.churn_risk || 0).filter(c => c > 0) || []
      const averageChurnRisk = churnRisks.length > 0
        ? churnRisks.reduce((sum, c) => sum + c, 0) / churnRisks.length
        : 0

      return {
        total,
        qualified,
        averageScore: Math.round(averageScore),
        averageLTV: Math.round(averageLTV),
        averageChurnRisk: Math.round(averageChurnRisk)
      }
    } catch (error) {
      console.error('Error getting prospecting stats:', error)
      return {
        total: 0,
        qualified: 0,
        averageScore: 0,
        averageLTV: 0,
        averageChurnRisk: 0
      }
    }
  }

  /**
   * Obter resumo formatado de um prospect
   * @param {string} prospectId - ID do prospect
   * @returns {Promise<Object>} Resumo do prospect
   */
  static async getProspectSummary(prospectId) {
    try {
      const { supabase } = await import('./supabase.js')

      // Buscar prospect
      const { data: prospect, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', prospectId)
        .single()

      if (error) throw error

      // Buscar métricas de scoring
      const { data: metrics } = await supabase
        .from('prospect_scoring_metrics')
        .select('*')
        .eq('prospect_id', prospectId)
        .single()

      // Buscar fontes de dados
      const { data: dataSources } = await supabase
        .from('prospect_data_sources')
        .select('*')
        .eq('prospect_id', prospectId)

      return {
        success: true,
        prospect: {
          id: prospect.id,
          name: prospect.name,
          cpf: prospect.cpf,
          cnpj: prospect.cnpj,
          email: prospect.email,
          phone: prospect.phone,
          score: prospect.score || 0,
          ltv_estimate: prospect.ltv_estimate || metrics?.ltv_estimate || 0,
          churn_risk: prospect.churn_risk || metrics?.churn_risk || 0,
          conversion_probability: (prospect.conversion_probability || metrics?.conversion_probability || 0) * 100,
          qualification_status: prospect.qualification_status,
          priority: prospect.priority || 0,
          dataSourcesCount: dataSources?.length || 0,
          enrichmentStatus: prospect.enrichment_status || 'not_enriched'
        }
      }
    } catch (error) {
      console.error('Error getting prospect summary:', error)
      return {
        success: false,
        error: error.message,
        prospect: null
      }
    }
  }

  /**
   * Formatar contexto para o assistente
   * @param {Object} context - Contexto de prospecção
   * @returns {string} Contexto formatado em texto
   */
  static formatContextForAssistant(context) {
    let contextText = 'Você está ajudando o usuário com dados de prospecção de CNPJs/MEIs.\n\n'

    // Estatísticas gerais
    contextText += 'ESTATÍSTICAS GERAIS:\n'
    contextText += `- Total de prospects: ${context.stats.total}\n`
    contextText += `- Qualificados: ${context.stats.qualified} (${context.stats.total > 0 ? Math.round((context.stats.qualified / context.stats.total) * 100) : 0}%)\n`
    contextText += `- Score médio: ${context.stats.averageScore}\n`
    contextText += `- LTV médio estimado: R$ ${context.stats.averageLTV.toLocaleString('pt-BR')}\n`
    contextText += `- Risco médio de churn: ${context.stats.averageChurnRisk}%\n\n`

    // Prospect atual (se em página de detalhes)
    if (context.currentProspect) {
      contextText += 'PROSPECT ATUAL:\n'
      contextText += `- Nome: ${context.currentProspect.name}\n`
      if (context.currentProspect.cpf) {
        contextText += `- CPF: ${context.currentProspect.cpf}\n`
      }
      if (context.currentProspect.cnpj) {
        contextText += `- CNPJ: ${context.currentProspect.cnpj}\n`
      }
      contextText += `- Score: ${context.currentProspect.score}\n`
      contextText += `- Probabilidade de Conversão: ${Math.round(context.currentProspect.conversion_probability)}%\n`
      contextText += `- LTV Estimado: R$ ${context.currentProspect.ltv_estimate.toLocaleString('pt-BR')}\n`
      contextText += `- Risco de Churn: ${context.currentProspect.churn_risk}%\n`
      contextText += `- Status: ${this.getStatusLabel(context.currentProspect.qualification_status)}\n`
      contextText += `- Prioridade: ${context.currentProspect.priority}/10\n`
      if (context.currentProspect.dataSourcesCount > 0) {
        contextText += `- Fontes de dados utilizadas: ${context.currentProspect.dataSourcesCount}\n`
      }
      contextText += '\n'
    }

    contextText += 'O usuário pode fazer perguntas sobre:\n'
    contextText += '- Dados específicos de prospects\n'
    contextText += '- Métricas de scoring (LTV, churn, conversão)\n'
    contextText += '- Estatísticas e análises\n'
    contextText += '- Fontes de dados e enriquecimentos\n'
    contextText += '- Recomendações e qualificações\n'

    return contextText
  }

  /**
   * Obter label do status
   * @param {string} status - Status do prospect
   * @returns {string} Label formatado
   */
  static getStatusLabel(status) {
    const labels = {
      pending: 'Pendente',
      qualified: 'Qualificado',
      rejected: 'Rejeitado',
      converted: 'Convertido'
    }
    return labels[status] || status
  }
}

