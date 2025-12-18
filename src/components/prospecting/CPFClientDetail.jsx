import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CPFClientService } from '../../services/CPFClientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ArrowLeft, CheckCircle, XCircle, Target, Database, BarChart3, RefreshCw, Mail, Phone, MapPin, Calendar, DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'

const CPFClientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [scoreBreakdown, setScoreBreakdown] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      loadClient()
    }
  }, [id])

  const loadClient = async () => {
    setLoading(true)
    try {
      const clientData = await CPFClientService.getCPFClient(id)
      setClient(clientData)
      
      // Calcular score breakdown se necessário
      if (clientData && !clientData.conversion_potential_score) {
        const scoreData = await CPFClientService.calculateConversionPotential(clientData)
        setScoreBreakdown(scoreData.score_breakdown)
      } else if (clientData) {
        // Tentar buscar breakdown se disponível
        setScoreBreakdown({
          volume_score: 0,
          frequency_score: 0,
          business_score: 0,
          credit_score: 0,
          digital_score: 0,
          products_score: 0
        })
      }
    } catch (error) {
      console.error('Error loading CPF client:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContact = async () => {
    setUpdating(true)
    try {
      await CPFClientService.updateCPFClientStatus(id, 'contacted')
      await loadClient()
      alert('Status atualizado para "Contatado"')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erro ao atualizar status')
    } finally {
      setUpdating(false)
    }
  }

  const handleConvertToProspect = async () => {
    if (!confirm('Deseja converter este cliente CPF em um prospect CNPJ? Esta ação não pode ser desfeita.')) {
      return
    }

    setUpdating(true)
    try {
      await CPFClientService.convertToProspect(id)
      alert('Cliente convertido para prospect com sucesso!')
      navigate('/prospecting')
    } catch (error) {
      console.error('Error converting to prospect:', error)
      alert('Erro ao converter para prospect')
    } finally {
      setUpdating(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Deseja rejeitar este cliente CPF?')) {
      return
    }

    setUpdating(true)
    try {
      await CPFClientService.updateCPFClientStatus(id, 'rejected')
      await loadClient()
      alert('Cliente rejeitado')
    } catch (error) {
      console.error('Error rejecting client:', error)
      alert('Erro ao rejeitar cliente')
    } finally {
      setUpdating(false)
    }
  }

  const handleRecalculateScore = async () => {
    setUpdating(true)
    try {
      const scoreData = await CPFClientService.calculateConversionPotential(client)
      await CPFClientService.updateCPFClient(id, {
        conversion_potential_score: scoreData.conversion_potential_score,
        conversion_probability: scoreData.conversion_probability,
        recommended_action: scoreData.recommended_action,
        priority: scoreData.priority,
        last_analyzed_at: new Date().toISOString()
      })
      setScoreBreakdown(scoreData.score_breakdown)
      await loadClient()
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
      identified: { label: 'Identificado', color: 'bg-blue-100 text-blue-800' },
      contacted: { label: 'Contatado', color: 'bg-yellow-100 text-yellow-800' },
      converted: { label: 'Convertido', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status] || badges.identified
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getRecommendedActionLabel = (action) => {
    const labels = {
      contact_immediately: 'Contatar Imediatamente',
      contact_this_week: 'Contatar Esta Semana',
      contact_this_month: 'Contatar Este Mês',
      monitor: 'Monitorar',
      low_priority: 'Baixa Prioridade',
      reject: 'Rejeitar',
      converted: 'Convertido'
    }
    return labels[action] || action
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando dados do cliente...</div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cliente não encontrado</div>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">CPF: {client.cpf}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(client.status)}
          {client.status === 'identified' && (
            <>
              <Button
                variant="secondary"
                onClick={handleContact}
                disabled={updating}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Contatado
              </Button>
              <Button
                variant="primary"
                onClick={handleConvertToProspect}
                disabled={updating}
              >
                <Target className="h-4 w-4 mr-2" />
                Converter para Prospect
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
                (client.conversion_potential_score || 0) >= 70 ? 'text-green-600' :
                (client.conversion_potential_score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {client.conversion_potential_score || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Probabilidade</p>
              <p className="text-3xl font-bold text-primary-600">
                {client.conversion_probability || 0}%
              </p>
            </div>
            <Target className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prioridade</p>
              <p className="text-3xl font-bold text-gray-900">
                {client.priority || 0}/10
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ação Recomendada</p>
              <p className="text-sm font-semibold text-gray-900">
                {getRecommendedActionLabel(client.recommended_action)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Target },
            { id: 'transactions', label: 'Transações', icon: DollarSign },
            { id: 'business', label: 'Atividade Empresarial', icon: Database },
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

      {/* Conteúdo das Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <>
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nome Completo</p>
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CPF</p>
                      <p className="text-sm font-medium text-gray-900">{client.cpf}</p>
                    </div>
                    {client.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="text-sm font-medium text-gray-900">{client.email}</p>
                        </div>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Telefone</p>
                          <p className="text-sm font-medium text-gray-900">{client.phone}</p>
                        </div>
                      </div>
                    )}
                    {client.birth_date && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Data de Nascimento</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(client.birth_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center space-x-2 col-span-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Endereço</p>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof client.address === 'object' 
                              ? `${client.address.street || ''}, ${client.address.city || ''} - ${client.address.state || ''}`
                              : client.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {client.notes && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Volume Transacional</p>
                      <p className="text-lg font-bold text-gray-900">
                        R$ {(client.transaction_volume || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Frequência de Transações</p>
                      <p className="text-lg font-bold text-gray-900">
                        {client.transaction_frequency || 0} transações/mês
                      </p>
                    </div>
                    {client.average_transaction_value && (
                      <div>
                        <p className="text-sm text-gray-600">Valor Médio</p>
                        <p className="text-lg font-bold text-gray-900">
                          R$ {client.average_transaction_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {client.monthly_revenue_estimate && (
                      <div>
                        <p className="text-sm text-gray-600">Receita Mensal Estimada</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {client.monthly_revenue_estimate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil de Crédito</h3>
                  <div className="space-y-3">
                    {client.credit_score && (
                      <div>
                        <p className="text-sm text-gray-600">Score de Crédito</p>
                        <p className={`text-lg font-bold ${
                          client.credit_score >= 700 ? 'text-green-600' :
                          client.credit_score >= 600 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {client.credit_score}
                        </p>
                      </div>
                    )}
                    {client.payment_history && (
                      <div>
                        <p className="text-sm text-gray-600">Histórico de Pagamento</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {client.payment_history}
                        </p>
                      </div>
                    )}
                    {client.banking_products && Array.isArray(client.banking_products) && client.banking_products.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Produtos Bancários</p>
                        <div className="flex flex-wrap gap-2">
                          {client.banking_products.map((product, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                            >
                              {product.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Transações */}
        {activeTab === 'transactions' && (
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Transacionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Volume Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {(client.transaction_volume || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Frequência Mensal</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {client.transaction_frequency || 0} transações
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor Médio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {(client.average_transaction_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {client.consumption_profile && Object.keys(client.consumption_profile).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Perfil de Consumo</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(client.consumption_profile, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Atividade Empresarial */}
        {activeTab === 'business' && (
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Atividade Empresarial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Score de Atividade</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {client.business_activity_score || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">0-100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tem Indicadores Empresariais</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {client.has_business_indicators ? 'Sim' : 'Não'}
                    </p>
                  </div>
                  {client.business_category && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Categoria</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {client.business_category}
                      </p>
                    </div>
                  )}
                  {client.estimated_employees > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Funcionários Estimados</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {client.estimated_employees} {client.estimated_employees === 1 ? 'funcionário' : 'funcionários'}
                      </p>
                    </div>
                  )}
                  {client.digital_presence_score && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Presença Digital</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {client.digital_presence_score}/100
                      </p>
                    </div>
                  )}
                  {client.social_media_activity > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Atividade em Redes Sociais</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {client.social_media_activity} interações
                      </p>
                    </div>
                  )}
                </div>
                {client.market_signals && Object.keys(client.market_signals).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Sinais de Mercado</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(client.market_signals, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Scoring Detalhado */}
        {activeTab === 'scoring' && (
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Breakdown do Score</h3>
                  <Button
                    variant="secondary"
                    onClick={handleRecalculateScore}
                    disabled={updating}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recalcular Score
                  </Button>
                </div>
                {scoreBreakdown ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Volume Transacional (25%)</span>
                        <span className="text-sm font-bold text-gray-900">{scoreBreakdown.volume_score || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${scoreBreakdown.volume_score || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Frequência (20%)</span>
                        <span className="text-sm font-bold text-gray-900">{scoreBreakdown.frequency_score || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${scoreBreakdown.frequency_score || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Atividade Empresarial (20%)</span>
                        <span className="text-sm font-bold text-gray-900">{scoreBreakdown.business_score || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: `${scoreBreakdown.business_score || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Score de Crédito (15%)</span>
                        <span className="text-sm font-bold text-gray-900">{scoreBreakdown.credit_score || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${scoreBreakdown.credit_score || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Presença Digital (10%)</span>
                        <span className="text-sm font-bold text-gray-900">{scoreBreakdown.digital_score || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-600 h-2 rounded-full"
                          style={{ width: `${scoreBreakdown.digital_score || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Produtos Bancários (10%)</span>
                        <span className="text-sm font-bold text-gray-900">{scoreBreakdown.products_score || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${scoreBreakdown.products_score || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Score breakdown não disponível</p>
                    <Button
                      variant="secondary"
                      onClick={handleRecalculateScore}
                      disabled={updating}
                      className="mt-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Calcular Score
                    </Button>
                  </div>
                )}
                {client.last_analyzed_at && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Última análise: {new Date(client.last_analyzed_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default CPFClientDetail

