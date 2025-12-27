/**
 * BMAD Orchestrator - Orquestrador principal do sistema BMAD
 * Coordena todos os agentes e gerencia o fluxo de processamento de comandos
 */
import SupervisorAgent from './agents/SupervisorAgent.js'
import VoiceIntentAgent from './agents/VoiceIntentAgent.js'
import PermissionAgent from './agents/PermissionAgent.js'
import ContextAgent from './agents/ContextAgent.js'
import DatabaseQueryAgent from './agents/DatabaseQueryAgent.js'
import CompanyActionAgent from './agents/CompanyActionAgent.js'
import EmployeeActionAgent from './agents/EmployeeActionAgent.js'
import CampaignActionAgent from './agents/CampaignActionAgent.js'
import ProspectingActionAgent from './agents/ProspectingActionAgent.js'
import BenefitActionAgent from './agents/BenefitActionAgent.js'
import ProductActionAgent from './agents/ProductActionAgent.js'
import IntegrationActionAgent from './agents/IntegrationActionAgent.js'
import DataVisualizationAgent from './agents/DataVisualizationAgent.js'
import SuggestionAgent from './agents/SuggestionAgent.js'
import MemoryResourceAgent from './agents/MemoryResourceAgent.js'
import FeedbackAgent from './agents/FeedbackAgent.js'

export class BMADOrchestrator {
  constructor() {
    // Inicializar todos os agentes
    this.supervisor = new SupervisorAgent()
    this.voiceIntent = new VoiceIntentAgent()
    this.permission = new PermissionAgent()
    this.context = new ContextAgent()
    this.databaseQuery = new DatabaseQueryAgent()
    this.company = new CompanyActionAgent()
    this.employee = new EmployeeActionAgent()
    this.campaign = new CampaignActionAgent()
    this.prospecting = new ProspectingActionAgent()
    this.benefit = new BenefitActionAgent()
    this.product = new ProductActionAgent()
    this.integration = new IntegrationActionAgent()
    this.visualization = new DataVisualizationAgent()
    this.suggestion = new SuggestionAgent()
    this.memory = new MemoryResourceAgent()
    this.feedback = new FeedbackAgent()
  }

