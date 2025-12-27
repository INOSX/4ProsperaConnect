/**
 * EmployeeActionAgent - Ações relacionadas a colaboradores
 */
import { EmployeeService } from '../../../services/employeeService'

export default class EmployeeActionAgent {
  async create(params, user, context) {
    try {
      const result = await EmployeeService.createEmployee({
        name: params.name,
        email: params.email,
        company_id: params.companyId || context.userContext?.companyId
      })
      return {
        success: result.success,
        data: result.employee,
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
      const companyId = params.companyId || context.userContext?.companyId
      if (!companyId) {
        return {
          success: false,
          error: 'ID da empresa não fornecido'
        }
      }

      const result = await EmployeeService.getCompanyEmployees(companyId)
      return {
        success: result.success,
        data: result.employees || [],
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
      if (params.name) updateData.name = params.name
      if (params.email) updateData.email = params.email
      
      const result = await EmployeeService.updateEmployee(params.id, updateData)
      return {
        success: result.success,
        data: result.employee,
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
      const result = await EmployeeService.deleteEmployee(params.id)
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
}

