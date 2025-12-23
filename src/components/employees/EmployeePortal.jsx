import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { EmployeeService } from '../../services/employeeService'
import { CompanyService } from '../../services/companyService'
import { RecommendationService } from '../../services/recommendationService'
import { ProductService } from '../../services/productService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Package, Gift, TrendingUp, CheckCircle, Users, Search, Eye, X, ArrowLeft, Briefcase, DollarSign } from 'lucide-react'

const EmployeePortal = () => {
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [viewingMode, setViewingMode] = useState(false) // false = lista, true = visualizando como colaborador
  const [benefits, setBenefits] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      loadCompanyData()
    }
  }, [user])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm])

  const loadCompanyData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Buscar empresa do usuário
      const companyResult = await CompanyService.getUserCompanies(user.id)
      if (companyResult.success && companyResult.companies && companyResult.companies.length > 0) {
        const userCompany = companyResult.companies[0]
        setCompany(userCompany)

        // Carregar colaboradores da empresa
        await loadEmployees(userCompany.id)
      }
    } catch (error) {
      console.error('Error loading company data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async (companyId) => {
    try {
      const result = await EmployeeService.getCompanyEmployees(companyId)
      if (result.success) {
        const employeesList = result.employees || []
        setEmployees(employeesList)
        setFilteredEmployees(employeesList)
      }
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = employees.filter(emp =>
      emp.name?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.position?.toLowerCase().includes(term) ||
      emp.department?.toLowerCase().includes(term)
    )
    setFilteredEmployees(filtered)
  }

  const handleViewAsEmployee = async (employee) => {
    setSelectedEmployee(employee)
    setViewingMode(true)
    setLoading(true)

    try {
      // Carregar dados do colaborador selecionado
      await Promise.all([
        loadEmployeeBenefits(employee.id),
        loadEmployeeRecommendations(employee.id),
        loadEmployeeProducts(employee.id)
      ])
    } catch (error) {
      console.error('Error loading employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToList = () => {
    setViewingMode(false)
    setSelectedEmployee(null)
    setBenefits([])
    setRecommendations([])
    setProducts([])
  }

  const loadEmployeeBenefits = async (employeeId) => {
    try {
      const result = await EmployeeService.getEmployeeBenefits(employeeId)
      if (result.success) {
        setBenefits(result.benefits || [])
      }
    } catch (error) {
      console.error('Error loading benefits:', error)
    }
  }

  const loadEmployeeRecommendations = async (employeeId) => {
    try {
      const result = await RecommendationService.getRecommendations('employee', employeeId)
      if (result.success) {
        setRecommendations(result.recommendations || [])
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const loadEmployeeProducts = async (employeeId) => {
    try {
      const result = await ProductService.getEmployeeProducts(employeeId)
      if (result.success) {
        setProducts(result.employeeProducts || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleAcceptRecommendation = async (recommendationId) => {
    try {
      await RecommendationService.trackRecommendation(recommendationId, 'accepted')
      if (selectedEmployee) {
        await loadEmployeeRecommendations(selectedEmployee.id)
      }
    } catch (error) {
      console.error('Error accepting recommendation:', error)
    }
  }

  if (loading && !viewingMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma empresa encontrada</p>
        <p className="text-sm text-gray-400 mt-2">Entre em contato com o suporte para configurar sua empresa</p>
      </div>
    )
  }

  // Modo de visualização (como se fosse o colaborador)
  if (viewingMode && selectedEmployee) {
    const activeBenefits = benefits.filter(b => b.status === 'active')
    const activeProducts = products.filter(p => p.status === 'active')

    return (
      <div className="space-y-6">
        {/* Header com botão de voltar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToList}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Lista
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal do Colaborador</h1>
              <p className="text-gray-600">
                Visualizando como: <span className="font-semibold">{selectedEmployee.name}</span>
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Eye className="h-4 w-4 inline mr-1" />
            Modo Visualização
          </div>
        </div>

        {/* Informações do Colaborador */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Colaborador</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="text-base font-medium text-gray-900">{selectedEmployee.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-base font-medium text-gray-900">{selectedEmployee.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cargo</p>
                <p className="text-base font-medium text-gray-900">{selectedEmployee.position || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Departamento</p>
                <p className="text-base font-medium text-gray-900">{selectedEmployee.department || '-'}</p>
              </div>
              {selectedEmployee.hire_date && (
                <div>
                  <p className="text-sm text-gray-600">Data de Admissão</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(selectedEmployee.hire_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Benefícios Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{activeBenefits.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produtos Contratados</p>
                <p className="text-2xl font-bold text-gray-900">{activeProducts.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recomendações</p>
                <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
          </Card>
        </div>

        {/* Meus Benefícios */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Benefícios</span>
              </h2>
              <span className="text-sm text-gray-600">{activeBenefits.length} ativo{activeBenefits.length !== 1 ? 's' : ''}</span>
            </div>

            {activeBenefits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum benefício ativo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBenefits.map((benefit) => (
                  <div key={benefit.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {benefit.company_benefits?.name || 'Benefício'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {benefit.company_benefits?.description || ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Ativo desde {new Date(benefit.activation_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Produtos Financeiros */}
        {products.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Produtos Financeiros</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.product_catalog?.name || 'Produto'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.product_catalog?.description || ''}
                        </p>
                        {product.monthly_value && (
                          <p className="text-xs text-gray-500 mt-2">
                            Valor mensal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.monthly_value)}
                          </p>
                        )}
                        {product.contract_date && (
                          <p className="text-xs text-gray-500">
                            Contratado em {new Date(product.contract_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status === 'active' ? 'Ativo' : product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Recomendações Personalizadas */}
        {recommendations.length > 0 && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Recomendações</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="font-medium text-gray-900">{rec.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    {rec.reasoning && (
                      <p className="text-xs text-gray-500 mt-2 italic">{rec.reasoning}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">
                        Prioridade: {rec.priority}/10
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRecommendation(rec.id)}
                          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => RecommendationService.trackRecommendation(rec.id, 'rejected')}
                          className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Modo de lista (seleção de colaborador)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portal do Colaborador</h1>
        <p className="text-gray-600">Selecione um colaborador para visualizar seu dashboard</p>
      </div>

      {/* Busca */}
      <Card>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar colaborador por nome, email, cargo ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Lista de Colaboradores */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum colaborador encontrado</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Nenhum colaborador cadastrado na empresa'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{employee.email}</p>
                    <div className="mt-2 space-y-1">
                      {employee.position && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Cargo:</span> {employee.position}
                        </p>
                      )}
                      {employee.department && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Departamento:</span> {employee.department}
                        </p>
                      )}
                    </div>
                  </div>
                  {employee.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleViewAsEmployee(employee)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Dashboard
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Colaboradores</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Colaboradores Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter(e => e.is_active).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resultados da Busca</p>
              <p className="text-2xl font-bold text-primary-600">{filteredEmployees.length}</p>
            </div>
            <Search className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default EmployeePortal
