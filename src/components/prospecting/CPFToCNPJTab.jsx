import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CPFClientService } from '../../services/CPFClientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Search, Filter, Eye, CheckCircle, XCircle, RefreshCw, TrendingUp, Users, Target, BarChart3, PieChart } from 'lucide-react'
import LineChart from '../dashboard/charts/LineChart'
import BarChart from '../dashboard/charts/BarChart'
import PieChartComponent from '../dashboard/charts/PieChart'

const CPFToCNPJTab = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedClients, setSelectedClients] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    highPotential: 0,
    converted: 0,
    conversionRate: 0
  })
  const [scoreDistribution, setScoreDistribution] = useState([])
  const [chartType, setChartType] = useState('bar')
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    filterClients()
    calculateStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, searchTerm, statusFilter, scoreFilter, priorityFilter])

  const loadClients = async () => {
    setLoading(true)
    try {
      const result = await CPFClientService.getCPFClients({
        limit: 1000,
        orderBy: 'conversion_potential_score',
        orderDirection: 'desc'
      })
      if (result.success) {
        setClients(result.clients || [])
      }
    } catch (error) {
      console.error('Error loading CPF clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = [...clients]

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.cpf?.includes(term) ||
        c.email?.toLowerCase().includes(term)
      )
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Filtro de score
    if (scoreFilter === 'high') {
      filtered = filtered.filter(c => (c.conversion_potential_score || 0) >= 70)
    } else if (scoreFilter === 'medium') {
      filtered = filtered.filter(c => (c.conversion_potential_score || 0) >= 50 && (c.conversion_potential_score || 0) < 70)
    } else if (scoreFilter === 'low') {
      filtered = filtered.filter(c => (c.conversion_potential_score || 0) < 50)
    }

    // Filtro de prioridade
    if (priorityFilter === 'high') {
      filtered = filtered.filter(c => (c.priority || 0) >= 7)
    } else if (priorityFilter === 'medium') {
      filtered = filtered.filter(c => (c.priority || 0) >= 4 && (c.priority || 0) < 7)
    } else if (priorityFilter === 'low') {
      filtered = filtered.filter(c => (c.priority || 0) < 4)
    }

    setFilteredClients(filtered)
  }

  const calculateStats = () => {
    const total = clients.length
    const highPotential = clients.filter(c => (c.conversion_potential_score || 0) >= 70).length
    const converted = clients.filter(c => c.status === 'converted').length
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0

    setStats({ total, highPotential, converted, conversionRate })

    // Distribuição de scores
    const distribution = [0, 0, 0, 0, 0] // 0-20, 21-40, 41-60, 61-80, 81-100
    clients.forEach(c => {
      const score = c.conversion_potential_score || 0
      if (score <= 20) distribution[0]++
      else if (score <= 40) distribution[1]++
      else if (score <= 60) distribution[2]++
      else if (score <= 80) distribution[3]++
      else distribution[4]++
    })
    setScoreDistribution(distribution)

    // Preparar dados para gráficos
    const chartDataFormatted = [
      { range: '0-20', count: distribution[0] },
      { range: '21-40', count: distribution[1] },
      { range: '41-60', count: distribution[2] },
      { range: '61-80', count: distribution[3] },
      { range: '81-100', count: distribution[4] }
    ]
    setChartData(chartDataFormatted)
  }

  const handleClientClick = (clientId) => {
    navigate(`/prospecting/cpf/${clientId}`)
  }

  const handleContact = async (clientId) => {
    try {
      await CPFClientService.updateCPFClientStatus(clientId, 'contacted')
      await loadClients()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const handleConvertToProspect = async (clientId) => {
    try {
      if (confirm('Deseja converter este cliente CPF em um prospect CNPJ?')) {
        await CPFClientService.convertToProspect(clientId)
        await loadClients()
        alert('Cliente convertido para prospect com sucesso!')
      }
    } catch (error) {
      console.error('Error converting to prospect:', error)
      alert('Erro ao converter para prospect')
    }
  }

  const handleReject = async (clientId) => {
    try {
      if (confirm('Deseja rejeitar este cliente CPF?')) {
        await CPFClientService.updateCPFClientStatus(clientId, 'rejected')
        await loadClients()
      }
    } catch (error) {
      console.error('Error rejecting client:', error)
      alert('Erro ao rejeitar cliente')
    }
  }

  const handleAnalyzeSelected = async () => {
    if (selectedClients.length === 0) {
      alert('Selecione pelo menos um cliente para analisar')
      return
    }

    try {
      await CPFClientService.analyzeCPFClients(selectedClients)
      await loadClients()
      setSelectedClients([])
      alert('Análise concluída com sucesso!')
    } catch (error) {
      console.error('Error analyzing clients:', error)
      alert('Erro ao analisar clientes')
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
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
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
        <div className="text-gray-500">Carregando clientes CPF...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de CPFs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alto Potencial</p>
              <p className="text-2xl font-bold text-green-600">{stats.highPotential}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Convertidos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.converted}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-primary-600">{stats.conversionRate}%</p>
            </div>
            <Target className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Gráfico de Distribuição */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Distribuição de Scores de Potencial</h2>
            <div className="flex space-x-1">
              {[
                { id: 'bar', name: 'Barras', icon: BarChart3 },
                { id: 'line', name: 'Linha', icon: TrendingUp },
                { id: 'pie', name: 'Pizza', icon: PieChart }
              ].map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      chartType === type.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title={type.name}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>
          {chartData.length > 0 ? (
            <div style={{ height: '300px' }}>
              {chartType === 'bar' && (
                <BarChart
                  data={chartData}
                  xColumn="range"
                  yColumn="count"
                  title="Distribuição de Scores"
                  height={300}
                />
              )}
              {chartType === 'line' && (
                <LineChart
                  data={chartData}
                  xColumn="range"
                  yColumn="count"
                  title="Distribuição de Scores"
                  height={300}
                />
              )}
              {chartType === 'pie' && (
                <PieChartComponent
                  data={chartData}
                  labelColumn="range"
                  valueColumn="count"
                  title="Distribuição de Scores"
                  height={300}
                />
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos os Status</option>
                <option value="identified">Identificado</option>
                <option value="contacted">Contatado</option>
                <option value="converted">Convertido</option>
                <option value="rejected">Rejeitado</option>
              </select>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos os Scores</option>
                <option value="high">Alto (≥70)</option>
                <option value="medium">Médio (50-69)</option>
                <option value="low">Baixo (&lt;50)</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="high">Alta (≥7)</option>
                <option value="medium">Média (4-6)</option>
                <option value="low">Baixa (&lt;4)</option>
              </select>
            </div>
          </div>
          {selectedClients.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedClients.length} cliente(s) selecionado(s)
              </span>
              <Button
                variant="secondary"
                onClick={handleAnalyzeSelected}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Analisar Selecionados
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Tabela de Clientes */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clientes CPF com Potencial de Conversão</h2>
          
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum cliente CPF encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClients(filteredClients.map(c => c.id))
                          } else {
                            setSelectedClients([])
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação Recomendada</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr 
                      key={client.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleClientClick(client.id)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClients([...selectedClients, client.id])
                            } else {
                              setSelectedClients(selectedClients.filter(id => id !== client.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{client.cpf}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${
                          (client.conversion_potential_score || 0) >= 70 ? 'text-green-600' :
                          (client.conversion_potential_score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {client.conversion_potential_score || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(client.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getRecommendedActionLabel(client.recommended_action)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className={`h-2 w-16 rounded-full ${
                            (client.priority || 0) >= 8 ? 'bg-green-500' :
                            (client.priority || 0) >= 5 ? 'bg-yellow-500' : 'bg-gray-300'
                          }`} style={{ width: `${(client.priority || 0) * 10}%` }} />
                          <span className="ml-2 text-xs text-gray-600">{client.priority || 0}/10</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleClientClick(client.id)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {client.status === 'identified' && (
                            <>
                              <button
                                onClick={() => handleContact(client.id)}
                                className="p-1 text-yellow-600 hover:text-yellow-800"
                                title="Marcar como Contatado"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleConvertToProspect(client.id)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Converter para Prospect"
                              >
                                <Target className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(client.id)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Rejeitar"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
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

export default CPFToCNPJTab

