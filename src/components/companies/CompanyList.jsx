import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { EmployeeService } from '../../services/employeeService'
import { ClientService } from '../../services/clientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Building2, Users, Package, Briefcase, TrendingUp, Search, ArrowRight, CheckCircle, Shield, Plus, Edit, Trash2 } from 'lucide-react'

const CompanyList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [companiesWithStats, setCompaniesWithStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      loadCompanies()
    }
  }, [user])

  const loadCompanies = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Verificar se o usuário é admin (super_admin ou bank_manager)
      let userIsAdmin = false
      try {
        const clientResult = await ClientService.getClientByUserId(user.id)
        if (clientResult.success && clientResult.client) {
          const role = clientResult.client.role
          userIsAdmin = ['super_admin', 'bank_manager', 'admin'].includes(role)
          setIsAdmin(userIsAdmin)
          console.log('👤 [CompanyList] User role:', role, '| isAdmin:', userIsAdmin)
        }
      } catch (e) {
        console.warn('Error checking admin status:', e)
      }
      
      const result = await CompanyService.getUserCompanies(user.id, userIsAdmin)
      if (result.success && result.companies) {
        const companiesList = result.companies || []
        setCompanies(companiesList)
        
        // Carregar estatísticas para cada empresa
        const companiesWithStatsData = await Promise.all(
          companiesList.map(async (company) => {
            try {
              const employeesResult = await EmployeeService.getCompanyEmployees(company.id).catch(() => ({ success: false, employees: [] }))
              
              const employees = employeesResult.success ? employeesResult.employees || [] : []
              const activeEmployees = employees.filter(e => e.is_active).length
              
              // Tentar buscar benefícios (pode não estar disponível)
              let activeBenefits = 0
              try {
                const { BenefitService } = await import('../../services/benefitService')
                const benefitsResult = await BenefitService.getCompanyBenefits(company.id)
                if (benefitsResult.success) {
                  activeBenefits = (benefitsResult.benefits || []).filter(b => b.is_active).length
                }
              } catch (e) {
                // Ignorar erro
              }
              
              return {
                ...company,
                stats: {
                  employees: employees.length,
                  activeEmployees,
                  activeBenefits,
                  products: 0 // Será calculado depois se necessário
                }
              }
            } catch (error) {
              console.error(`Error loading stats for company ${company.id}:`, error)
              return {
                ...company,
                stats: {
                  employees: 0,
                  activeEmployees: 0,
                  activeBenefits: 0,
                  products: 0
                }
              }
            }
          })
        )
        
        setCompaniesWithStats(companiesWithStatsData)
      }
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCompany = async (companyId, companyName) => {
    if (!isAdmin) {
      alert('Você não tem permissão para deletar empresas.')
      return
    }

    if (!window.confirm(`Tem certeza que deseja deletar a empresa "${companyName}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      const result = await CompanyService.deleteCompany(companyId)
      if (result.success) {
        // Recarregar lista
        loadCompanies()
        alert('Empresa deletada com sucesso!')
      } else {
        throw new Error(result.error || 'Erro ao deletar empresa')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert(error.message || 'Erro ao deletar empresa. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando empresas...</div>
      </div>
    )
  }

  const filteredCompanies = searchTerm
    ? companiesWithStats.filter(company =>
        company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.trade_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.cnpj?.includes(searchTerm) ||
        company.company_type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : companiesWithStats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Pessoas</h1>
            {isAdmin && (
              <span className="px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Admin</span>
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Visualizando todas as empresas cadastradas no sistema'
              : 'Selecione uma empresa para gerenciar colaboradores e benefícios'
            }
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => navigate('/companies/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        )}
      </div>

      {/* Busca */}
      <Card>
        <div className="p-4" data-tour-id="company-list-search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresa por nome, CNPJ ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Lista de Empresas */}
      {filteredCompanies.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Nenhuma empresa cadastrada'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-tour-id="company-list-cards">
          {filteredCompanies.map((company) => (
            <Card 
              key={company.id} 
              className="hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-5 w-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{company.company_name}</h3>
                    </div>
                    {company.trade_name && company.trade_name !== company.company_name && (
                      <p className="text-sm text-gray-600 mb-1">Nome fantasia: {company.trade_name}</p>
                    )}
                    <div className="space-y-1 mt-2">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">CNPJ:</span> {company.cnpj || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Tipo:</span> {company.company_type || 'N/A'}
                      </p>
                      {company.annual_revenue && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Receita Anual:</span>{' '}
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(company.annual_revenue)}
                        </p>
                      )}
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Colaboradores</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {company.stats?.activeEmployees || 0} / {company.stats?.employees || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Benefícios</p>
                      <p className="text-sm font-semibold text-gray-900">{company.stats?.activeBenefits || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`/companies/${company.id}/dashboard`, '_blank')
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <span className="font-medium">Ver Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/companies/${company.id}/edit`)
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        title="Editar empresa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCompany(company.id, company.company_name)
                        }}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Deletar empresa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas Gerais */}
      {companiesWithStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-tour-id="company-list-stats">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{companiesWithStats.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Colaboradores</p>
                <p className="text-2xl font-bold text-primary-600">
                  {companiesWithStats.reduce((sum, c) => sum + (c.stats?.employees || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Colaboradores Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {companiesWithStats.reduce((sum, c) => sum + (c.stats?.activeEmployees || 0), 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Benefícios Ativos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {companiesWithStats.reduce((sum, c) => sum + (c.stats?.activeBenefits || 0), 0)}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CompanyList

