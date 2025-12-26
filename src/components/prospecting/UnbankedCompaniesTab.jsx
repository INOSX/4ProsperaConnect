import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UnbankedCompanyService } from '../../services/UnbankedCompanyService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Search, Filter, Eye, CheckCircle, XCircle, RefreshCw, TrendingUp, Building2, Target, BarChart3, PieChart, Mail, DollarSign, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import LineChart from '../dashboard/charts/LineChart'
import BarChart from '../dashboard/charts/BarChart'
import PieChartComponent from '../dashboard/charts/PieChart'

const UnbankedCompaniesTab = () => {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [bankingStatusFilter, setBankingStatusFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    notBanked: 0,
    partial: 0,
    converted: 0,
    conversionRate: 0,
    totalRevenue: 0
  })
  const [scoreDistribution, setScoreDistribution] = useState([])
  const [chartType, setChartType] = useState('bar')
  const [chartData, setChartData] = useState([])
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    filterCompanies()
    calculateStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, searchTerm, bankingStatusFilter, statusFilter, scoreFilter, industryFilter, priorityFilter])

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const result = await UnbankedCompanyService.getUnbankedCompanies({
        limit: 1000,
        orderBy: 'identification_score',
        orderDirection: 'desc'
      })
      if (result.success) {
        setCompanies(result.companies || [])
      }
    } catch (error) {
      console.error('Error loading unbanked companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCompanies = () => {
    let filtered = [...companies]

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.company_name?.toLowerCase().includes(term) ||
        c.trade_name?.toLowerCase().includes(term) ||
        c.cnpj?.includes(term) ||
        c.industry?.toLowerCase().includes(term)
      )
    }

    // Filtro de status bancário
    if (bankingStatusFilter !== 'all') {
      filtered = filtered.filter(c => c.banking_status === bankingStatusFilter)
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Filtro de score
    if (scoreFilter === 'high') {
      filtered = filtered.filter(c => (c.identification_score || 0) >= 70)
    } else if (scoreFilter === 'medium') {
      filtered = filtered.filter(c => (c.identification_score || 0) >= 50 && (c.identification_score || 0) < 70)
    } else if (scoreFilter === 'low') {
      filtered = filtered.filter(c => (c.identification_score || 0) < 50)
    }

    // Filtro de indústria
    if (industryFilter !== 'all') {
      filtered = filtered.filter(c => c.industry === industryFilter)
    }

    // Filtro de prioridade
    if (priorityFilter === 'high') {
      filtered = filtered.filter(c => (c.priority || 0) >= 7)
    } else if (priorityFilter === 'medium') {
      filtered = filtered.filter(c => (c.priority || 0) >= 4 && (c.priority || 0) < 7)
    } else if (priorityFilter === 'low') {
      filtered = filtered.filter(c => (c.priority || 0) < 4)
    }

    setFilteredCompanies(filtered)
  }

  const calculateStats = () => {
    const total = companies.length
    const notBanked = companies.filter(c => c.banking_status === 'not_banked').length
    const partial = companies.filter(c => c.banking_status === 'partial').length
    const converted = companies.filter(c => c.status === 'converted').length
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0
    const totalRevenue = companies.reduce((sum, c) => sum + (parseFloat(c.revenue_estimate) || 0), 0)

    setStats({ total, notBanked, partial, converted, conversionRate, totalRevenue })

    // Distribuição de scores
    const distribution = [0, 0, 0, 0, 0] // 0-20, 21-40, 41-60, 61-80, 81-100
    companies.forEach(c => {
      const score = c.identification_score || 0
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

  const handleCompanyClick = (companyId) => {
    navigate(`/prospecting/unbanked/${companyId}`)
  }

  const handleContact = async (companyId) => {
    try {
      await UnbankedCompanyService.updateCompanyStatus(companyId, 'contacted')
      await loadCompanies()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const handleConvertToClient = async (companyId) => {
    try {
      if (confirm('Deseja converter esta empresa em um cliente do banco?')) {
        await UnbankedCompanyService.convertToClient(companyId)
        await loadCompanies()
        alert('Empresa convertida para cliente com sucesso!')
      }
    } catch (error) {
      console.error('Error converting to client:', error)
      alert('Erro ao converter para cliente')
    }
  }

  const handleReject = async (companyId) => {
    try {
      if (confirm('Deseja rejeitar esta empresa?')) {
        await UnbankedCompanyService.updateCompanyStatus(companyId, 'rejected')
        await loadCompanies()
      }
    } catch (error) {
      console.error('Error rejecting company:', error)
      alert('Erro ao rejeitar empresa')
    }
  }

  const handleAnalyzeSelected = async () => {
    if (selectedCompanies.length === 0) {
      alert('Selecione pelo menos uma empresa para analisar')
      return
    }

    try {
      await UnbankedCompanyService.calculatePotential(selectedCompanies)
      await loadCompanies()
      setSelectedCompanies([])
      alert('Análise concluída com sucesso!')
    } catch (error) {
      console.error('Error analyzing companies:', error)
      alert('Erro ao analisar empresas')
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
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
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
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando empresas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" data-tour-id="unbanked-stats">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Não Bancarizadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.notBanked}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Subexploradas</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.partial}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Convertidas</p>
              <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Estimada</p>
              <p className="text-2xl font-bold text-primary-600">
                R$ {(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Gráfico de Distribuição */}
      <Card>
        <div className="p-6" data-tour-id="unbanked-chart">
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
        <div className="p-4" data-tour-id="unbanked-filters">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por CNPJ, nome, setor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={bankingStatusFilter}
                onChange={(e) => setBankingStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos os Status Bancários</option>
                <option value="not_banked">Não Bancarizada</option>
                <option value="partial">Subexplorada</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos os Status</option>
                <option value="identified">Identificada</option>
                <option value="contacted">Contatada</option>
                <option value="converted">Convertida</option>
                <option value="rejected">Rejeitada</option>
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
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos os Setores</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
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
          {selectedCompanies.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedCompanies.length} empresa(s) selecionada(s)
              </span>
              <Button
                variant="secondary"
                onClick={handleAnalyzeSelected}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Analisar Selecionadas
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Botão de Campanhas e Tabela de Empresas */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Empresas Não Bancarizadas ou Subexploradas</h2>
            <Button
              variant="primary"
              onClick={() => navigate('/campaigns', { state: { selectedCompanies } })}
              disabled={selectedCompanies.length === 0}
              data-tour-id="unbanked-campaigns"
            >
              <Mail className="h-4 w-4 mr-2" />
              Campanhas ({selectedCompanies.length})
            </Button>
          </div>
          
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma empresa encontrada</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto" data-tour-id="unbanked-table">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompanies(filteredCompanies.map(c => c.id))
                            } else {
                              setSelectedCompanies([])
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Setor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Bancário</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtos Atuais</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtos Recomendados</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies
                      .slice(
                        pageSize === -1 ? 0 : (currentPage - 1) * pageSize,
                        pageSize === -1 ? filteredCompanies.length : currentPage * pageSize
                      )
                      .map((company) => (
                      <tr 
                        key={company.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleCompanyClick(company.id)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedCompanies.includes(company.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCompanies([...selectedCompanies, company.id])
                              } else {
                                setSelectedCompanies(selectedCompanies.filter(id => id !== company.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{company.cnpj}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {company.trade_name || company.company_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{company.industry || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {getBankingStatusBadge(company.banking_status)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${
                            (company.identification_score || 0) >= 70 ? 'text-green-600' :
                            (company.identification_score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {company.identification_score || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {(company.products_contracted || []).length > 0 
                            ? (company.products_contracted || []).slice(0, 2).join(', ') + 
                              ((company.products_contracted || []).length > 2 ? '...' : '')
                            : 'Nenhum'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {(company.potential_products || []).slice(0, 3).join(', ')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <div className={`h-2 w-16 rounded-full ${
                              (company.priority || 0) >= 8 ? 'bg-green-500' :
                              (company.priority || 0) >= 5 ? 'bg-yellow-500' : 'bg-gray-300'
                            }`} style={{ width: `${(company.priority || 0) * 10}%` }} />
                            <span className="ml-2 text-xs text-gray-600">{company.priority || 0}/10</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()} data-tour-id="unbanked-actions">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCompanyClick(company.id)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {company.status === 'identified' && (
                              <>
                                <button
                                  onClick={() => handleContact(company.id)}
                                  className="p-1 text-yellow-600 hover:text-yellow-800"
                                  title="Marcar como Contatada"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleConvertToClient(company.id)}
                                  className="p-1 text-green-600 hover:text-green-800"
                                  title="Converter para Cliente"
                                >
                                  <Target className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(company.id)}
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
              
              {/* Paginação */}
              {filteredCompanies.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Mostrar:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={-1}>Todos</option>
                    </select>
                    <span className="text-sm text-gray-600">
                      de {filteredCompanies.length} registros
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {Math.ceil(filteredCompanies.length / (pageSize === -1 ? filteredCompanies.length : pageSize))}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredCompanies.length / (pageSize === -1 ? filteredCompanies.length : pageSize)), prev + 1))}
                      disabled={currentPage >= Math.ceil(filteredCompanies.length / (pageSize === -1 ? filteredCompanies.length : pageSize))}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

export default UnbankedCompaniesTab

