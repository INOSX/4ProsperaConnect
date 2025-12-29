/**
 * CompanyActionAgent - Ações relacionadas a empresas
 */
import { CompanyService } from '../../../services/companyService'

export default class CompanyActionAgent {
  async create(params, user, context) {
    console.log('[AGX:CompanyActionAgent] 🏢 ========== CRIANDO EMPRESA ==========')
    console.log('[AGX:CompanyActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      contextKeys: Object.keys(context || {})
    })
    
    const startTime = Date.now()
    try {
      const companyData = {
        cnpj: params.cnpj,
        company_name: params.name,
        owner_user_id: user.id
      }
      console.log('[AGX:CompanyActionAgent] 📤 Dados da empresa a criar:', JSON.stringify(companyData, null, 2))
      
      const result = await CompanyService.createCompany(companyData)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CompanyActionAgent] 📥 Resposta do CompanyService:', {
        success: result.success,
        hasCompany: !!result.company,
        companyId: result.company?.id,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.company,
        error: result.error
      }
      
      console.log('[AGX:CompanyActionAgent] ✅ ========== EMPRESA CRIADA ==========')
      console.log('[AGX:CompanyActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CompanyActionAgent] ❌ ========== ERRO AO CRIAR EMPRESA ==========')
      console.error('[AGX:CompanyActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CompanyActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CompanyActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async list(params, user, context) {
    console.log('[AGX:CompanyActionAgent] 🏢 ========== LISTANDO EMPRESAS ==========')
    console.log('[AGX:CompanyActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      userRole: context.userContext?.role,
      isAdmin: context.userContext?.role === 'admin'
    })
    
    const startTime = Date.now()
    try {
      const isAdmin = context.userContext?.role === 'admin'
      console.log('[AGX:CompanyActionAgent] 🔍 Buscando empresas (isAdmin:', isAdmin, ')...')
      
      const result = await CompanyService.getUserCompanies(user.id, isAdmin)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CompanyActionAgent] 📥 Resposta do CompanyService:', {
        success: result.success,
        companiesCount: result.companies?.length || 0,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      if (result.companies && result.companies.length > 0) {
        console.log('[AGX:CompanyActionAgent] 📊 Primeiras 3 empresas:', result.companies.slice(0, 3).map(c => ({
          id: c.id,
          name: c.company_name,
          cnpj: c.cnpj
        })))
      }
      
      const finalResult = {
        success: result.success,
        data: result.companies || [],
        error: result.error
      }
      
      console.log('[AGX:CompanyActionAgent] ✅ ========== EMPRESAS LISTADAS ==========')
      console.log('[AGX:CompanyActionAgent] 📤 Resultado:', {
        success: finalResult.success,
        count: finalResult.data.length,
        hasError: !!finalResult.error
      })
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CompanyActionAgent] ❌ ========== ERRO AO LISTAR EMPRESAS ==========')
      console.error('[AGX:CompanyActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CompanyActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CompanyActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async update(params, user, context) {
    console.log('[AGX:CompanyActionAgent] 🏢 ========== ATUALIZANDO EMPRESA ==========')
    console.log('[AGX:CompanyActionAgent] 📝 Input:', {
      companyId: params.id,
      params: params,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      const updateData = {}
      if (params.name) updateData.company_name = params.name
      if (params.cnpj) updateData.cnpj = params.cnpj
      
      console.log('[AGX:CompanyActionAgent] 📤 Dados a atualizar:', JSON.stringify(updateData, null, 2))
      
      const result = await CompanyService.updateCompany(params.id, updateData)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CompanyActionAgent] 📥 Resposta do CompanyService:', {
        success: result.success,
        hasCompany: !!result.company,
        companyId: result.company?.id,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        data: result.company,
        error: result.error
      }
      
      console.log('[AGX:CompanyActionAgent] ✅ ========== EMPRESA ATUALIZADA ==========')
      console.log('[AGX:CompanyActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CompanyActionAgent] ❌ ========== ERRO AO ATUALIZAR EMPRESA ==========')
      console.error('[AGX:CompanyActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CompanyActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CompanyActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async delete(params, user, context) {
    console.log('[AGX:CompanyActionAgent] 🏢 ========== DELETANDO EMPRESA ==========')
    console.log('[AGX:CompanyActionAgent] 📝 Input:', {
      companyId: params.id,
      userId: user?.id,
      userEmail: user?.email
    })
    
    const startTime = Date.now()
    try {
      console.log('[AGX:CompanyActionAgent] 🗑️ Deletando empresa ID:', params.id)
      
      const result = await CompanyService.deleteCompany(params.id)
      const elapsed = Date.now() - startTime
      
      console.log('[AGX:CompanyActionAgent] 📥 Resposta do CompanyService:', {
        success: result.success,
        error: result.error,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: result.success,
        error: result.error
      }
      
      console.log('[AGX:CompanyActionAgent] ✅ ========== EMPRESA DELETADA ==========')
      console.log('[AGX:CompanyActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CompanyActionAgent] ❌ ========== ERRO AO DELETAR EMPRESA ==========')
      console.error('[AGX:CompanyActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CompanyActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CompanyActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }

  async getStats(params, user, context) {
    console.log('[AGX:CompanyActionAgent] 🏢 ========== OBTENDO ESTATÍSTICAS DA EMPRESA ==========')
    console.log('[AGX:CompanyActionAgent] 📝 Input:', {
      params: params,
      userId: user?.id,
      userEmail: user?.email,
      contextCompanyId: context.userContext?.companyId
    })
    
    const startTime = Date.now()
    try {
      const companyId = params.id || params.companyId || context.userContext?.companyId
      console.log('[AGX:CompanyActionAgent] 🔍 Company ID determinado:', companyId)
      
      if (!companyId) {
        console.log('[AGX:CompanyActionAgent] ❌ ID da empresa não fornecido')
        const errorResult = {
          success: false,
          error: 'ID da empresa não fornecido'
        }
        console.log('[AGX:CompanyActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
        return errorResult
      }

      console.log('[AGX:CompanyActionAgent] 🔍 Buscando dados da empresa...')
      const companyResult = await CompanyService.getCompany(companyId)
      console.log('[AGX:CompanyActionAgent] 📥 Resposta do CompanyService:', {
        success: companyResult.success,
        hasCompany: !!companyResult.company,
        companyName: companyResult.company?.company_name
      })
      
      if (!companyResult.success) {
        const errorResult = {
          success: false,
          error: 'Empresa não encontrada'
        }
        console.log('[AGX:CompanyActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
        return errorResult
      }

      // Buscar estatísticas relacionadas
      console.log('[AGX:CompanyActionAgent] 🔍 Buscando colaboradores da empresa...')
      const { EmployeeService } = await import('../../../services/employeeService')
      const employeesResult = await EmployeeService.getCompanyEmployees(companyId)
      console.log('[AGX:CompanyActionAgent] 📥 Resposta do EmployeeService:', {
        success: employeesResult.success,
        employeesCount: employeesResult.employees?.length || 0,
        activeEmployees: employeesResult.employees?.filter(e => e.is_active).length || 0
      })
      
      const stats = {
        company: companyResult.company,
        employeesCount: employeesResult.employees?.length || 0,
        activeEmployees: employeesResult.employees?.filter(e => e.is_active).length || 0
      }
      
      const elapsed = Date.now() - startTime
      console.log('[AGX:CompanyActionAgent] 📊 Estatísticas calculadas:', {
        employeesCount: stats.employeesCount,
        activeEmployees: stats.activeEmployees,
        elapsed: elapsed + 'ms'
      })
      
      const finalResult = {
        success: true,
        data: stats
      }
      
      console.log('[AGX:CompanyActionAgent] ✅ ========== ESTATÍSTICAS OBTIDAS ==========')
      console.log('[AGX:CompanyActionAgent] 📤 Resultado:', JSON.stringify(finalResult, null, 2))
      
      return finalResult
    } catch (error) {
      const elapsed = Date.now() - startTime
      console.error('[AGX:CompanyActionAgent] ❌ ========== ERRO AO OBTER ESTATÍSTICAS ==========')
      console.error('[AGX:CompanyActionAgent] ❌ Erro após', elapsed + 'ms:', error)
      console.error('[AGX:CompanyActionAgent] ❌ Stack:', error.stack)
      
      const errorResult = {
        success: false,
        error: error.message
      }
      console.log('[AGX:CompanyActionAgent] 📤 Resultado (erro):', JSON.stringify(errorResult, null, 2))
      return errorResult
    }
  }
}

