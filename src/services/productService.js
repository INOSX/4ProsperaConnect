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
      // Buscar produtos dos colaboradores usando JOIN através do relacionamento
      // Isso evita a recursão infinita na política RLS de employees
      const { data, error } = await supabase
        .from('employee_products')
        .select(`
          *,
          employees!inner (
            id,
            name,
            email,
            position,
            department,
            company_id
          ),
          product_catalog (*)
        `)
        .eq('employees.company_id', companyId)
        .eq('employees.is_active', true)
        .order('contract_date', { ascending: false })

      if (error) {
        // Se o JOIN não funcionar, tentar abordagem alternativa
        console.warn('Error with JOIN approach, trying alternative:', error)
        
        // Buscar produtos diretamente e filtrar depois
        const { data: allProducts, error: allProductsError } = await supabase
          .from('employee_products')
          .select(`
            *,
            employees (
              id,
              name,
              email,
              position,
              department,
              company_id
            ),
            product_catalog (*)
          `)
          .order('contract_date', { ascending: false })

        if (allProductsError) throw allProductsError

        // Filtrar produtos de colaboradores da empresa
        const filteredProducts = (allProducts || []).filter(ep => {
          const employee = ep.employees
          return employee && employee.company_id === companyId && employee.is_active !== false
        })

        return { success: true, employeeProducts: filteredProducts }
      }

      return { success: true, employeeProducts: data || [] }
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
          employees (*),
          product_catalog (*)
        `)
        .single()

      if (error) throw error

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
          employees (*),
          product_catalog (*)
        `)
        .single()

      if (error) throw error

      return { success: true, employeeProduct: data }
    } catch (error) {
      console.error('Error updating employee product:', error)
      throw error
    }
  }
}

