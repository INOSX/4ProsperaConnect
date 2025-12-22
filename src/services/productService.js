/**
 * Serviço para gestão de produtos bancários
 */
import { supabase } from './supabase.js'

export class ProductService {
  /**
   * Listar produtos do catálogo
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Object>} Lista de produtos
   */
  static async getProducts(filters = {}) {
    try {
      let query = supabase
        .from('product_catalog')
        .select('*')

      if (filters.productType) {
        query = query.eq('product_type', filters.productType)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }
      if (filters.targetAudience) {
        query = query.contains('target_audience', [filters.targetAudience])
      }

      query = query.order('name', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      return { success: true, products: data || [] }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  /**
   * Buscar produto por ID
   * @param {string} productId - ID do produto
   * @returns {Promise<Object>} Dados do produto
   */
  static async getProduct(productId) {
    try {
      const { data, error } = await supabase
        .from('product_catalog')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error

      return { success: true, product: data }
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  /**
   * Listar produtos de um colaborador
   * @param {string} employeeId - ID do colaborador
   * @returns {Promise<Object>} Lista de produtos do colaborador
   */
  static async getEmployeeProducts(employeeId) {
    try {
      const { data, error } = await supabase
        .from('employee_products')
        .select(`
          *,
          product_catalog (*)
        `)
        .eq('employee_id', employeeId)
        .order('contract_date', { ascending: false })

      if (error) throw error

      // Buscar dados do colaborador separadamente se necessário
      if (data && data.length > 0) {
        try {
          const { EmployeeService } = await import('./employeeService.js')
          const employeeResult = await EmployeeService.getEmployee(employeeId)
          if (employeeResult.success && employeeResult.employee) {
            // Adicionar dados do colaborador a cada produto
            data.forEach(ep => {
              ep.employees = employeeResult.employee
            })
          }
        } catch (err) {
          console.warn('Could not fetch employee data:', err)
        }
      }

      return { success: true, employeeProducts: data || [] }
    } catch (error) {
      console.error('Error fetching employee products:', error)
      throw error
    }
  }

  /**
   * Listar produtos de todos os colaboradores de uma empresa
   * @param {string} companyId - ID da empresa
   * @returns {Promise<Object>} Lista de produtos por colaborador
   */
  static async getCompanyEmployeeProducts(companyId) {
    try {
      // Tentar buscar employee_products diretamente
      // Se falhar por causa de RLS, vamos usar uma abordagem alternativa
      let employeeProducts = []
      let productsError = null

      try {
        const result = await supabase
          .from('employee_products')
          .select(`
            *,
            product_catalog (*)
          `)
          .order('contract_date', { ascending: false })
        
        productsError = result.error
        employeeProducts = result.data || []
      } catch (err) {
        productsError = err
        console.warn('Direct query failed, will try alternative approach:', err)
      }

      // Se houver erro de RLS, retornar array vazio e logar o erro
      if (productsError) {
        console.error('Error fetching employee products (RLS issue):', productsError)
        // Retornar array vazio em vez de lançar erro para não quebrar a UI
        return { success: true, employeeProducts: [] }
      }

      if (!employeeProducts || employeeProducts.length === 0) {
        return { success: true, employeeProducts: [] }
      }

      // Buscar colaboradores da empresa separadamente usando EmployeeService
      // Isso evita a recursão porque EmployeeService usa API que não tem problema de RLS
      const { EmployeeService } = await import('./employeeService.js')
      const employeesResult = await EmployeeService.getCompanyEmployees(companyId)

      if (!employeesResult.success || !employeesResult.employees) {
        return { success: true, employeeProducts: [] }
      }

      const employeeIds = new Set(employeesResult.employees.map(e => e.id))

      // Filtrar produtos de colaboradores da empresa e enriquecer com dados dos colaboradores
      const enrichedProducts = employeeProducts
        .filter(ep => {
          const epEmployeeId = typeof ep.employee_id === 'string' ? ep.employee_id : ep.employee_id?.id || ep.employee_id
          return employeeIds.has(epEmployeeId)
        })
        .map(ep => {
          const epEmployeeId = typeof ep.employee_id === 'string' ? ep.employee_id : ep.employee_id?.id || ep.employee_id
          const employee = employeesResult.employees.find(e => e.id === epEmployeeId)
          return {
            ...ep,
            employees: employee || null
          }
        })

      return { success: true, employeeProducts: enrichedProducts }
    } catch (error) {
      console.error('Error fetching company employee products:', error)
      throw error
    }
  }

  /**
   * Atribuir produto a um colaborador
   * @param {Object} productData - Dados do produto a atribuir
   * @returns {Promise<Object>} Produto atribuído
   */
  static async assignProductToEmployee(productData) {
    try {
      const { employee_id, product_id, contract_number, contract_date, monthly_value, contract_details, expiration_date } = productData

      const { data, error } = await supabase
        .from('employee_products')
        .insert({
          employee_id,
          product_id,
          contract_number: contract_number || null,
          contract_date: contract_date || new Date().toISOString().split('T')[0],
          monthly_value: monthly_value || null,
          contract_details: contract_details || {},
          expiration_date: expiration_date || null,
          status: 'active'
        })
        .select(`
          *,
          product_catalog (*)
        `)
        .single()

      if (error) throw error

      // Buscar dados do colaborador separadamente se necessário
      if (data && data.employee_id) {
        try {
          const { EmployeeService } = await import('./employeeService.js')
          const employeeResult = await EmployeeService.getEmployee(data.employee_id)
          if (employeeResult.success && employeeResult.employee) {
            data.employees = employeeResult.employee
          }
        } catch (err) {
          console.warn('Could not fetch employee data:', err)
        }
      }

      return { success: true, employeeProduct: data }
    } catch (error) {
      console.error('Error assigning product to employee:', error)
      throw error
    }
  }

  /**
   * Atualizar produto de colaborador
   * @param {string} id - ID do relacionamento
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<Object>} Produto atualizado
   */
  static async updateEmployeeProduct(id, updates) {
    try {
      const { data, error } = await supabase
        .from('employee_products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          product_catalog (*)
        `)
        .single()

      if (error) throw error

      // Buscar dados do colaborador separadamente se necessário
      if (data && data.employee_id) {
        try {
          const { EmployeeService } = await import('./employeeService.js')
          const employeeResult = await EmployeeService.getEmployee(data.employee_id)
          if (employeeResult.success && employeeResult.employee) {
            data.employees = employeeResult.employee
          }
        } catch (err) {
          console.warn('Could not fetch employee data:', err)
        }
      }

      if (error) throw error

      return { success: true, employeeProduct: data }
    } catch (error) {
      console.error('Error updating employee product:', error)
      throw error
    }
  }
}