  /**
   * Processa um comando de voz/texto através de todos os agentes
   * @param {string} text - Texto transcrito do comando
   * @param {Object} user - Usuário atual
   * @param {Object} context - Contexto adicional (opcional)
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processCommand(text, user, context = {}) {
    try {
      // 1. Validação inicial pelo Supervisor
      const initialValidation = await this.supervisor.validateInitial(text)
      if (!initialValidation.approved) {
        return {
          success: false,
          error: initialValidation.reason || 'Comando inválido',
          corrections: initialValidation.corrections
        }
      }

      // 2. Classificação de intenção
      const intentResult = await this.voiceIntent.classifyIntent(text, user)
      const intentValidation = await this.supervisor.validateIntent(intentResult)
      if (!intentValidation.approved) {
        return {
          success: false,
          error: 'Não foi possível entender sua intenção. Tente reformular.',
          corrections: intentValidation.corrections
        }
      }

      // 3. Validação de permissões
      const permissionResult = await this.permission.checkPermission(
        intentResult.intent,
        user,
        intentResult.params
      )
      const permissionValidation = await this.supervisor.validatePermission(permissionResult)
      if (!permissionValidation.approved || !permissionResult.allowed) {
        return {
          success: false,
          error: permissionResult.reason || 'Você não tem permissão para executar esta ação',
          corrections: permissionValidation.corrections
        }
      }

      // 4. Coleta de contexto
      const contextResult = await this.context.collectContext(user, context)
      const contextValidation = await this.supervisor.validateContext(contextResult)
      if (!contextValidation.approved) {
        console.warn('Context validation failed, continuing with available context')
      }

      // 5. Otimização de memória antes de processar
      await this.memory.optimizeBeforeProcessing()

      // 6. Executar ação baseada na intenção
      let actionResult = null
      const { intent, params } = intentResult

      if (intent === 'query_database' || intent === 'search_data') {
        // Busca no banco de dados
        actionResult = await this.databaseQuery.query(text, user, contextResult, params)
        const queryValidation = await this.supervisor.validateQueryResult(actionResult)
        if (!queryValidation.approved) {
          return {
            success: false,
            error: 'Erro ao executar consulta',
            corrections: queryValidation.corrections
          }
        }
      } else {
        // Ações específicas por domínio
        actionResult = await this.executeDomainAction(intent, params, user, contextResult)
        const actionValidation = await this.supervisor.validateActionResult(actionResult)
        if (!actionValidation.approved) {
          return {
            success: false,
            error: actionResult.error || 'Erro ao executar ação',
            corrections: actionValidation.corrections
          }
        }
      }

      // 7. Gerar visualizações
      const visualizations = await this.visualization.generateVisualizations(
        actionResult,
        intent
      )
      const vizValidation = await this.supervisor.validateVisualizations(visualizations)
      if (!vizValidation.approved) {
        console.warn('Visualization validation failed, using basic format')
      }

      // 8. Gerar feedback/resposta
      const feedback = await this.feedback.generateFeedback(
        text,
        actionResult,
        visualizations,
        intentResult
      )

      // 9. Otimização de memória após processamento
      await this.memory.optimizeAfterProcessing(feedback)

      // 10. Validação final
      const finalValidation = await this.supervisor.validateFinal({
        originalText: text,
        intent: intentResult,
        actionResult,
        feedback,
        visualizations
      })

      if (!finalValidation.approved) {
        // Tentar corrigir
        const corrected = await this.supervisor.attemptCorrection(finalValidation)
        if (corrected.success) {
          return corrected.result
        }
        return {
          success: false,
          error: 'Erro ao processar comando',
          qualityScore: finalValidation.qualityScore
        }
      }

      // 11. Gerar sugestões
      const suggestions = await this.suggestion.generateSuggestions(
        text,
        intentResult,
        actionResult,
        await this.memory.getConversationHistory()
      )

      // 12. Atualizar histórico
      await this.memory.updateHistory({
        command: text,
        intent: intentResult,
        result: actionResult,
        feedback,
        timestamp: new Date()
      })

      return {
        success: true,
        response: feedback.text,
        visualizations: visualizations,
        suggestions: suggestions.suggestions,
        qualityScore: finalValidation.qualityScore,
        metadata: {
          intent: intent,
          vectorSearchUsed: actionResult?.vectorSearchUsed || false
        }
      }
    } catch (error) {
      console.error('Error in BMADOrchestrator:', error)
      return {
        success: false,
        error: error.message || 'Erro ao processar comando',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }
  }

  /**
   * Executa ação específica de um domínio
   */
  async executeDomainAction(intent, params, user, context) {
    const intentMap = {
      'create_company': () => this.company.create(params, user, context),
      'list_companies': () => this.company.list(params, user, context),
      'update_company': () => this.company.update(params, user, context),
      'delete_company': () => this.company.delete(params, user, context),
      'get_company_stats': () => this.company.getStats(params, user, context),
      
      'create_employee': () => this.employee.create(params, user, context),
      'list_employees': () => this.employee.list(params, user, context),
      'update_employee': () => this.employee.update(params, user, context),
      'delete_employee': () => this.employee.delete(params, user, context),
      
      'create_campaign': () => this.campaign.create(params, user, context),
      'list_campaigns': () => this.campaign.list(params, user, context),
      'update_campaign': () => this.campaign.update(params, user, context),
      'delete_campaign': () => this.campaign.delete(params, user, context),
      'activate_campaign': () => this.campaign.activate(params, user, context),
      'pause_campaign': () => this.campaign.pause(params, user, context),
      
      'list_prospects': () => this.prospecting.list(params, user, context),
      'enrich_prospect': () => this.prospecting.enrich(params, user, context),
      'qualify_prospect': () => this.prospecting.qualify(params, user, context),
      'calculate_score': () => this.prospecting.calculateScore(params, user, context),
      'recommend_products': () => this.prospecting.recommendProducts(params, user, context),
      
      'create_benefit': () => this.benefit.create(params, user, context),
      'list_benefits': () => this.benefit.list(params, user, context),
      'update_benefit': () => this.benefit.update(params, user, context),
      'delete_benefit': () => this.benefit.delete(params, user, context),
      
      'list_products': () => this.product.list(params, user, context),
      'recommend_product': () => this.product.recommend(params, user, context),
      
      'sync_integration': () => this.integration.sync(params, user, context),
      'test_connection': () => this.integration.testConnection(params, user, context)
    }

    const action = intentMap[intent]
    if (!action) {
      throw new Error(`Intenção não reconhecida: ${intent}`)
    }

    return await action()
  }
}

export default BMADOrchestrator

