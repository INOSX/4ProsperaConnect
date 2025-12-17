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
      console.error('Error fetching employees:', error)
      throw error
    }
  }

  /**
   * Buscar colaborador por CPF
   * @param {string} cpf - CPF do colaborador
   * @returns {Promise<Object>} Dados do colaborador
   */
  static async getEmployeeByCPF(cpf) {
    try {
      const response = await fetch(`/api/employees?cpf=${cpf}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching employee by CPF:', error)
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
   * Criar novo colaborador
   * @param {Object} employeeData - Dados do colaborador
   * @returns {Promise<Object>} Colaborador criado
   */
  static async createEmployee(employeeData) {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
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
   * @returns {Promise<Object>} Colaborador atualizado
   */
  static async updateEmployee(employeeId, updates) {
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: employeeId, ...updates })
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
   * Buscar benefícios do colaborador
   * @param {string} employeeId - ID do colaborador
   * @returns {Promise<Object>} Lista de benefícios
   */
  static async getEmployeeBenefits(employeeId) {
    try {
      const response = await fetch(`/api/employees/benefits?employeeId=${employeeId}`)
      
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

  /**
   * Ativar benefício para colaborador
   * @param {string} employeeId - ID do colaborador
   * @param {string} companyBenefitId - ID do benefício da empresa
   * @param {string} expirationDate - Data de expiração (opcional)
   * @returns {Promise<Object>} Benefício ativado
   */
  static async activateBenefit(employeeId, companyBenefitId, expirationDate = null) {
    try {
      const response = await fetch('/api/employees/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          company_benefit_id: companyBenefitId,
          expiration_date: expirationDate
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error activating benefit:', error)
      throw error
    }
  }
}

