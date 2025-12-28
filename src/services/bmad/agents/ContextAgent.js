/**
 * ContextAgent - Coleta contexto da página e dados relevantes
 */
import { ClientService } from '../../../services/clientService'

export default class ContextAgent {
  async collectContext(user, additionalContext = {}) {
    console.log('[BMAD:ContextAgent] 📦 Collecting context for user:', user?.id)
    const context = {
      userContext: {},
      pageContext: additionalContext.pageContext || {},
      dataContext: {}
    }

    try {
      // Coletar contexto do usuário
      if (user) {
        console.log('[BMAD:ContextAgent] 🔍 Fetching user context...')
        const clientResult = await ClientService.getClientByUserId(user.id)
        if (clientResult.success && clientResult.client) {
          context.userContext = {
            userId: user.id,
            email: user.email,
            role: clientResult.client.role,
            companyId: clientResult.client.company_id,
            userType: clientResult.client.user_type
          }
          console.log('[BMAD:ContextAgent] ✅ User context collected:', { role: context.userContext.role, companyId: context.userContext.companyId })
        } else {
          console.log('[BMAD:ContextAgent] ⚠️ User context not found')
        }
      }

      // Coletar contexto da página atual
      if (typeof window !== 'undefined') {
        context.pageContext = {
          pathname: window.location.pathname,
          search: window.location.search,
          ...context.pageContext
        }
        console.log('[BMAD:ContextAgent] ✅ Page context collected:', context.pageContext.pathname)
      }

      console.log('[BMAD:ContextAgent] ✅ Context collection complete')
      return context
    } catch (error) {
      console.error('[BMAD:ContextAgent] ❌ Error collecting context:', error)
      return context
    }
  }
}

