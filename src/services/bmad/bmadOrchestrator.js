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
    const startTime = Date.now()
    console.log('[BMAD:Orchestrator] 🚀 Starting command processing:', text?.substring(0, 100))
    console.log('[BMAD:Orchestrator] 👤 User:', user?.id, 'Email:', user?.email)
    
    try {
      // 1. Validação inicial pelo Supervisor
      console.log('[BMAD:Orchestrator] 📋 Step 1/12: Initial validation')
      const initialValidation = await this.supervisor.validateInitial(text)
      if (!initialValidation.approved) {
        console.log('[BMAD:Orchestrator] ❌ Command rejected at initial validation:', initialValidation.reason)
        return {
          success: false,
          error: initialValidation.reason || 'Comando inválido',
          corrections: initialValidation.corrections
        }
      }

      // 2. Classificação de intenção
      console.log('[BMAD:Orchestrator] 📋 Step 2/12: Intent classification')
      const intentResult = await this.voiceIntent.classifyIntent(text, user)
      const intentValidation = await this.supervisor.validateIntent(intentResult)
      if (!intentValidation.approved) {
        console.log('[BMAD:Orchestrator] ❌ Command rejected at intent validation:', intentValidation.reason)
        return {
          success: false,
          error: 'Não foi possível entender sua intenção. Tente reformular.',
          corrections: intentValidation.corrections
        }
      }

      // 3. Validação de permissões
      console.log('[BMAD:Orchestrator] 📋 Step 3/12: Permission check')
      const permissionResult = await this.permission.checkPermission(
        intentResult.intent,
        user,
        intentResult.params
      )
      const permissionValidation = await this.supervisor.validatePermission(permissionResult)
      if (!permissionValidation.approved || !permissionResult.allowed) {
        console.log('[BMAD:Orchestrator] ❌ Command rejected: Permission denied')
        return {
          success: false,
          error: permissionResult.reason || 'Você não tem permissão para executar esta ação',
          corrections: permissionValidation.corrections
        }
      }

      // 4. Coleta de contexto
      console.log('[BMAD:Orchestrator] 📋 Step 4/12: Context collection')
      const contextResult = await this.context.collectContext(user, context)
      const contextValidation = await this.supervisor.validateContext(contextResult)
      if (!contextValidation.approved) {
        console.warn('[BMAD:Orchestrator] ⚠️ Context validation failed, continuing with available context')
      }

      // 5. Otimização de memória antes de processar
      console.log('[BMAD:Orchestrator] 📋 Step 5/12: Memory optimization (before)')
      await this.memory.optimizeBeforeProcessing()

      // 6. Executar ação baseada na intenção
      console.log('[BMAD:Orchestrator] 📋 Step 6/12: Executing action for intent:', intentResult.intent)
      let actionResult = null
      const { intent, params } = intentResult

      if (intent === 'query_database' || intent === 'search_data' || intent === 'get_all_data' || intent === 'know_all_data') {
        // Busca no banco de dados usando busca semântica
        // Permite que o especialista "conheça" todos os registros
        console.log('[BMADOrchestrator] Processing database query:', { intent, text, params })
        try {
          actionResult = await this.databaseQuery.executeQuery(intent, { ...params, query: text }, user, contextResult)
          console.log('[BMADOrchestrator] Database query result:', { success: actionResult?.success, hasResults: !!actionResult?.results, error: actionResult?.error })
        } catch (queryError) {
          console.error('[BMADOrchestrator] Error in database query:', queryError)
          actionResult = {
            success: false,
            error: queryError.message || 'Erro ao executar consulta',
            results: []
          }
        }
        
        const queryValidation = await this.supervisor.validateQueryResult(actionResult)
        console.log('[BMADOrchestrator] Query validation:', { approved: queryValidation.approved, reason: queryValidation.reason })
        if (!queryValidation.approved) {
          return {
            success: false,
            error: queryValidation.reason || 'Erro ao executar consulta',
            corrections: queryValidation.corrections,
            details: actionResult?.error
          }
        }
      } else if (intent.startsWith('query_') || intent.startsWith('search_')) {
        // Consultas genéricas também usam busca semântica
        console.log('[BMADOrchestrator] Processing generic query:', { intent, text })
        try {
          actionResult = await this.databaseQuery.executeQuery(intent, { ...params, query: text }, user, contextResult)
          console.log('[BMADOrchestrator] Generic query result:', { success: actionResult?.success, hasResults: !!actionResult?.results })
        } catch (queryError) {
          console.error('[BMADOrchestrator] Error in generic query:', queryError)
          actionResult = {
            success: false,
            error: queryError.message || 'Erro ao executar consulta',
            results: []
          }
        }
        const queryValidation = await this.supervisor.validateQueryResult(actionResult)
        if (!queryValidation.approved) {
          console.warn('[BMADOrchestrator] Query validation failed, continuing with results:', queryValidation.reason)
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
      console.log('[BMAD:Orchestrator] 📋 Step 7/12: Generating visualizations')
      let visualizations = []
      try {
        visualizations = await this.visualization.generateVisualizations(
          actionResult,
          intent
        )
        console.log('[BMAD:Orchestrator] ✅ Visualizations generated:', { count: visualizations?.length || 0 })
      } catch (vizError) {
        console.error('[BMAD:Orchestrator] ❌ Error generating visualizations:', vizError)
        visualizations = []
      }
      
      const vizValidation = await this.supervisor.validateVisualizations(visualizations)
      if (!vizValidation.approved) {
        console.warn('[BMAD:Orchestrator] ⚠️ Visualization validation failed, using basic format')
      }

      // 8. Gerar feedback/resposta
      console.log('[BMAD:Orchestrator] 📋 Step 8/12: Generating feedback')
      let feedback = null
      try {
        feedback = await this.feedback.generateFeedback(
          text,
          actionResult,
          visualizations,
          intentResult
        )
        console.log('[BMAD:Orchestrator] ✅ Feedback generated:', { hasText: !!feedback?.text, text: feedback?.text?.substring(0, 100) })
      } catch (feedbackError) {
        console.error('[BMAD:Orchestrator] ❌ Error generating feedback:', feedbackError)
        // Criar feedback básico em caso de erro
        feedback = {
          text: actionResult.summary || actionResult.error || 'Comando processado',
          voiceConfig: { speed: 1.0, pitch: 1.0 },
          visualizations: []
        }
      }

      // 9. Otimização de memória após processamento
      console.log('[BMAD:Orchestrator] 📋 Step 9/12: Memory optimization (after)')
      try {
        await this.memory.optimizeAfterProcessing(feedback)
      } catch (memoryError) {
        console.warn('[BMAD:Orchestrator] ⚠️ Error optimizing memory:', memoryError)
      }

      // 10. Validação final
      console.log('[BMAD:Orchestrator] 📋 Step 10/12: Final validation')
      const finalValidation = await this.supervisor.validateFinal({
        originalText: text,
        intent: intentResult,
        actionResult,
        feedback,
        visualizations
      })
      console.log('[BMAD:Orchestrator]', finalValidation.approved ? '✅ Final validation passed' : '⚠️ Final validation failed', { 
        qualityScore: finalValidation.qualityScore,
        issues: finalValidation.issues 
      })

      if (!finalValidation.approved) {
        console.warn('[BMAD:Orchestrator] ⚠️ Final validation failed, attempting correction...')
        // Tentar corrigir
        const corrected = await this.supervisor.attemptCorrection(finalValidation)
        if (corrected.success) {
          console.log('[BMAD:Orchestrator] ✅ Correction successful')
          const elapsed = Date.now() - startTime
          console.log('[BMAD:Orchestrator] ⏱️ Total processing time:', elapsed + 'ms')
          return corrected.result
        }
        console.error('[BMAD:Orchestrator] ❌ Correction failed, returning error')
        // Mesmo se a validação falhar, retornar resultado se tiver feedback
        if (feedback && feedback.text) {
          console.warn('[BMAD:Orchestrator] ⚠️ Returning result despite validation failure (has feedback)')
          const elapsed = Date.now() - startTime
          console.log('[BMAD:Orchestrator] ⏱️ Total processing time:', elapsed + 'ms')
          return {
            success: true,
            response: feedback.text,
            visualizations: visualizations,
            qualityScore: finalValidation.qualityScore,
            metadata: {
              intent: intent,
              vectorSearchUsed: actionResult?.vectorSearchUsed || false,
              validationWarning: true
            }
          }
        }
        const elapsed = Date.now() - startTime
        console.log('[BMAD:Orchestrator] ⏱️ Total processing time:', elapsed + 'ms')
        return {
          success: false,
          error: 'Erro ao processar comando',
          qualityScore: finalValidation.qualityScore,
          details: finalValidation.issues
        }
      }

      // 11. Gerar sugestões
      console.log('[BMAD:Orchestrator] 📋 Step 11/12: Generating suggestions')
      const suggestions = await this.suggestion.generateSuggestions(
        text,
        intentResult,
        actionResult,
        await this.memory.getConversationHistory()
      )
      console.log('[BMAD:Orchestrator] ✅ Suggestions generated:', suggestions.suggestions.length)

      // 12. Atualizar histórico
      console.log('[BMAD:Orchestrator] 📋 Step 12/12: Updating conversation history')
      await this.memory.updateHistory({
        command: text,
        intent: intentResult,
        result: actionResult,
        feedback,
        timestamp: new Date()
      })

      const elapsed = Date.now() - startTime
      console.log('[BMAD:Orchestrator] ✅ Command processing finished successfully in', elapsed + 'ms')
      console.log('[BMAD:Orchestrator] 📊 Summary:', {
        intent: intent,
        qualityScore: finalValidation.qualityScore,
        visualizations: visualizations.length,
        suggestions: suggestions.suggestions.length,
        vectorSearchUsed: actionResult?.vectorSearchUsed || false
      })

      return {
        success: true,
        response: feedback.text,
        visualizations: visualizations,
        suggestions: suggestions.suggestions,
        qualityScore: finalValidation.qualityScore,
        metadata: {
          intent: intent,
          vectorSearchUsed: actionResult?.vectorSearchUsed || false,
          processingTime: elapsed
        }
      }
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[BMAD:Orchestrator] ❌ Error in command processing after', elapsed + 'ms:', error)
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

