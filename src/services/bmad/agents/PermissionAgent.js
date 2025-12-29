/**
 * PermissionAgent - Valida permissões do usuário
 */
import { ClientService } from '../../../services/clientService'
import { canManageEmployees, canAccessProspecting, canAccessCampaigns } from '../../../utils/permissions'

export default class PermissionAgent {
  async checkPermission(intent, user, params) {
    console.log('[ORDX:PermissionAgent] 🔐 ========== VERIFICANDO PERMISSÕES ==========')
    console.log('[ORDX:PermissionAgent] 📝 Input:', {
      intent: intent,
      userId: user?.id,
      userEmail: user?.email,
      hasParams: !!params,
      paramsKeys: params ? Object.keys(params) : []
    })
    
    if (!user) {
      console.log('[ORDX:PermissionAgent] ❌ Permissão negada: Usuário não autenticado')
      const result = {
        allowed: false,
        reason: 'Usuário não autenticado'
      }
      console.log('[ORDX:PermissionAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      return result
    }

    try {
      // Buscar role do usuário
      console.log('[ORDX:PermissionAgent] 🔍 Buscando role do usuário...')
      const clientResult = await ClientService.getClientByUserId(user.id)
      console.log('[ORDX:PermissionAgent] 📥 Resultado do ClientService:', {
        success: clientResult.success,
        hasClient: !!clientResult.client,
        clientRole: clientResult.client?.role,
        isCompanyAdmin: clientResult.client?.is_company_admin
      })
      
      if (!clientResult.success || !clientResult.client) {
        console.log('[ORDX:PermissionAgent] ❌ Permissão negada: Cliente não encontrado')
        const result = {
          allowed: false,
          reason: 'Cliente não encontrado'
        }
        console.log('[ORDX:PermissionAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
        return result
      }

      const userRole = clientResult.client.role || 'user'
      const isCompanyAdmin = clientResult.client.is_company_admin || false
      console.log('[ORDX:PermissionAgent] 👤 Role do usuário:', {
        role: userRole,
        isCompanyAdmin: isCompanyAdmin,
        userId: user.id
      })

      // Verificar permissões por intenção
      console.log('[ORDX:PermissionAgent] 🔍 Verificando permissões para intent:', intent)
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
      console.log('[ORDX:PermissionAgent] 📊 Verificação de permissão:', {
        intent: intent,
        allowed: allowed,
        permissionValue: intentPermissions[intent],
        userRole: userRole,
        isCompanyAdmin: isCompanyAdmin
      })
      console.log('[ORDX:PermissionAgent]', allowed ? '✅ Permissão concedida' : '❌ Permissão negada', 'para intent:', intent)

      const result = {
        allowed,
        reason: allowed ? undefined : 'Você não tem permissão para executar esta ação',
        userRole,
        isCompanyAdmin
      }
      
      console.log('[ORDX:PermissionAgent] ✅ ========== VERIFICAÇÃO CONCLUÍDA ==========')
      console.log('[ORDX:PermissionAgent] 📤 Resultado:', JSON.stringify(result, null, 2))
      
      return result
    } catch (error) {
      console.error('[ORDX:PermissionAgent] ❌ ========== ERRO NA VERIFICAÇÃO ==========')
      console.error('[ORDX:PermissionAgent] ❌ Erro:', error)
      console.error('[ORDX:PermissionAgent] ❌ Stack:', error.stack)
      const result = {
        allowed: false,
        reason: 'Erro ao verificar permissões'
      }
      console.log('[ORDX:PermissionAgent] 📤 Resultado (erro):', JSON.stringify(result, null, 2))
      return result
    }
  }
}

