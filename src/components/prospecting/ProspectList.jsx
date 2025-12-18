import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProspectingService } from '../../services/prospectingService'
import Card from '../ui/Card'
import { Search, Filter, Download } from 'lucide-react'

const ProspectList = () => {
  const navigate = useNavigate()
  const [prospects, setProspects] = useState([])
  const [filteredProspects, setFilteredProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [ltvFilter, setLtvFilter] = useState('all')
  const [churnFilter, setChurnFilter] = useState('all')
  const [selectedProspects, setSelectedProspects] = useState([])

  useEffect(() => {
    loadProspects()
  }, [])

  useEffect(() => {
    filterProspects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospects, searchTerm, statusFilter, scoreFilter, ltvFilter, churnFilter])

  const loadProspects = async () => {
    setLoading(true)
    try {
      const result = await ProspectingService.getProspects({ limit: 1000 })
      if (result.success) {
        setProspects(result.prospects || [])
      }
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProspects = () => {
    let filtered = [...prospects]

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.cpf?.includes(term) ||
        p.email?.toLowerCase().includes(term)
      )
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.qualification_status === statusFilter)
    }

    // Filtro de score
    if (scoreFilter === 'high') {
      filtered = filtered.filter(p => p.score >= 70)
    } else if (scoreFilter === 'medium') {
      filtered = filtered.filter(p => p.score >= 50 && p.score < 70)
    } else if (scoreFilter === 'low') {
      filtered = filtered.filter(p => p.score < 50)
    }

    // Filtro de LTV
    if (ltvFilter === 'high') {
      filtered = filtered.filter(p => (p.ltv_estimate || 0) >= 100000)
    } else if (ltvFilter === 'medium') {
      filtered = filtered.filter(p => (p.ltv_estimate || 0) >= 50000 && (p.ltv_estimate || 0) < 100000)
    } else if (ltvFilter === 'low') {
      filtered = filtered.filter(p => (p.ltv_estimate || 0) < 50000 && (p.ltv_estimate || 0) > 0)
    }

    // Filtro de churn risk
    if (churnFilter === 'low') {
      filtered = filtered.filter(p => (p.churn_risk || 0) < 30)
    } else if (churnFilter === 'medium') {
      filtered = filtered.filter(p => (p.churn_risk || 0) >= 30 && (p.churn_risk || 0) < 60)
    } else if (churnFilter === 'high') {
      filtered = filtered.filter(p => (p.churn_risk || 0) >= 60)
    }

    setFilteredProspects(filtered)
  }

  const handleProspectClick = (prospectId) => {
    navigate(`/prospecting/${prospectId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando prospects...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Prospects</h1>
          <p className="text-gray-600">Gerencie e qualifique seus prospects</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="qualified">Qualificado</option>
            <option value="rejected">Rejeitado</option>
            <option value="converted">Convertido</option>
          </select>

          {/* Filtro de Score */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="input"
          >
            <option value="all">Todos os Scores</option>
            <option value="high">Alto (≥70)</option>
            <option value="medium">Médio (50-69)</option>
            <option value="low">Baixo (&lt;50)</option>
          </select>

          {/* Filtro de LTV */}
          <select
            value={ltvFilter}
            onChange={(e) => setLtvFilter(e.target.value)}
            className="input"
          >
            <option value="all">Todos os LTVs</option>
            <option value="high">Alto (≥R$ 100k)</option>
            <option value="medium">Médio (R$ 50k-100k)</option>
            <option value="low">Baixo (&lt;R$ 50k)</option>
          </select>

          {/* Filtro de Churn Risk */}
          <select
            value={churnFilter}
            onChange={(e) => setChurnFilter(e.target.value)}
            className="input"
          >
            <option value="all">Todos os Riscos</option>
            <option value="low">Baixo (&lt;30%)</option>
            <option value="medium">Médio (30-60%)</option>
            <option value="high">Alto (≥60%)</option>
          </select>
        </div>
      </Card>

      {/* Lista */}
      <Card>
        <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredProspects.length} prospect{filteredProspects.length !== 1 ? 's' : ''} encontrado{filteredProspects.length !== 1 ? 's' : ''}
          </h2>
          {selectedProspects.length > 0 && (
            <button
              onClick={() => navigate('/prospecting/enrich', { state: { prospectIds: selectedProspects } })}
              className="btn-primary"
            >
              Enriquecer Selecionados ({selectedProspects.length})
            </button>
          )}
        </div>

          {filteredProspects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum prospect encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedProspects.length === filteredProspects.length && filteredProspects.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProspects(filteredProspects.map(p => p.id))
                          } else {
                            setSelectedProspects([])
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">LTV</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Churn Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrichment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProspects.map((prospect) => {
                    const isSelected = selectedProspects.includes(prospect.id)
                    return (
                      <tr
                        key={prospect.id}
                        className={`hover:bg-gray-50 ${isSelected ? 'bg-primary-50' : ''}`}
                      >
                        <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProspects([...selectedProspects, prospect.id])
                              } else {
                                setSelectedProspects(selectedProspects.filter(id => id !== prospect.id))
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td 
                          className="px-4 py-3 text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          {prospect.name}
                        </td>
                        <td 
                          className="px-4 py-3 text-sm text-gray-600 cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          {prospect.cpf}
                        </td>
                        <td 
                          className="px-4 py-3 text-sm text-gray-600 cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          {prospect.email || '-'}
                        </td>
                        <td 
                          className="px-4 py-3 text-sm cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          <span className={`font-medium ${
                            prospect.score >= 70 ? 'text-green-600' :
                            prospect.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {prospect.score || 0}
                          </span>
                        </td>
                        <td 
                          className="px-4 py-3 text-sm cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          {prospect.ltv_estimate ? (
                            <span className="font-medium text-gray-900">
                              R$ {(prospect.ltv_estimate / 1000).toFixed(0)}k
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td 
                          className="px-4 py-3 text-sm cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          {prospect.churn_risk !== null && prospect.churn_risk !== undefined ? (
                            <span className={`font-medium ${
                              prospect.churn_risk < 30 ? 'text-green-600' :
                              prospect.churn_risk < 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {prospect.churn_risk}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td 
                          className="px-4 py-3 text-sm cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            prospect.enrichment_status === 'enriched' ? 'bg-green-100 text-green-800' :
                            prospect.enrichment_status === 'enriching' ? 'bg-yellow-100 text-yellow-800' :
                            prospect.enrichment_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {prospect.enrichment_status === 'enriched' ? 'Enriquecido' :
                             prospect.enrichment_status === 'enriching' ? 'Enriquecendo' :
                             prospect.enrichment_status === 'failed' ? 'Erro' : 'Não Enriquecido'}
                          </span>
                        </td>
                        <td 
                          className="px-4 py-3 text-sm cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            prospect.qualification_status === 'qualified' ? 'bg-green-100 text-green-800' :
                            prospect.qualification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            prospect.qualification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {prospect.qualification_status === 'qualified' ? 'Qualificado' :
                             prospect.qualification_status === 'pending' ? 'Pendente' :
                             prospect.qualification_status === 'rejected' ? 'Rejeitado' : 'Convertido'}
                          </span>
                        </td>
                        <td 
                          className="px-4 py-3 text-sm cursor-pointer"
                          onClick={() => handleProspectClick(prospect.id)}
                        >
                          <div className="flex items-center">
                            <div className={`h-2 w-16 rounded-full ${
                              prospect.priority >= 8 ? 'bg-green-500' :
                              prospect.priority >= 5 ? 'bg-yellow-500' : 'bg-gray-300'
                            }`} style={{ width: `${(prospect.priority || 0) * 10}%` }} />
                            <span className="ml-2 text-xs text-gray-600">{prospect.priority || 0}/10</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProspectClick(prospect.id)
                            }}
                            className="text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ProspectList

