import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { BenefitService } from '../../services/benefitService'
import { EmployeeService } from '../../services/employeeService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Package, Plus, Edit, Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react'

const BenefitsManagement = ({ companyId: propCompanyId }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [benefits, setBenefits] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, propCompanyId])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Se companyId foi passado como prop, usar diretamente
      if (propCompanyId) {
        const companyResult = await CompanyService.getCompany(propCompanyId)
        if (companyResult.success && companyResult.company) {
          const targetCompany = companyResult.company
          setCompany(targetCompany)

          await Promise.all([
            loadBenefits(targetCompany.id),
            loadEmployees(targetCompany.id)
          ])
        }
      } else {
        // Comportamento original - buscar empresas do usuário
        const companyResult = await CompanyService.getUserCompanies(user.id)
        if (companyResult.success && companyResult.companies && companyResult.companies.length > 0) {
          const userCompany = companyResult.companies[0]
          setCompany(userCompany)

          await Promise.all([
            loadBenefits(userCompany.id),
            loadEmployees(userCompany.id)
          ])
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBenefits = async (companyId) => {
    try {
      const result = await BenefitService.getCompanyBenefits(companyId)
      if (result.success) {
        setBenefits(result.benefits || [])
      }
    } catch (error) {
      console.error('Error loading benefits:', error)
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

  const getBenefitTypeLabel = (type) => {
    const labels = {
      health_insurance: 'Plano de Saúde',
      meal_voucher: 'Vale Alimentação',
      transportation: 'Vale Transporte',
      financial_product: 'Produto Financeiro',
      education: 'Educação',
      wellness: 'Bem-estar',
      other: 'Outro'
    }
    return labels[type] || type
  }

  const getBenefitTypeColor = (type) => {
    const colors = {
      health_insurance: 'bg-blue-100 text-blue-800',
      meal_voucher: 'bg-green-100 text-green-800',
      transportation: 'bg-yellow-100 text-yellow-800',
      financial_product: 'bg-purple-100 text-purple-800',
      education: 'bg-indigo-100 text-indigo-800',
      wellness: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getEmployeesWithBenefit = async (benefitId) => {
    // Esta função seria implementada com uma query que busca colaboradores com o benefício
    // Por enquanto, retornamos um número estimado
    return 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando benefícios...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma empresa encontrada</p>
      </div>
    )
  }

  const activeBenefits = benefits.filter(b => b.is_active)
  const inactiveBenefits = benefits.filter(b => !b.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benefícios</h1>
          <p className="text-gray-600">Gerencie os benefícios oferecidos por {company.company_name}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/people/benefits/new')}
          data-tour-id="benefits-add"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Benefício
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tour-id="benefits-stats">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Benefícios</p>
              <p className="text-2xl font-bold text-gray-900">{benefits.length}</p>
            </div>
            <Package className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeBenefits.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Colaboradores</p>
              <p className="text-2xl font-bold text-primary-600">{employees.filter(e => e.is_active).length}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Benefícios Ativos */}
      {activeBenefits.length > 0 && (
        <div data-tour-id="benefits-list">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefícios Ativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBenefits.map((benefit) => (
              <Card key={benefit.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{benefit.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBenefitTypeColor(benefit.benefit_type)}`}>
                          {getBenefitTypeLabel(benefit.benefit_type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{benefit.description || 'Sem descrição'}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </div>

                  {benefit.configuration && Object.keys(benefit.configuration).length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-1">Configuração</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {benefit.configuration.provider && (
                          <p>Fornecedor: {benefit.configuration.provider}</p>
                        )}
                        {benefit.configuration.amount && (
                          <p>Valor: R$ {benefit.configuration.amount}</p>
                        )}
                        {benefit.configuration.coverage && (
                          <p>Cobertura: {benefit.configuration.coverage}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {benefit.eligibility_rules && Object.keys(benefit.eligibility_rules).length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        {benefit.eligibility_rules.min_hire_days && 
                          `Elegível após ${benefit.eligibility_rules.min_hire_days} dias de admissão`
                        }
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Atribuído a colaboradores</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/people/benefits/${benefit.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* Benefícios Inativos */}
      {inactiveBenefits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefícios Inativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveBenefits.map((benefit) => (
              <Card key={benefit.id} className="opacity-75">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{benefit.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBenefitTypeColor(benefit.benefit_type)}`}>
                          {getBenefitTypeLabel(benefit.benefit_type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{benefit.description || 'Sem descrição'}</p>
                    </div>
                    <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/people/benefits/${benefit.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {benefits.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum benefício cadastrado</h3>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro benefício para oferecer aos colaboradores
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/people/benefits/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Benefício
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default BenefitsManagement

