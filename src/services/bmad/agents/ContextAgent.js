/**
 * ContextAgent - Coleta contexto da página e dados relevantes
 */
import { ClientService } from '../../../services/clientService'

export default class ContextAgent {
  async collectContext(user, additionalContext = {}) {
    console.log('[BMAD:ContextAgent] 📦 ========== COLETANDO CONTEXTO ==========')
    console.log('[BMAD:ContextAgent] 📝 Input:', {
      userId: user?.id,
      userEmail: user?.email,
      hasAdditionalContext: !!additionalContext,
      additionalContextKeys: Object.keys(additionalContext || {})
    })
    
    const context = {
      userContext: {},
      pageContext: additionalContext.pageContext || {},
      dataContext: {}
    }

    try {
      // Coletar contexto do usuário
      if (user) {
        console.log('[BMAD:ContextAgent] 🔍 Buscando contexto do usuário...')
        const clientResult = await ClientService.getClientByUserId(user.id)
        console.log('[BMAD:ContextAgent] 📥 Resultado do ClientService:', {
          success: clientResult.success,
          hasClient: !!clientResult.client,
          clientRole: clientResult.client?.role
        })
        
        if (clientResult.success && clientResult.client) {
          context.userContext = {
            userId: user.id,
            email: user.email,
            role: clientResult.client.role,
            companyId: clientResult.client.company_id,
            userType: clientResult.client.user_type
          }
          console.log('[BMAD:ContextAgent] ✅ Contexto do usuário coletado:', JSON.stringify(context.userContext, null, 2))
        } else {
          console.log('[BMAD:ContextAgent] ⚠️ Contexto do usuário não encontrado')
        }
      } else {
        console.log('[BMAD:ContextAgent] ⚠️ Usuário não fornecido')
      }

      // Coletar contexto da página atual
      if (typeof window !== 'undefined') {
        context.pageContext = {
          pathname: window.location.pathname,
          search: window.location.search,
          ...context.pageContext
        }
        console.log('[BMAD:ContextAgent] ✅ Contexto da página coletado:', JSON.stringify(context.pageContext, null, 2))
      } else {
        console.log('[BMAD:ContextAgent] ⚠️ Window não disponível (ambiente server-side)')
      }

      console.log('[BMAD:ContextAgent] ✅ ========== COLETA DE CONTEXTO CONCLUÍDA ==========')
      console.log('[BMAD:ContextAgent] 📤 Contexto completo:', JSON.stringify(context, null, 2))
      return context
    } catch (error) {
      console.error('[BMAD:ContextAgent] ❌ ========== ERRO NA COLETA DE CONTEXTO ==========')
      console.error('[BMAD:ContextAgent] ❌ Erro:', error)
      console.error('[BMAD:ContextAgent] ❌ Stack:', error.stack)
      console.log('[BMAD:ContextAgent] 📤 Retornando contexto parcial:', JSON.stringify(context, null, 2))
      return context
    }
  }
}

