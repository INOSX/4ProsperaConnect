import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Mail, Phone, FileText, ArrowLeft, Users, Save } from 'lucide-react'

const EditCampaign = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [campaignType, setCampaignType] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [campaignMessage, setCampaignMessage] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCampaign, setLoadingCampaign] = useState(true)

  useEffect(() => {
    if (id) {
      loadCampaign()
    }
  }, [id])

  const loadCampaign = async () => {
    setLoadingCampaign(true)
    try {
      // TODO: Carregar campanha da API
      // Por enquanto, usar dados mockados
      const mockCampaign = {
        id: id,
        name: 'Campanha Email - Alto Potencial',
        type: 'email',
        message: 'Olá! Identificamos que você tem um alto potencial para se tornar um CNPJ/MEI. Entre em contato conosco para conhecer nossos produtos e benefícios exclusivos.',
        scheduledFor: '2024-12-20T09:00',
        clientsCount: 15
      }
      setCampaign(mockCampaign)
      setCampaignType(mockCampaign.type)
      setCampaignName(mockCampaign.name)
      setCampaignMessage(mockCampaign.message)
      if (mockCampaign.scheduledFor) {
        // Converter para formato datetime-local
        const date = new Date(mockCampaign.scheduledFor)
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        setScheduledDate(localDateTime)
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoadingCampaign(false)
    }
  }

  const campaignTypes = [
    {
      id: 'email',
      name: 'Campanha por Email',
      description: 'Envie emails personalizados para os clientes selecionados',
      icon: Mail,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'phone',
      name: 'Campanha por Telefone',
      description: 'Realize ligações para os clientes selecionados',
      icon: Phone,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'letter',
      name: 'Campanha por Carta Convite',
      description: 'Envie cartas convite personalizadas para os clientes',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!campaignType || !campaignName) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      // TODO: Atualizar campanha via API
      console.log('Updating campaign:', {
        id,
        type: campaignType,
        name: campaignName,
        message: campaignMessage,
        scheduledDate
      })
      
      // Simular atualização
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Campanha atualizada com sucesso!')
      navigate(`/campaigns/${id}`)
    } catch (error) {
      console.error('Error updating campaign:', error)
      alert('Erro ao atualizar campanha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingCampaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando campanha...</div>
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
            onClick={() => navigate(`/campaigns/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Campanha</h1>
            <p className="text-gray-600">Atualize as configurações da campanha</p>
          </div>
        </div>
      </div>

      {/* Card de Clientes */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Clientes da Campanha</h3>
              <p className="text-sm text-gray-600">
                {campaign.clientsCount} cliente{campaign.clientsCount !== 1 ? 's' : ''} nesta campanha
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tipo de Campanha</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {campaignTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setCampaignType(type.id)}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    campaignType === type.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${type.color} w-fit mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              )
            })}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Campanha *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ex: Campanha Email - Alto Potencial Dezembro 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem da Campanha
              </label>
              <textarea
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                placeholder="Digite a mensagem que será enviada aos clientes..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Agendamento (Opcional)
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/campaigns/${id}`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !campaignType || !campaignName}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

export default EditCampaign

