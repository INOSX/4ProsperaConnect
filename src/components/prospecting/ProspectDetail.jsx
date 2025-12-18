import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProspectingService } from '../../services/prospectingService'
import { RecommendationService } from '../../services/recommendationService'
import { ProspectEnrichmentService } from '../../services/ProspectEnrichmentService'
import { AdvancedScoringService } from '../../services/AdvancedScoringService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ArrowLeft, CheckCircle, XCircle, Clock, TrendingUp, Target, Database, BarChart3, ExternalLink, RefreshCw } from 'lucide-react'

const ProspectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prospect, setProspect] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [qualifying, setQualifying] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [enrichmentHistory, setEnrichmentHistory] = useState([])
  const [dataSources, setDataSources] = useState([])
  const [scoringMetrics, setScoringMetrics] = useState(null)
  const [externalData, setExternalData] = useState(null)

  useEffect(() => {
    if (id) {
      loadProspect()
      loadRecommendations()
      loadEnrichmentData()
      loadScoringMetrics()
    }
  }, [id])

  useEffect(() => {
    if (prospect) {
      loadExternalData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospect])

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

  const loadEnrichmentData = async () => {
    try {
      const [historyResult, sourcesResult] = await Promise.all([
        ProspectEnrichmentService.getEnrichmentHistory(id),
        ProspectEnrichmentService.getProspectDataSources(id)
      ])
      if (historyResult.success) {
        setEnrichmentHistory(historyResult.history || [])
      }
      if (sourcesResult.success) {
        setDataSources(sourcesResult.dataSources || [])
      }
    } catch (error) {
      console.error('Error loading enrichment data:', error)
    }
  }

  const loadScoringMetrics = async () => {
    try {
      const { supabase } = await import('../../services/supabase.js')
      const { data, error } = await supabase
        .from('prospect_scoring_metrics')
        .select('*')
        .eq('prospect_id', id)
        .single()

      if (!error && data) {
        setScoringMetrics(data)
      }
    } catch (error) {
      console.error('Error loading scoring metrics:', error)
    }
  }

  const loadExternalData = async () => {
    try {
      // Buscar dados de APIs externas (simulado)
      if (prospect?.cpf || prospect?.cnpj) {
        // Em produção, fazer chamadas reais às APIs
        setExternalData({
          receitaFederal: { situacao: 'ATIVA', data_abertura: '2020-01-15' },
          serasa: { score_credito: 750, score_descricao: 'Bom' },
          creditBureau: { capacidade_pagamento: 'ALTA' }
        })
      }
    } catch (error) {
      console.error('Error loading external data:', error)
    }
  }

  const handleEnrichNow = () => {
    navigate('/prospecting/enrich', { state: { prospectIds: [id] } })
  }

  const handleCalculateScore = async () => {
    try {
      const response = await fetch('/api/prospects/calculate-advanced-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectIds: [id] })
      })

      if (response.ok) {
        await loadScoringMetrics()
        await loadProspect()
        alert('Score calculado com sucesso!')
      }
    } catch (error) {
      console.error('Error calculating score:', error)
      alert('Erro ao calcular score')
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Target },
            { id: 'enrichment', label: 'Enriquecimento', icon: Database },
            { id: 'scoring', label: 'Scoring Detalhado', icon: BarChart3 },
            { id: 'external', label: 'Dados Externos', icon: ExternalLink }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
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
            </>
          )}

          {activeTab === 'enrichment' && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Fontes de Dados</h2>
                    <Button onClick={handleEnrichNow} variant="secondary" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Enriquecer Agora
                    </Button>
                  </div>
                  {dataSources.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhuma fonte de dados vinculada</p>
                  ) : (
                    <div className="space-y-2">
                      {dataSources.map((source) => (
                        <div key={source.id} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{source.source_type}</p>
                              <p className="text-sm text-gray-500">Status: {source.enrichment_status}</p>
                            </div>
                            {source.last_enriched_at && (
                              <p className="text-xs text-gray-400">
                                {new Date(source.last_enriched_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Enriquecimento</h2>
                  {enrichmentHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum histórico de enriquecimento</p>
                  ) : (
                    <div className="space-y-3">
                      {enrichmentHistory.map((entry) => (
                        <div key={entry.id} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">{entry.enrichment_type}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          {entry.enriched_fields && entry.enriched_fields.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Campos enriquecidos: {entry.enriched_fields.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Métricas de Scoring</h2>
                    <Button onClick={handleCalculateScore} variant="secondary" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recalcular
                    </Button>
                  </div>
                  {scoringMetrics ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Probabilidade de Conversão</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {Math.round(scoringMetrics.conversion_probability || 0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">LTV Estimado</p>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {(scoringMetrics.ltv_estimate || 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Risco de Churn</p>
                        <p className={`text-2xl font-bold ${
                          (scoringMetrics.churn_risk || 0) < 30 ? 'text-green-600' :
                          (scoringMetrics.churn_risk || 0) < 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {Math.round(scoringMetrics.churn_risk || 0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Score Combinado</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {Math.round(scoringMetrics.combined_score || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Engagement Score</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {Math.round(scoringMetrics.engagement_score || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Saúde Financeira</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {Math.round(scoringMetrics.financial_health_score || 0)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-4">Nenhuma métrica calculada ainda</p>
                      <Button onClick={handleCalculateScore}>Calcular Métricas</Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'external' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados de APIs Externas</h2>
                {externalData ? (
                  <div className="space-y-4">
                    {externalData.receitaFederal && (
                      <div className="p-4 bg-gray-50 rounded">
                        <h3 className="font-medium text-gray-900 mb-2">Receita Federal</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">Situação:</span> {externalData.receitaFederal.situacao}</p>
                          <p><span className="text-gray-600">Data de Abertura:</span> {externalData.receitaFederal.data_abertura}</p>
                        </div>
                      </div>
                    )}
                    {externalData.serasa && (
                      <div className="p-4 bg-gray-50 rounded">
                        <h3 className="font-medium text-gray-900 mb-2">Serasa</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">Score de Crédito:</span> {externalData.serasa.score_credito}</p>
                          <p><span className="text-gray-600">Descrição:</span> {externalData.serasa.score_descricao}</p>
                        </div>
                      </div>
                    )}
                    {externalData.creditBureau && (
                      <div className="p-4 bg-gray-50 rounded">
                        <h3 className="font-medium text-gray-900 mb-2">Bureau de Crédito</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">Capacidade de Pagamento:</span> {externalData.creditBureau.capacidade_pagamento}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado externo disponível</p>
                )}
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

