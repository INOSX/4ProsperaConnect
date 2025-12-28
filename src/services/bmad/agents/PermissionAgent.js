/**
 * PermissionAgent - Valida permissões do usuário
 */
import { ClientService } from '../../../services/clientService'
import { canManageEmployees, canAccessProspecting, canAccessCampaigns } from '../../../utils/permissions'

export default class PermissionAgent {
  async checkPermission(intent, user, params) {
    console.log('[BMAD:PermissionAgent] 🔐 Checking permission for intent:', intent, 'user:', user?.id)
    
    if (!user) {
      console.log('[BMAD:PermissionAgent] ❌ Permission denied: User not authenticated')
      return {
        allowed: false,
        reason: 'Usuário não autenticado'
      }
    }

    try {
      // Buscar role do usuário
      console.log('[BMAD:PermissionAgent] 🔍 Fetching user role...')
      const clientResult = await ClientService.getClientByUserId(user.id)
      if (!clientResult.success || !clientResult.client) {
        console.log('[BMAD:PermissionAgent] ❌ Permission denied: Client not found')
        return {
          allowed: false,
          reason: 'Cliente não encontrado'
        }
      }

      const userRole = clientResult.client.role || 'user'
      const isCompanyAdmin = clientResult.client.is_company_admin || false
      console.log('[BMAD:PermissionAgent] 👤 User role:', userRole, 'isCompanyAdmin:', isCompanyAdmin)

      // Verificar permissões por intenção
      const intentPermissions = {
        // Apenas Admin do Banco
        'create_company': userRole === 'admin',
        'delete_company': userRole === 'admin',
        'list_prospects': canAccessProspecting(userRole),
        'enrich_prospect': canAccessProspecting(userRole),
        'create_campaign': canAccessCampaigns(userRole),
        'activate_campaign': canAccessCampaigns(userRole),
        
        // Admin do Banco ou Admin do Cliente
        'create_employee': canManageEmployees(userRole, isCompanyAdmin),
        'update_employee': canManageEmployees(userRole, isCompanyAdmin),
        'delete_employee': canManageEmployees(userRole, isCompanyAdmin),
        
        // Todos autenticados
        'list_companies': true,
        'list_employees': true,
        'query_database': true,
        'search_data': true
      }

      const allowed = intentPermissions[intent] !== false
      console.log('[BMAD:PermissionAgent]', allowed ? '✅ Permission granted' : '❌ Permission denied', 'for intent:', intent)

      return {
        allowed,
        reason: allowed ? undefined : 'Você não tem permissão para executar esta ação',
        userRole,
        isCompanyAdmin
      }
    } catch (error) {
      console.error('[BMAD:PermissionAgent] ❌ Error checking permission:', error)
      return {
        allowed: false,
        reason: 'Erro ao verificar permissões'
      }
    }
  }
}

