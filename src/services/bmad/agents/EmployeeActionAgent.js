/**
 * EmployeeActionAgent - Ações relacionadas a colaboradores
 */
import { EmployeeService } from '../../../services/employeeService'

export default class EmployeeActionAgent {
  async create(params, user, context) {
    console.log('[AGX:EmployeeActionAgent] 👥 ========== CRIANDO COLABORADOR ==========')
    console.log('[AGX:EmployeeActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      companyId: params.companyId || context.userContext?.companyId
    })
    
    const startTime = Date.now()
    try {
      const employeeData = {
        name: params.name,
        email: params.email,
        company_id: params.companyId || context.userContext?.companyId
      }
      console.log('[AGX:EmployeeActionAgent] 📤 Dados do colaborador a criar:', JSON.stringify(employeeData, null, 2))
      
      const result = await EmployeeService.createEmployee(employeeData)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:EmployeeActionAgent] 📥 Resposta do EmployeeService:', {
        success: result.success,
        hasEmployee: !!result.employee,
        employeeId: result.employee?.id,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.employee,
        error: result.error
      }
      
      console.log('[AGX:EmployeeActionAgent] ✅ ========== COLABORADOR CRIADO ==========')
      console.log('[AGX:EmployeeActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:EmployeeActionAgent] ❌ ========== ERRO AO CRIAR COLABORADOR ==========')
      console.error('[AGX:EmployeeActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:EmployeeActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:EmployeeActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async list(params, user, context) {
    console.log('[AGX:EmployeeActionAgent] 👥 ========== LISTANDO COLABORADORES ==========')
    console.log('[AGX:EmployeeActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      companyId: params.companyId || context.userContext?.companyId
    })
    
    const startTime = Date.now()
    try {
      const companyId = params.companyId || context.userContext?.companyId
      console.log('[AGX:EmployeeActionAgent] 🔍 Company ID determinado:', companyId)
      
      if (!companyId) {
        console.log('[AGX:EmployeeActionAgent] ❌ ID da empresa não fornecido')
        const errorResult = {
          success: false,
          error: 'ID da empresa não fornecido'
        }
        console.log('[AGX:EmployeeActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
        return errorResult
      }

      console.log('[AGX:EmployeeActionAgent] 🔍 Buscando colaboradores...')
      const result = await EmployeeService.getCompanyEmployees(companyId)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:EmployeeActionAgent] 📥 Resposta do EmployeeService:', {
        success: result.success,
        employeesCount: result.employees?.length || 0,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      if (result.employees && result.employees.length > 0) {
        console.log('[AGX:EmployeeActionAgent] 📊 Primeiros 3 colaboradores:', result.employees.slice(0, 3).map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          isActive: e.is_active
        })))
      }
      
      const finalResult = {
        success: result.success,
        data: result.employees || [],
        error: result.error
      }
      
      console.log('[AGX:EmployeeActionAgent] ✅ ========== COLABORADORES LISTADOS ==========')
      console.log('[AGX:EmployeeActionAgent] 📤 Resultado:', {
        success: finalResult.success,
        count: finalResult.data.length,
        hasError: !!finalResult.error
      })
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:EmployeeActionAgent] ❌ ========== ERRO AO LISTAR COLABORADORES ==========')
      console.error('[AGX:EmployeeActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:EmployeeActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:EmployeeActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async update(params, user, context) {
    console.log('[AGX:EmployeeActionAgent] 👥 ========== ATUALIZANDO COLABORADOR ==========')
    console.log('[AGX:EmployeeActionAgent] 📝 Input:', {
      employeeId: params.id,
      params: params,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      const updateData = {}
      if (params.name) updateData.name = params.name
      if (params.email) updateData.email = params.email
      
      console.log('[AGX:EmployeeActionAgent] 📤 Dados a atualizar:', JSON.stringify(updateData, null, 2))
      
      const result = await EmployeeService.updateEmployee(params.id, updateData)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:EmployeeActionAgent] 📥 Resposta do EmployeeService:', {
        success: result.success,
        hasEmployee: !!result.employee,
        employeeId: result.employee?.id,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.employee,
        error: result.error
      }
      
      console.log('[AGX:EmployeeActionAgent] ✅ ========== COLABORADOR ATUALIZADO ==========')
      console.log('[AGX:EmployeeActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:EmployeeActionAgent] ❌ ========== ERRO AO ATUALIZAR COLABORADOR ==========')
      console.error('[AGX:EmployeeActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:EmployeeActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:EmployeeActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async delete(params, user, context) {
    console.log('[AGX:EmployeeActionAgent] 👥 ========== DELETANDO COLABORADOR ==========')
    console.log('[AGX:EmployeeActionAgent] 📝 Input:', {
      employeeId: params.id,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      console.log('[AGX:EmployeeActionAgent] 🗑️ Deletando colaborador ID:', params.id)
      
      const result = await EmployeeService.deleteEmployee(params.id)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:EmployeeActionAgent] 📥 Resposta do EmployeeService:', {
        success: result.success,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        error: result.error
      }
      
      console.log('[AGX:EmployeeActionAgent] ✅ ========== COLABORADOR DELETADO ==========')
      console.log('[AGX:EmployeeActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:EmployeeActionAgent] ❌ ========== ERRO AO DELETAR COLABORADOR ==========')
      console.error('[AGX:EmployeeActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:EmployeeActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:EmployeeActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }
}

