import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ProspectingService } from '../../services/prospectingService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { TrendingUp, Users, Target, CheckCircle, Clock, XCircle, DollarSign, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react'

const ProspectingDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    qualified: 0,
    pending: 0,
    rejected: 0,
    averageScore: 0,
    averageLTV: 0,
    averageChurnRisk: 0,
    totalLTV: 0
  })
  const [recentProspects, setRecentProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [scoreDistribution, setScoreDistribution] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Buscar todos os prospects
      const result = await ProspectingService.getProspects({ limit: 1000 })
      
      if (result.success) {
        const prospects = result.prospects || []
        
        // Calcular estatísticas
        const qualified = prospects.filter(p => p.qualification_status === 'qualified').length
        const pending = prospects.filter(p => p.qualification_status === 'pending').length
        const rejected = prospects.filter(p => p.qualification_status === 'rejected').length
        const averageScore = prospects.length > 0
          ? prospects.reduce((sum, p) => sum + (p.score || 0), 0) / prospects.length
          : 0

        const ltvs = prospects.map(p => p.ltv_estimate || 0).filter(l => l > 0)
        const averageLTV = ltvs.length > 0
          ? ltvs.reduce((sum, l) => sum + l, 0) / ltvs.length
          : 0
        const totalLTV = ltvs.reduce((sum, l) => sum + l, 0)

        const churnRisks = prospects.map(p => p.churn_risk || 0).filter(c => c > 0)
        const averageChurnRisk = churnRisks.length > 0
          ? churnRisks.reduce((sum, c) => sum + c, 0) / churnRisks.length
          : 0

        // Distribuição de scores
        const distribution = [0, 0, 0, 0, 0] // 0-20, 21-40, 41-60, 61-80, 81-100
        prospects.forEach(p => {
          const score = p.score || 0
          if (score <= 20) distribution[0]++
          else if (score <= 40) distribution[1]++
          else if (score <= 60) distribution[2]++
          else if (score <= 80) distribution[3]++
          else distribution[4]++
        })
        setScoreDistribution(distribution)

        setStats({
          total: prospects.length,
          qualified,
          pending,
          rejected,
          averageScore: Math.round(averageScore),
          averageLTV: Math.round(averageLTV),
          averageChurnRisk: Math.round(averageChurnRisk),
          totalLTV: Math.round(totalLTV)
        })

        // Prospects recentes ordenados por prioridade
        setRecentProspects(
          prospects
            .sort((a, b) => (b.priority || 0) - (a.priority || 0))
            .slice(0, 10)
        )
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Prospecção</h1>
          <p className="text-gray-600">Identifique e qualifique potenciais clientes CNPJ</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/prospecting/enrich')}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Enriquecer Prospects
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/prospecting/list')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Lista Completa
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Prospects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Qualificados</p>
              <p className="text-2xl font-bold text-green-600">{stats.qualified}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejeitados</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score Médio</p>
              <p className="text-2xl font-bold text-primary-600">{stats.averageScore}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">LTV Médio</p>
              <p className="text-2xl font-bold text-green-600">R$ {(stats.averageLTV / 1000).toFixed(0)}k</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risco Churn Médio</p>
              <p className={`text-2xl font-bold ${
                stats.averageChurnRisk < 30 ? 'text-green-600' :
                stats.averageChurnRisk < 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stats.averageChurnRisk}%
              </p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${
              stats.averageChurnRisk < 30 ? 'text-green-600' :
              stats.averageChurnRisk < 60 ? 'text-yellow-600' : 'text-red-600'
            }`} />
          </div>
        </Card>
      </div>

      {/* Gráficos e Visualizações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Scores */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Scores</h2>
            <div className="space-y-2">
              {[
                { label: '0-20', count: scoreDistribution[0], color: 'bg-red-500' },
                { label: '21-40', count: scoreDistribution[1], color: 'bg-orange-500' },
                { label: '41-60', count: scoreDistribution[2], color: 'bg-yellow-500' },
                { label: '61-80', count: scoreDistribution[3], color: 'bg-green-500' },
                { label: '81-100', count: scoreDistribution[4], color: 'bg-primary-600' }
              ].map((range, index) => {
                const maxCount = Math.max(...scoreDistribution, 1)
                const percentage = maxCount > 0 ? (range.count / maxCount) * 100 : 0
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-gray-600">{range.label}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${range.color} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-sm font-medium text-gray-900 text-right">
                      {range.count}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Métricas de Valor */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Valor</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">LTV Total Estimado</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {(stats.totalLTV / 1000000).toFixed(2)}M
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">LTV Médio por Prospect</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {(stats.averageLTV / 1000).toFixed(0)}k
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Taxa de Qualificação</p>
                <p className="text-2xl font-semibold text-primary-600">
                  {stats.total > 0 ? Math.round((stats.qualified / stats.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Prospects Recentes */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Prospects em Destaque</h2>
          
          {recentProspects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum prospect encontrado</p>
              <p className="text-sm mt-2">Faça upload de dados ou configure integrações para identificar prospects</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProspects.map((prospect) => (
                    <tr key={prospect.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{prospect.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{prospect.cpf}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${
                          prospect.score >= 70 ? 'text-green-600' :
                          prospect.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {prospect.score || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          prospect.qualification_status === 'qualified' ? 'bg-green-100 text-green-800' :
                          prospect.qualification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prospect.qualification_status === 'qualified' ? 'Qualificado' :
                           prospect.qualification_status === 'pending' ? 'Pendente' : 'Rejeitado'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className={`h-2 w-16 rounded-full ${
                            prospect.priority >= 8 ? 'bg-green-500' :
                            prospect.priority >= 5 ? 'bg-yellow-500' : 'bg-gray-300'
                          }`} style={{ width: `${(prospect.priority || 0) * 10}%` }} />
                          <span className="ml-2 text-xs text-gray-600">{prospect.priority || 0}/10</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ProspectingDashboard

