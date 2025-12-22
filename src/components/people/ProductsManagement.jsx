import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { EmployeeService } from '../../services/employeeService'
import { ProductService } from '../../services/productService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Briefcase, Users, TrendingUp, Search, Filter, Plus, Eye, DollarSign, Calendar, Package } from 'lucide-react'

const ProductsManagement = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [employees, setEmployees] = useState([])
  const [employeeProducts, setEmployeeProducts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [productTypeFilter, setProductTypeFilter] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [viewMode, setViewMode] = useState('byEmployee') // 'byEmployee' ou 'byProduct'

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  useEffect(() => {
    filterData()
  }, [employeeProducts, searchTerm, productTypeFilter, employeeFilter, viewMode])

  const loadData = async () => {
    if (!user) {
      console.log('No user found')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      console.log('Loading company data for user:', user.id)
      const companyResult = await CompanyService.getUserCompanies(user.id)
      console.log('Company result:', companyResult)
      
      if (companyResult.success && companyResult.companies && companyResult.companies.length > 0) {
        const userCompany = companyResult.companies[0]
        setCompany(userCompany)
        console.log('Company loaded:', userCompany)

        await Promise.all([
          loadEmployees(userCompany.id),
          loadEmployeeProducts(userCompany.id),
          loadProducts()
        ])
      } else {
        console.warn('No companies found for user')
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async (companyId) => {
    try {
      const result = await EmployeeService.getCompanyEmployees(companyId)
      if (result.success) {
        setEmployees(result.employees || [])
      }
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }

  const loadEmployeeProducts = async (companyId) => {
    try {
      console.log('Loading employee products for company:', companyId)
      const result = await ProductService.getCompanyEmployeeProducts(companyId)
      console.log('Employee products result:', result)
      if (result.success) {
        setEmployeeProducts(result.employeeProducts || [])
        console.log('Employee products loaded:', result.employeeProducts?.length || 0)
      }
    } catch (error) {
      console.error('Error loading employee products:', error)
      // Não mostrar alerta aqui, apenas logar o erro
    }
  }

  const loadProducts = async () => {
    try {
      console.log('Loading products catalog')
      const result = await ProductService.getProducts({ isActive: true })
      console.log('Products result:', result)
      if (result.success) {
        setProducts(result.products || [])
        console.log('Products loaded:', result.products?.length || 0)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      // Não mostrar alerta aqui, apenas logar o erro
    }
  }

  const filterData = () => {
    // A filtragem será feita no render
  }

  const getProductTypeLabel = (type) => {
    const labels = {
      account: 'Conta',
      credit: 'Crédito',
      investment: 'Investimento',
      insurance: 'Seguro',
      benefit: 'Benefício',
      service: 'Serviço'
    }
    return labels[type] || type
  }

  const getProductTypeColor = (type) => {
    const colors = {
      account: 'bg-blue-100 text-blue-800',
      credit: 'bg-green-100 text-green-800',
      investment: 'bg-purple-100 text-purple-800',
      insurance: 'bg-red-100 text-red-800',
      benefit: 'bg-yellow-100 text-yellow-800',
      service: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (value) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // Agrupar produtos por colaborador
  const productsByEmployee = employees.map(employee => {
    const employeeProductsList = employeeProducts.filter(ep => ep.employee_id === employee.id)
    return {
      employee,
      products: employeeProductsList
    }
  }).filter(item => {
    if (employeeFilter && item.employee.id !== employeeFilter) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return item.employee.name.toLowerCase().includes(term) ||
             item.products.some(p => p.product_catalog?.name?.toLowerCase().includes(term))
    }
    return true
  })

  // Agrupar produtos por tipo de produto
  const productsByType = products.map(product => {
    const employeeProductsList = employeeProducts.filter(ep => {
      // Verificar se product_id é string ou objeto
      const epProductId = typeof ep.product_id === 'string' ? ep.product_id : ep.product_id?.id || ep.product_id
      return epProductId === product.id
    })
    return {
      product,
      employeeProducts: employeeProductsList
    }
  }).filter(item => {
    if (productTypeFilter && item.product.product_type !== productTypeFilter) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return item.product.name.toLowerCase().includes(term) ||
             item.employeeProducts.some(ep => {
               const emp = ep.employees || ep.employee
               return emp?.name?.toLowerCase().includes(term)
             })
    }
    return true
  })

  // Estatísticas
  const totalProducts = employeeProducts.length
  const activeProducts = employeeProducts.filter(ep => ep.status === 'active').length
  const totalMonthlyValue = employeeProducts
    .filter(ep => ep.status === 'active' && ep.monthly_value)
    .reduce((sum, ep) => sum + (parseFloat(ep.monthly_value) || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando produtos...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Nenhuma empresa encontrada</p>
        <p className="text-sm text-gray-400">Verifique se você tem uma empresa cadastrada</p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/companies')}
        >
          Voltar para Dashboard
        </Button>
      </div>
    )
  }

  const productTypes = [...new Set(products.map(p => p.product_type))]

  // Debug: Log dos dados carregados
  console.log('ProductsManagement - State:', {
    company: company?.company_name,
    employeesCount: employees.length,
    employeeProductsCount: employeeProducts.length,
    productsCount: products.length
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos Bancários</h1>
          <p className="text-gray-600">Produtos contratados pelos colaboradores de {company.company_name}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/people/products/assign')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Atribuir Produto
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Contratos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <Briefcase className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contratos Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Mensal Total</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalMonthlyValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Colaboradores com Produtos</p>
              <p className="text-2xl font-bold text-gray-900">
                {productsByEmployee.filter(item => item.products.length > 0).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Filtros e Modo de Visualização */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros e Visualização
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('byEmployee')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'byEmployee'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por Colaborador
              </button>
              <button
                onClick={() => setViewMode('byProduct')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'byProduct'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por Produto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filtro por tipo de produto */}
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os tipos</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{getProductTypeLabel(type)}</option>
              ))}
            </select>

            {/* Filtro por colaborador */}
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os colaboradores</option>
              {employees.filter(e => e.is_active).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Visualização por Colaborador */}
      {viewMode === 'byEmployee' && (
        <div className="space-y-4">
          {productsByEmployee.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Nenhum produto encontrado</p>
              </div>
            </Card>
          ) : (
            productsByEmployee.map(({ employee, products }) => (
              <Card key={employee.id}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium text-lg">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Produtos</p>
                      <p className="text-2xl font-bold text-primary-600">{products.length}</p>
                    </div>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>Nenhum produto contratado</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map((ep) => (
                        <div key={ep.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  {ep.product_catalog?.name || 'Produto'}
                                </h4>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getProductTypeColor(ep.product_catalog?.product_type)}`}>
                                  {getProductTypeLabel(ep.product_catalog?.product_type)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {ep.product_catalog?.description || ''}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ep.status)}`}>
                              {ep.status === 'active' ? 'Ativo' : 
                               ep.status === 'suspended' ? 'Suspenso' :
                               ep.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {ep.contract_number && (
                              <div>
                                <p className="text-gray-600">Contrato</p>
                                <p className="font-medium text-gray-900">{ep.contract_number}</p>
                              </div>
                            )}
                            {ep.monthly_value && (
                              <div>
                                <p className="text-gray-600">Valor Mensal</p>
                                <p className="font-medium text-gray-900">{formatCurrency(ep.monthly_value)}</p>
                              </div>
                            )}
                            {ep.contract_date && (
                              <div>
                                <p className="text-gray-600">Contratação</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(ep.contract_date).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            )}
                            {ep.expiration_date && (
                              <div>
                                <p className="text-gray-600">Vencimento</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(ep.expiration_date).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Visualização por Produto */}
      {viewMode === 'byProduct' && (
        <div className="space-y-4">
          {productsByType.filter(item => item.employeeProducts.length > 0).length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Nenhum produto encontrado</p>
              </div>
            </Card>
          ) : (
            productsByType
              .filter(item => {
                if (productTypeFilter && item.product.product_type !== productTypeFilter) return false
                return item.employeeProducts.length > 0
              })
              .map(({ product, employeeProducts: epList }) => (
                <Card key={product.id}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getProductTypeColor(product.product_type)}`}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Contratos</p>
                        <p className="text-2xl font-bold text-primary-600">{epList.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {epList.map((ep) => (
                        <div key={ep.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-medium">
                                {ep.employees?.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{ep.employees?.name || 'Colaborador'}</p>
                              <p className="text-sm text-gray-600">
                                {ep.contract_number && `Contrato: ${ep.contract_number} • `}
                                {ep.monthly_value && `Valor: ${formatCurrency(ep.monthly_value)}/mês`}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ep.status)}`}>
                            {ep.status === 'active' ? 'Ativo' : 
                             ep.status === 'suspended' ? 'Suspenso' :
                             ep.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      )}
    </div>
  )
}

export default ProductsManagement

