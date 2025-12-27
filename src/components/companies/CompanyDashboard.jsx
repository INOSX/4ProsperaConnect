import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { EmployeeService } from '../../services/employeeService'
import { BenefitService } from '../../services/benefitService'
import { RecommendationService } from '../../services/recommendationService'
import Card from '../ui/Card'
import { Users, Building2, TrendingUp, DollarSign, Package, Briefcase, ArrowLeft } from 'lucide-react'
import Button from '../ui/Button'

const CompanyDashboard = () => {
  const { user } = useAuth()
  const { id: companyId } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [employees, setEmployees] = useState([])
  const [benefits, setBenefits] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(null)

  const loadEmployees = useCallback(async (companyIdParam) => {
    try {
      console.log('🔵 loadEmployees called with companyId:', companyIdParam)
      const result = await EmployeeService.getCompanyEmployees(companyIdParam)
      if (result.success) {
        const employeesList = result.employees || []
        console.log('✅ Employees loaded:', employeesList.length, 'for company:', companyIdParam)
        // Verificar se o companyId ainda é o mesmo antes de atualizar
        if (companyIdParam === companyId) {
          setEmployees(employeesList)
        } else {
          console.warn('⚠️ Company ID changed during load, ignoring results')
        }
      } else {
        console.error('❌ Failed to load employees:', result.error)
      }
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }, [companyId])

  const loadBenefits = useCallback(async (companyIdParam) => {
    try {
      const result = await BenefitService.getCompanyBenefits(companyIdParam)
      if (result.success && companyIdParam === companyId) {
        setBenefits(result.benefits || [])
      }
    } catch (error) {
      console.error('Error loading benefits:', error)
    }
  }, [companyId])

  const loadRecommendations = useCallback(async (companyIdParam) => {
    try {
      const result = await RecommendationService.getRecommendations('company', companyIdParam)
      if (result.success && companyIdParam === companyId) {
        setRecommendations(result.recommendations || [])
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }, [companyId])

  const loadCompanyData = useCallback(async () => {
    if (!user || !companyId) return

    setLoading(true)
    try {
      // Limpar estado anterior
      setCompany(null)
      setEmployees([])
      setBenefits([])
      setRecommendations([])
      
      console.log('🔵 Loading company with ID from URL:', companyId)
      const companyResult = await CompanyService.getCompany(companyId)
      
      if (companyResult.success && companyResult.company) {
        const targetCompany = companyResult.company
        console.log('✅ Company loaded:', targetCompany.company_name, 'ID:', targetCompany.id)
        
        // Verificar se o companyId ainda é o mesmo antes de atualizar
        if (companyId === targetCompany.id) {
          setCompany(targetCompany)

          // Carregar dados relacionados usando o ID da empresa carregada
          await Promise.all([
            loadEmployees(targetCompany.id),
            loadBenefits(targetCompany.id),
            loadRecommendations(targetCompany.id)
          ])
        } else {
          console.warn('⚠️ Company ID mismatch, ignoring results')
        }
      } else {
        console.error('❌ Company not found for ID:', companyId)
      }
    } catch (error) {
      console.error('Error loading company data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, companyId, loadEmployees, loadBenefits, loadRecommendations])

  useEffect(() => {
    if (user && companyId) {
      loadCompanyData()
    }
  }, [user, companyId, loadCompanyData])


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Empresa não encontrada</p>
        <p className="text-sm text-gray-400 mt-2">A empresa solicitada não existe ou você não tem permissão para acessá-la</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/companies')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Lista de Empresas
        </Button>
      </div>
    )
  }

  const activeEmployees = employees.filter(e => e.is_active).length
  const activeBenefits = benefits.filter(b => b.is_active).length
  const productsContracted = company.products_contracted?.length || 0

  const menuItems = [
    {
      id: 'employees',
      label: 'Gerenciar Colaboradores',
      icon: Users,
      url: `/people/employees?companyId=${companyId}`
    },
    {
      id: 'benefits',
      label: 'Gerenciar Benefícios',
      icon: Package,
      url: `/people/benefits?companyId=${companyId}`
    },
    {
      id: 'products',
      label: 'Produtos Financeiros',
      icon: Briefcase,
      url: `/people/products?companyId=${companyId}`
    }
  ]

  const handleMenuClick = (item) => {
    setActiveTab(item.id)
  }

  return (
    <div className="flex flex-col">
      {/* Header com Topbar */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{company.company_name}</h1>
        </div>
        {/* Topbar Menu */}
        <div className="border-t border-gray-200 px-6">
          <div className="flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo - Dashboard ou Iframe */}
      {activeTab ? (
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
          <iframe
            key={activeTab}
            src={`${window.location.origin}${menuItems.find(item => item.id === activeTab)?.url}`}
            className="w-full h-full border-0"
            title={menuItems.find(item => item.id === activeTab)?.label}
            style={{ display: 'block' }}
          />
        </div>
      ) : (
        <div className="space-y-6">

      {/* Informações da Empresa */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{company.company_name}</h2>
              <p className="text-sm text-gray-600">{company.trade_name || company.company_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">CNPJ</p>
              <p className="text-base font-medium text-gray-900">{company.cnpj}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="text-base font-medium text-gray-900">{company.company_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Setor</p>
              <p className="text-base font-medium text-gray-900">{company.industry || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status Bancário</p>
              <p className="text-base font-medium text-gray-900 capitalize">{company.banking_status || '-'}</p>
            </div>
            {company.annual_revenue && (
              <div>
                <p className="text-sm text-gray-600">Receita Anual</p>
                <p className="text-base font-medium text-gray-900">
                  R$ {new Intl.NumberFormat('pt-BR').format(company.annual_revenue)}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Colaboradores</p>
              <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Benefícios Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{activeBenefits}</p>
            </div>
            <Package className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produtos Contratados</p>
              <p className="text-2xl font-bold text-gray-900">{productsContracted}</p>
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

      {/* Recomendações */}
      {recommendations.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recomendações para sua Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec) => (
                <div key={rec.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{rec.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">Prioridade: {rec.priority}/10</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => RecommendationService.trackRecommendation(rec.id, 'accepted')}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
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
      )}
    </div>
  )
}

export default CompanyDashboard

