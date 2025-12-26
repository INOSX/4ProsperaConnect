import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Mail, Phone, FileText, Plus, Users, Calendar, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'

const CampaignManagement = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedClients, setSelectedClients] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Recuperar clientes selecionados do estado de navegação
    if (location.state?.selectedClients) {
      setSelectedClients(location.state.selectedClients)
    }
    
    // Carregar campanhas existentes
    loadCampaigns()
  }, [location.state])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      // TODO: Carregar campanhas da API
      // Por enquanto, usar dados mockados
      setCampaigns([
        {
          id: '1',
          name: 'Campanha Email - Alto Potencial',
          type: 'email',
          status: 'active',
          clientsCount: 15,
          sentCount: 12,
          openedCount: 8,
          convertedCount: 2,
          createdAt: '2024-12-15',
          scheduledFor: '2024-12-20'
        },
        {
          id: '2',
          name: 'Campanha Telefone - Médio Potencial',
          type: 'phone',
          status: 'completed',
          clientsCount: 25,
          sentCount: 25,
          openedCount: 20,
          convertedCount: 5,
          createdAt: '2024-12-10',
          scheduledFor: '2024-12-15'
        }
      ])
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
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
            <Clock className="h-3 w-3 mr-1" />
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
            <XCircle className="h-3 w-3 mr-1" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando campanhas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Campanhas</h1>
          <p className="text-gray-600">Crie e gerencie campanhas para converter clientes CPF em CNPJ</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/campaigns/create', { state: { selectedClients } })}
          data-tour-id="campaigns-create"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Campanha
        </Button>
      </div>

      {/* Card de Clientes Selecionados */}
      <Card className="p-6" data-tour-id="campaigns-selected-clients">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Clientes Selecionados</h3>
              <p className="text-sm text-gray-600">
                {selectedClients.length} cliente{selectedClients.length !== 1 ? 's' : ''} selecionado{selectedClients.length !== 1 ? 's' : ''} para campanha
              </p>
            </div>
          </div>
          {selectedClients.length === 0 && (
            <Button
              variant="secondary"
              onClick={() => navigate('/prospecting')}
            >
              Selecionar Clientes
            </Button>
          )}
        </div>
      </Card>

      {/* Lista de Campanhas */}
      <div className="grid grid-cols-1 gap-4" data-tour-id="campaigns-list">
        {campaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma campanha criada</h3>
            <p className="text-gray-600 mb-6">
              Comece criando sua primeira campanha para converter clientes CPF em CNPJ
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/campaigns/create', { state: { selectedClients } })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    {getCampaignTypeIcon(campaign.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Tipo</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getCampaignTypeLabel(campaign.type)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Clientes</p>
                        <p className="text-sm font-medium text-gray-900">{campaign.clientsCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Taxa de Abertura</p>
                        <p className="text-sm font-medium text-gray-900">
                          {campaign.clientsCount > 0 
                            ? Math.round((campaign.openedCount / campaign.sentCount) * 100) 
                            : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conversões</p>
                        <p className="text-sm font-medium text-green-600">{campaign.convertedCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {campaign.scheduledFor && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Agendada para {new Date(campaign.scheduledFor).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default CampaignManagement

