import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProspectingService } from '../../services/prospectingService'
import { RecommendationService } from '../../services/recommendationService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ArrowLeft, CheckCircle, XCircle, Clock, TrendingUp, Target } from 'lucide-react'

const ProspectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prospect, setProspect] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [qualifying, setQualifying] = useState(false)

  useEffect(() => {
    if (id) {
      loadProspect()
      loadRecommendations()
    }
  }, [id])

  const loadProspect = async () => {
    setLoading(true)
    try {
      const result = await ProspectingService.getProspect(id)
      if (result.success) {
        setProspect(result.prospect)
      }
    } catch (error) {
      console.error('Error loading prospect:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      const result = await RecommendationService.getRecommendations('prospect', id)
      if (result.success) {
        setRecommendations(result.recommendations || [])
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const handleQualify = async () => {
    setQualifying(true)
    try {
      const result = await ProspectingService.qualifyProspects([id], prospect.created_by)
      if (result.success) {
        await loadProspect()
      }
    } catch (error) {
      console.error('Error qualifying prospect:', error)
    } finally {
      setQualifying(false)
    }
  }

  const handleGenerateRecommendations = async () => {
    try {
      const result = await ProspectingService.recommendProducts(id, true)
      if (result.success) {
        await loadRecommendations()
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!prospect) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Prospect não encontrado</p>
        <Button onClick={() => navigate('/prospecting')} className="mt-4">
          Voltar para lista
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/prospecting')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{prospect.name}</h1>
            <p className="text-gray-600">Detalhes do prospect</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {prospect.qualification_status === 'pending' && (
            <Button onClick={handleQualify} loading={qualifying}>
              Qualificar
            </Button>
          )}
          <Button variant="secondary" onClick={handleGenerateRecommendations}>
            Gerar Recomendações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Básicos */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="text-base font-medium text-gray-900">{prospect.cpf}</p>
                </div>
                {prospect.cnpj && (
                  <div>
                    <p className="text-sm text-gray-600">CNPJ</p>
                    <p className="text-base font-medium text-gray-900">{prospect.cnpj}</p>
                  </div>
                )}
                {prospect.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base font-medium text-gray-900">{prospect.email}</p>
                  </div>
                )}
                {prospect.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="text-base font-medium text-gray-900">{prospect.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Score e Status */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Qualificação</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Score</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`text-3xl font-bold ${
                      prospect.score >= 70 ? 'text-green-600' :
                      prospect.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {prospect.score || 0}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            prospect.score >= 70 ? 'bg-green-600' :
                            prospect.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${prospect.score || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${
                    prospect.qualification_status === 'qualified' ? 'bg-green-100 text-green-800' :
                    prospect.qualification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {prospect.qualification_status === 'qualified' ? 'Qualificado' :
                     prospect.qualification_status === 'pending' ? 'Pendente' : 'Rejeitado'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prioridade</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-primary-600 rounded-full"
                          style={{ width: `${(prospect.priority || 0) * 10}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-base font-medium text-gray-900">{prospect.priority || 0}/10</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Probabilidade de Conversão</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {Math.round((prospect.conversion_probability || 0) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Sinais de Mercado */}
          {prospect.market_signals && Object.keys(prospect.market_signals).length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sinais de Mercado</h2>
                <div className="space-y-2">
                  {Object.entries(prospect.market_signals).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recomendações */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recomendações</h2>
                <Button variant="secondary" size="sm" onClick={handleGenerateRecommendations}>
                  Gerar
                </Button>
              </div>
              
              {recommendations.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma recomendação ainda</p>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Prioridade: {rec.priority}/10</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => RecommendationService.trackRecommendation(rec.id, 'accepted')}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Aceitar
                          </button>
                          <button
                            onClick={() => RecommendationService.trackRecommendation(rec.id, 'rejected')}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full" onClick={handleQualify} loading={qualifying}>
                  Qualificar Prospect
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleGenerateRecommendations}>
                  Gerar Recomendações
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProspectDetail

