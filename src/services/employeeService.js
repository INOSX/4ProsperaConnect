/**
 * Serviço para gestão de colaboradores
 */
export class EmployeeService {
  /**
   * Buscar colaborador por ID
   * @param {string} employeeId - ID do colaborador
   * @returns {Promise<Object>} Dados do colaborador
   */
  static async getEmployee(employeeId) {
    try {
      const response = await fetch(`/api/employees?id=${employeeId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching employee:', error)
      throw error
    }
  }

  /**
   * Buscar colaborador por userId
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Dados do colaborador
   */
  static async getEmployeeByUserId(userId) {
    try {
      const response = await fetch(`/api/employees?userId=${userId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching employee by userId:', error)
      throw error
    }
  }

  /**
   * Listar colaboradores de uma empresa
   * @param {string} companyId - ID da empresa
   * @returns {Promise<Object>} Lista de colaboradores
   */
  static async getCompanyEmployees(companyId) {
    try {
      const response = await fetch(`/api/employees?companyId=${companyId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching company employees:', error)
      throw error
    }
  }

  /**
   * Criar novo colaborador
   * @param {Object} employeeData - Dados do colaborador
   * @param {string} userId - ID do usuário que está criando
   * @returns {Promise<Object>} Colaborador criado
   */
  static async createEmployee(employeeData, userId) {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...employeeData,
          userId // Passar userId para verificação de permissões na API
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  }

  /**
   * Atualizar colaborador
   * @param {string} employeeId - ID do colaborador
   * @param {Object} updates - Dados para atualizar
   * @param {string} userId - ID do usuário que está atualizando
   * @returns {Promise<Object>} Colaborador atualizado
   */
  static async updateEmployee(employeeId, updates, userId) {
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employeeId,
          ...updates,
          userId // Passar userId para verificação de permissões na API
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating employee:', error)
      throw error
    }
  }

  /**
   * Deletar colaborador
   * @param {string} employeeId - ID do colaborador
   * @param {string} userId - ID do usuário que está deletando
   * @returns {Promise<Object>} Resultado da exclusão
   */
  static async deleteEmployee(employeeId, userId) {
    try {
      const response = await fetch(`/api/employees?id=${employeeId}&userId=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  }

  /**
   * Buscar benefícios do colaborador
   * @param {string} employeeId - ID do colaborador
   * @returns {Promise<Object>} Lista de benefícios
   */
  static async getEmployeeBenefits(employeeId) {
    try {
      const response = await fetch(`/api/benefits?employeeId=${employeeId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching employee benefits:', error)
      throw error
    }
  }
}

/**
 * Funções helper para verificar permissões de Admin do Cliente
 */

/**
 * Verificar se usuário é Admin do Cliente de uma empresa específica
 * @param {string} userId - ID do usuário
 * @param {string} companyId - ID da empresa
 * @returns {Promise<boolean>}
 */
export async function isCompanyAdmin(userId, companyId) {
  try {
    const result = await EmployeeService.getEmployeeByUserId(userId)
    if (result.success) {
      // Verificar se há employees (array) ou employee (objeto único)
      const employees = result.employees || (result.employee ? [result.employee] : [])
      return employees.some(emp => 
        emp.is_company_admin === true && 
        emp.company_id === companyId &&
        emp.is_active === true
      )
    }
    return false
  } catch (error) {
    console.error('Error checking company admin:', error)
    return false
  }
}

/**
 * Verificar se usuário é Admin do Cliente de qualquer empresa
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>}
 */
export async function isCompanyAdminAny(userId) {
  try {
    const result = await EmployeeService.getEmployeeByUserId(userId)
    if (result.success) {
      // Verificar se há employees (array) ou employee (objeto único)
      const employees = result.employees || (result.employee ? [result.employee] : [])
      return employees.some(emp => 
        emp.is_company_admin === true && 
        emp.is_active === true
      )
    }
    return false
  } catch (error) {
    console.error('Error checking company admin:', error)
    return false
  }
}

/**
 * Obter lista de empresas onde usuário é Admin do Cliente
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array<string>>} Lista de IDs das empresas
 */
export async function getCompanyAdminCompanies(userId) {
  try {
    const result = await EmployeeService.getEmployeeByUserId(userId)
    if (result.success) {
      // Verificar se há employees (array) ou employee (objeto único)
      const employees = result.employees || (result.employee ? [result.employee] : [])
      return employees
        .filter(emp => emp.is_company_admin === true && emp.is_active === true)
        .map(emp => emp.company_id)
    }
    return []
  } catch (error) {
    console.error('Error getting company admin companies:', error)
    return []
  }
}
