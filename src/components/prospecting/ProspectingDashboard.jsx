import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ProspectingService } from '../../services/prospectingService'
import Card from '../ui/Card'
import { TrendingUp, Users, Target, CheckCircle, Clock, XCircle } from 'lucide-react'

const ProspectingDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    qualified: 0,
    pending: 0,
    rejected: 0,
    averageScore: 0
  })
  const [recentProspects, setRecentProspects] = useState([])
  const [loading, setLoading] = useState(true)

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

        setStats({
          total: prospects.length,
          qualified,
          pending,
          rejected,
          averageScore: Math.round(averageScore)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Prospecção</h1>
        <p className="text-gray-600">Identifique e qualifique potenciais clientes CNPJ</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

