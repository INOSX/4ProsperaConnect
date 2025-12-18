import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UnbankedCompanyService } from '../../services/UnbankedCompanyService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ArrowLeft, CheckCircle, XCircle, Target, Building2, BarChart3, RefreshCw, Mail, Phone, MapPin, Calendar, DollarSign, TrendingUp, Users, CreditCard, AlertCircle, Database } from 'lucide-react'

const UnbankedCompanyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      loadCompany()
    }
  }, [id])

  const loadCompany = async () => {
    setLoading(true)
    try {
      const companyData = await UnbankedCompanyService.getUnbankedCompany(id)
      setCompany(companyData)
    } catch (error) {
      console.error('Error loading company:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContact = async () => {
    setUpdating(true)
    try {
      await UnbankedCompanyService.updateCompanyStatus(id, 'contacted')
      await loadCompany()
      alert('Status atualizado para "Contatada"')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erro ao atualizar status')
    } finally {
      setUpdating(false)
    }
  }

  const handleConvertToClient = async () => {
    if (!confirm('Deseja converter esta empresa em um cliente do banco? Esta ação não pode ser desfeita.')) {
      return
    }

    setUpdating(true)
    try {
      await UnbankedCompanyService.convertToClient(id)
      alert('Empresa convertida para cliente com sucesso!')
      navigate('/prospecting')
    } catch (error) {
      console.error('Error converting to client:', error)
      alert('Erro ao converter para cliente')
    } finally {
      setUpdating(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Deseja rejeitar esta empresa?')) {
      return
    }

    setUpdating(true)
    try {
      await UnbankedCompanyService.updateCompanyStatus(id, 'rejected')
      await loadCompany()
      alert('Empresa rejeitada')
    } catch (error) {
      console.error('Error rejecting company:', error)
      alert('Erro ao rejeitar empresa')
    } finally {
      setUpdating(false)
    }
  }

  const handleRecalculateScore = async () => {
    setUpdating(true)
    try {
      await UnbankedCompanyService.calculatePotential([id])
      await loadCompany()
      alert('Score recalculado com sucesso!')
    } catch (error) {
      console.error('Error recalculating score:', error)
      alert('Erro ao recalcular score')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      identified: { label: 'Identificada', color: 'bg-blue-100 text-blue-800' },
      contacted: { label: 'Contatada', color: 'bg-yellow-100 text-yellow-800' },
      converted: { label: 'Convertida', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status] || badges.identified
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getBankingStatusBadge = (status) => {
    const badges = {
      not_banked: { label: 'Não Bancarizada', color: 'bg-red-100 text-red-800' },
      partial: { label: 'Subexplorada', color: 'bg-yellow-100 text-yellow-800' },
      fully_banked: { label: 'Totalmente Bancarizada', color: 'bg-green-100 text-green-800' }
    }
    const badge = badges[status] || badges.not_banked
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando dados da empresa...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Empresa não encontrada</div>
      </div>
    )
  }

  const contactInfo = company.contact_info || {}
  const address = contactInfo.address || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/prospecting')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.trade_name || company.company_name}</h1>
            <p className="text-gray-600">CNPJ: {company.cnpj}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(company.status)}
          {company.status === 'identified' && (
            <>
              <Button
                variant="secondary"
                onClick={handleContact}
                disabled={updating}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Contatada
              </Button>
              <Button
                variant="primary"
                onClick={handleConvertToClient}
                disabled={updating}
              >
                <Target className="h-4 w-4 mr-2" />
                Converter para Cliente
              </Button>
              <Button
                variant="secondary"
                onClick={handleReject}
                disabled={updating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Score e Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score de Potencial</p>
              <p className={`text-3xl font-bold ${
                (company.identification_score || 0) >= 70 ? 'text-green-600' :
                (company.identification_score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {company.identification_score || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status Bancário</p>
              <div className="mt-1">
                {getBankingStatusBadge(company.banking_status)}
              </div>
            </div>
            <AlertCircle className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prioridade</p>
              <p className="text-3xl font-bold text-gray-900">
                {company.priority || 0}/10
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Estimada</p>
              <p className="text-2xl font-bold text-primary-600">
                R$ {company.revenue_estimate ? (company.revenue_estimate / 1000).toFixed(0) + 'k' : '-'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Target },
            { id: 'banking', label: 'Status Bancário', icon: CreditCard },
            { id: 'products', label: 'Produtos', icon: Database },
            { id: 'scoring', label: 'Scoring Detalhado', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Razão Social</p>
                      <p className="text-base font-medium text-gray-900">{company.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nome Fantasia</p>
                      <p className="text-base font-medium text-gray-900">{company.trade_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CNPJ</p>
                      <p className="text-base font-medium text-gray-900">{company.cnpj}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tipo de Empresa</p>
                      <p className="text-base font-medium text-gray-900">{company.company_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Setor/Indústria</p>
                      <p className="text-base font-medium text-gray-900">{company.industry || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Número de Funcionários</p>
                      <p className="text-base font-medium text-gray-900">{company.employee_count || 0}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h2>
                  <div className="space-y-3">
                    {contactInfo.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{contactInfo.email}</span>
                      </div>
                    )}
                    {contactInfo.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{contactInfo.phone}</span>
                      </div>
                    )}
                    {address.street && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-900">{address.street}</p>
                          {address.city && (
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.zip}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Fontes de Dados</h2>
                  <div className="space-y-2">
                    {(company.data_sources || []).length > 0 ? (
                      company.data_sources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {source.sourceType === 'upload' ? 'Upload' : 
                               source.sourceType === 'database' ? 'Banco de Dados' : 
                               'API Externa'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Identificado em {new Date(source.identifiedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Nenhuma fonte de dados registrada</p>
                    )}
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'banking' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Bancário</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status Atual</p>
                    {getBankingStatusBadge(company.banking_status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Produtos Bancários Atuais</p>
                    <div className="flex flex-wrap gap-2">
                      {(company.products_contracted || []).length > 0 ? (
                        (company.products_contracted || []).map((product, index) => (
                          <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                            {product}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Nenhum produto bancário contratado</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'products' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Produtos Recomendados</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Produtos Potenciais</p>
                    <div className="flex flex-wrap gap-2">
                      {(company.potential_products || []).length > 0 ? (
                        (company.potential_products || []).map((product, index) => (
                          <span key={index} className="inline-flex px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                            {product}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Nenhum produto recomendado</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'scoring' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Scoring Detalhado</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>Score de Identificação</span>
                      <span className="font-semibold">{company.identification_score || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          (company.identification_score || 0) >= 70 ? 'bg-green-600' :
                          (company.identification_score || 0) >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${company.identification_score || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Fatores de Score:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Receita Estimada:</span>
                        <span className="font-medium">{(company.revenue_estimate || 0) > 0 ? 'Alto' : 'Baixo'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Número de Funcionários:</span>
                        <span className="font-medium">{company.employee_count || 0}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Status Bancário:</span>
                        <span className="font-medium">{company.banking_status === 'not_banked' ? 'Alto Potencial' : 'Médio Potencial'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Setor:</span>
                        <span className="font-medium">{company.industry || '-'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleRecalculateScore}
                  disabled={updating}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recalcular Score
                </Button>
                {company.status === 'identified' && (
                  <>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={handleContact}
                      disabled={updating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Contatada
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleConvertToClient}
                      disabled={updating}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Converter para Cliente
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={handleReject}
                      disabled={updating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{getStatusBadge(company.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status Bancário:</span>
                  <span className="font-medium">{getBankingStatusBadge(company.banking_status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Score:</span>
                  <span className="font-medium">{company.identification_score || 0}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prioridade:</span>
                  <span className="font-medium">{company.priority || 0}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Criada em:</span>
                  <span className="font-medium">
                    {new Date(company.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {company.notes && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{company.notes}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default UnbankedCompanyDetail

