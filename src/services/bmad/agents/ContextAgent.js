/**
 * ContextAgent - Coleta contexto da página e dados relevantes
 */
import { ClientService } from '../../services/clientService'

export default class ContextAgent {
  async collectContext(user, additionalContext = {}) {
    const context = {
      userContext: {},
      pageContext: additionalContext.pageContext || {},
      dataContext: {}
    }

    try {
      // Coletar contexto do usuário
      if (user) {
        const clientResult = await ClientService.getClientByUserId(user.id)
        if (clientResult.success && clientResult.client) {
          context.userContext = {
            userId: user.id,
            email: user.email,
            role: clientResult.client.role,
            companyId: clientResult.client.company_id,
            userType: clientResult.client.user_type
          }
        }
      }

      // Coletar contexto da página atual
      if (typeof window !== 'undefined') {
        context.pageContext = {
          pathname: window.location.pathname,
          search: window.location.search,
          ...context.pageContext
        }
      }

      return context
    } catch (error) {
      console.error('Error collecting context:', error)
      return context
    }
  }
}

