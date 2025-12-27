/**
 * PermissionAgent - Valida permissões do usuário
 */
import { ClientService } from '../../services/clientService'
import { canManageEmployees, canAccessProspecting, canAccessCampaigns } from '../../utils/permissions'

export default class PermissionAgent {
  async checkPermission(intent, user, params) {
    if (!user) {
      return {
        allowed: false,
        reason: 'Usuário não autenticado'
      }
    }

    try {
      // Buscar role do usuário
      const clientResult = await ClientService.getClientByUserId(user.id)
      if (!clientResult.success || !clientResult.client) {
        return {
          allowed: false,
          reason: 'Cliente não encontrado'
        }
      }

      const userRole = clientResult.client.role || 'user'
      const isCompanyAdmin = clientResult.client.is_company_admin || false

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

      return {
        allowed,
        reason: allowed ? undefined : 'Você não tem permissão para executar esta ação',
        userRole,
        isCompanyAdmin
      }
    } catch (error) {
      console.error('Error checking permission:', error)
      return {
        allowed: false,
        reason: 'Erro ao verificar permissões'
      }
    }
  }
}

