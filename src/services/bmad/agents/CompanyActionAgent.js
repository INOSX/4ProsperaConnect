/**
 * CompanyActionAgent - Ações relacionadas a empresas
 */
import { CompanyService } from '../../services/companyService'

export default class CompanyActionAgent {
  async create(params, user, context) {
    try {
      const result = await CompanyService.createCompany({
        cnpj: params.cnpj,
        company_name: params.name,
        owner_user_id: user.id
      })
      return {
        success: result.success,
        data: result.company,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async list(params, user, context) {
    try {
      const isAdmin = context.userContext?.role === 'admin'
      const result = await CompanyService.getUserCompanies(user.id, isAdmin)
      return {
        success: result.success,
        data: result.companies || [],
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async update(params, user, context) {
    try {
      const updateData = {}
      if (params.name) updateData.company_name = params.name
      if (params.cnpj) updateData.cnpj = params.cnpj
      
      const result = await CompanyService.updateCompany(params.id, updateData)
      return {
        success: result.success,
        data: result.company,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async delete(params, user, context) {
    try {
      const result = await CompanyService.deleteCompany(params.id)
      return {
        success: result.success,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getStats(params, user, context) {
    try {
      const companyId = params.id || params.companyId || context.userContext?.companyId
      if (!companyId) {
        return {
          success: false,
          error: 'ID da empresa não fornecido'
        }
      }

      const companyResult = await CompanyService.getCompany(companyId)
      if (!companyResult.success) {
        return {
          success: false,
          error: 'Empresa não encontrada'
        }
      }

      // Buscar estatísticas relacionadas
      const { EmployeeService } = await import('../../services/employeeService')
      const employeesResult = await EmployeeService.getCompanyEmployees(companyId)
      
      return {
        success: true,
        data: {
          company: companyResult.company,
          employeesCount: employeesResult.employees?.length || 0,
          activeEmployees: employeesResult.employees?.filter(e => e.is_active).length || 0
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

