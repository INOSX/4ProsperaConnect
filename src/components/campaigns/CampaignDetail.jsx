import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ArrowLeft, Mail, Phone, FileText, Users, Calendar, Clock, TrendingUp, CheckCircle, XCircle, Pause, Play, Edit, Trash2, Send, BarChart3, Target, DollarSign } from 'lucide-react'

const CampaignDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [campaignClients, setCampaignClients] = useState([])
  const [campaignHistory, setCampaignHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    sentCount: 0,
    openedCount: 0,
    clickedCount: 0,
    convertedCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0
  })

  useEffect(() => {
    if (id) {
      loadCampaign()
      loadCampaignClients()
      loadCampaignHistory()
    }
  }, [id])

  const loadCampaign = async () => {
    setLoading(true)
    try {
      // TODO: Carregar campanha da API
      // Por enquanto, usar dados mockados
      const mockCampaign = {
        id: id,
        name: 'Campanha Email - Alto Potencial',
        type: 'email',
        status: 'active',
        message: 'Olá! Identificamos que você tem um alto potencial para se tornar um CNPJ/MEI. Entre em contato conosco para conhecer nossos produtos e benefícios exclusivos.',
        clientsCount: 15,
        sentCount: 12,
        openedCount: 8,
        clickedCount: 5,
        convertedCount: 2,
        createdAt: '2024-12-15T10:00:00',
        scheduledFor: '2024-12-20T09:00:00',
        startedAt: '2024-12-15T10:30:00',
        createdBy: 'user-id-1'
      }
      setCampaign(mockCampaign)
      
      // Calcular métricas
      setMetrics({
        totalClients: mockCampaign.clientsCount,
        sentCount: mockCampaign.sentCount,
        openedCount: mockCampaign.openedCount,
        clickedCount: mockCampaign.clickedCount,
        convertedCount: mockCampaign.convertedCount,
        openRate: mockCampaign.sentCount > 0 ? Math.round((mockCampaign.openedCount / mockCampaign.sentCount) * 100) : 0,
        clickRate: mockCampaign.openedCount > 0 ? Math.round((mockCampaign.clickedCount / mockCampaign.openedCount) * 100) : 0,
        conversionRate: mockCampaign.clientsCount > 0 ? Math.round((mockCampaign.convertedCount / mockCampaign.clientsCount) * 100) : 0
      })
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignClients = async () => {
    try {
      // TODO: Carregar clientes da campanha da API
      // Por enquanto, usar dados mockados
      const mockClients = [
        { id: '1', name: 'João Silva', cpf: '12345678901', email: 'joao@email.com', status: 'sent', opened: true, clicked: true, converted: false },
        { id: '2', name: 'Maria Santos', cpf: '23456789012', email: 'maria@email.com', status: 'sent', opened: true, clicked: false, converted: false },
        { id: '3', name: 'Carlos Oliveira', cpf: '34567890123', email: 'carlos@email.com', status: 'sent', opened: false, clicked: false, converted: false },
        { id: '4', name: 'Ana Costa', cpf: '45678901234', email: 'ana@email.com', status: 'pending', opened: false, clicked: false, converted: false },
        { id: '5', name: 'Pedro Ferreira', cpf: '56789012345', email: 'pedro@email.com', status: 'sent', opened: true, clicked: true, converted: true }
      ]
      setCampaignClients(mockClients)
    } catch (error) {
      console.error('Error loading campaign clients:', error)
    }
  }

  const loadCampaignHistory = async () => {
    try {
      // TODO: Carregar histórico da campanha da API
      // Por enquanto, usar dados mockados
      const mockHistory = [
        { id: '1', action: 'campaign_created', description: 'Campanha criada', timestamp: '2024-12-15T10:00:00', user: 'Sistema' },
        { id: '2', action: 'campaign_started', description: 'Campanha iniciada', timestamp: '2024-12-15T10:30:00', user: 'Sistema' },
        { id: '3', action: 'email_sent', description: '12 emails enviados', timestamp: '2024-12-15T10:35:00', user: 'Sistema' },
        { id: '4', action: 'email_opened', description: '8 emails abertos', timestamp: '2024-12-15T11:00:00', user: 'Sistema' },
        { id: '5', action: 'link_clicked', description: '5 links clicados', timestamp: '2024-12-15T11:30:00', user: 'Sistema' },
        { id: '6', action: 'conversion', description: '2 conversões realizadas', timestamp: '2024-12-15T14:00:00', user: 'Sistema' }
      ]
      setCampaignHistory(mockHistory)
    } catch (error) {
      console.error('Error loading campaign history:', error)
    }
  }

  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />
      case 'phone':
        return <Phone className="h-5 w-5" />
      case 'letter':
        return <FileText className="h-5 w-5" />
      default:
        return <Mail className="h-5 w-5" />
    }
  }

  const getCampaignTypeLabel = (type) => {
    switch (type) {
      case 'email':
        return 'Email'
      case 'phone':
        return 'Telefone'
      case 'letter':
        return 'Carta Convite'
      default:
        return type
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Play className="h-3 w-3 mr-1" />
            Ativa
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Pause className="h-3 w-3 mr-1" />
            Pausada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const getClientStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <span className="text-xs text-green-600 font-medium">Enviado</span>
      case 'pending':
        return <span className="text-xs text-yellow-600 font-medium">Pendente</span>
      case 'failed':
        return <span className="text-xs text-red-600 font-medium">Falhou</span>
      default:
        return <span className="text-xs text-gray-600">{status}</span>
    }
  }

  const handlePauseCampaign = async () => {
    if (window.confirm('Tem certeza que deseja pausar esta campanha?')) {
      // TODO: Implementar pausar campanha
      alert('Campanha pausada com sucesso!')
      loadCampaign()
    }
  }

  const handleResumeCampaign = async () => {
    // TODO: Implementar retomar campanha
    alert('Campanha retomada com sucesso!')
    loadCampaign()
  }

  const handleEditCampaign = () => {
    navigate(`/campaigns/edit/${id}`)
  }

  const handleDeleteCampaign = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.')) {
      // TODO: Implementar excluir campanha
      alert('Campanha excluída com sucesso!')
      navigate('/campaigns')
    }
  }

  const handleSendNow = async () => {
    if (window.confirm('Deseja enviar a campanha agora para todos os clientes pendentes?')) {
      // TODO: Implementar envio imediato
      alert('Campanha enviada com sucesso!')
      loadCampaign()
      loadCampaignClients()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando detalhes da campanha...</div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Campanha não encontrada</p>
          <Button variant="secondary" onClick={() => navigate('/campaigns')}>
            Voltar para Campanhas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/campaigns')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                {getCampaignTypeIcon(campaign.type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(campaign.status)}
                  <span className="text-sm text-gray-500">
                    {getCampaignTypeLabel(campaign.type)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {campaign.status === 'active' && (
            <>
              <Button variant="secondary" onClick={handleSendNow}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Agora
              </Button>
              <Button variant="secondary" onClick={handlePauseCampaign}>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button>
            </>
          )}
          {campaign.status === 'paused' && (
            <Button variant="secondary" onClick={handleResumeCampaign}>
              <Play className="h-4 w-4 mr-2" />
              Retomar
            </Button>
          )}
          <Button variant="secondary" onClick={handleEditCampaign}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="secondary" onClick={handleDeleteCampaign}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalClients}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Abertura</p>
              <p className="text-2xl font-bold text-green-600">{metrics.openRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Clique</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.clickRate}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.conversionRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Informações da Campanha */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Campanha</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Mensagem</p>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{campaign.message || 'Nenhuma mensagem configurada'}</p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Data de Criação</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(campaign.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
            {campaign.scheduledFor && (
              <div>
                <p className="text-sm text-gray-600">Agendada para</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(campaign.scheduledFor).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            {campaign.startedAt && (
              <div>
                <p className="text-sm text-gray-600">Iniciada em</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(campaign.startedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'clients', label: 'Clientes', icon: Users },
            { id: 'history', label: 'Histórico', icon: Clock }
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Estatísticas Detalhadas */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas Detalhadas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emails Enviados</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.sentCount} / {metrics.totalClients}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.sentCount / metrics.totalClients) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emails Abertos</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.openedCount} / {metrics.sentCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${metrics.openRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Links Clicados</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.clickedCount} / {metrics.openedCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${metrics.clickRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversões</span>
                  <span className="text-sm font-medium text-green-600">{metrics.convertedCount} / {metrics.totalClients}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${metrics.conversionRate}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Ações Rápidas */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button variant="primary" className="w-full" onClick={handleSendNow}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Agora
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleEditCampaign}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Campanha
                </Button>
                {campaign.status === 'active' && (
                  <Button variant="secondary" className="w-full" onClick={handlePauseCampaign}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                )}
                {campaign.status === 'paused' && (
                  <Button variant="secondary" className="w-full" onClick={handleResumeCampaign}>
                    <Play className="h-4 w-4 mr-2" />
                    Retomar
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{getStatusBadge(campaign.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{getCampaignTypeLabel(campaign.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes:</span>
                  <span className="font-medium">{metrics.totalClients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enviados:</span>
                  <span className="font-medium">{metrics.sentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversões:</span>
                  <span className="font-medium text-green-600">{metrics.convertedCount}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Clientes da Campanha</h3>
            <span className="text-sm text-gray-600">
              {campaignClients.length} cliente{campaignClients.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {campaignClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum cliente nesta campanha</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aberto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Convertido</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaignClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{client.cpf}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{client.email}</td>
                      <td className="px-4 py-3 text-sm">{getClientStatusBadge(client.status)}</td>
                      <td className="px-4 py-3 text-sm">
                        {client.opened ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {client.clicked ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {client.converted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/prospecting/cpf/${client.id}`)}
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'history' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico da Campanha</h3>
          
          {campaignHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum histórico disponível</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaignHistory.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Clock className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString('pt-BR')} • {item.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default CampaignDetail

