import React, { useEffect, useState } from 'react'
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Shield,
  Edit,
  Trash2,
  Plus,
  Eye
} from 'lucide-react'
import Card from '../ui/Card'
import Loading from '../ui/Loading'
import superAdminService from '../../services/superAdminService'

const AuditLog = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [stats, setStats] = useState(null)
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    loadAuditLogs()
    loadStats()
  }, [actionFilter, dateRange, limit])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      const data = await superAdminService.getRecentActivity({
        limit,
        action: actionFilter || null,
        startDate: dateRange.start || null,
        endDate: dateRange.end || null
      })
      setLogs(data)
    } catch (error) {
      console.error('Erro ao carregar audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await superAdminService.getAuditStats({
        startDate: dateRange.start || null,
        endDate: dateRange.end || null
      })
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }

  const actionIcons = {
    UPDATE_USER_ROLE: Shield,
    TOGGLE_USER_STATUS: Activity,
    CREATE_USER: Plus,
    DELETE_USER: Trash2,
    UPDATE_COMPANY: Edit,
    VIEW_DETAILS: Eye,
    DEFAULT: FileText
  }

  const actionColors = {
    UPDATE_USER_ROLE: 'text-blue-500 bg-blue-500/10',
    TOGGLE_USER_STATUS: 'text-yellow-500 bg-yellow-500/10',
    CREATE_USER: 'text-green-500 bg-green-500/10',
    DELETE_USER: 'text-red-500 bg-red-500/10',
    UPDATE_COMPANY: 'text-purple-500 bg-purple-500/10',
    VIEW_DETAILS: 'text-gray-500 bg-gray-500/10',
    DEFAULT: 'text-gray-500 bg-gray-500/10'
  }

  const actionLabels = {
    UPDATE_USER_ROLE: 'Atualização de Role',
    TOGGLE_USER_STATUS: 'Alteração de Status',
    CREATE_USER: 'Criação de Usuário',
    DELETE_USER: 'Exclusão de Usuário',
    UPDATE_COMPANY: 'Atualização de Empresa',
    VIEW_DETAILS: 'Visualização de Detalhes'
  }

  const getActionIcon = (action) => {
    const Icon = actionIcons[action] || actionIcons.DEFAULT
    return Icon
  }

  const getActionColor = (action) => {
    return actionColors[action] || actionColors.DEFAULT
  }

  const getActionLabel = (action) => {
    return actionLabels[action] || action
  }

  const allActions = Object.keys(actionLabels)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-500" />
            Audit Log
          </h1>
          <p className="text-gray-400 mt-1">
            Registro de todas as ações realizadas no sistema
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Ações</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <Activity className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tipos de Ação</p>
                <p className="text-3xl font-bold text-white mt-1">{Object.keys(stats.byAction).length}</p>
              </div>
              <Filter className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Dias Ativos</p>
                <p className="text-3xl font-bold text-white mt-1">{Object.keys(stats.byDay).length}</p>
              </div>
              <Calendar className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Média/Dia</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {Object.keys(stats.byDay).length > 0 
                    ? Math.round(stats.total / Object.keys(stats.byDay).length)
                    : 0
                  }
                </p>
              </div>
              <Activity className="h-12 w-12 text-orange-500 opacity-20" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Todas as ações</option>
              {allActions.map(action => (
                <option key={action} value={action}>{getActionLabel(action)}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Data início"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Data fim"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm text-gray-400">Limite:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </Card>

      {/* Logs Timeline */}
      {loading ? (
        <Card className="bg-gray-800 border-gray-700 p-12">
          <div className="flex justify-center">
            <Loading />
          </div>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum registro encontrado</h3>
            <p className="text-gray-400">Tente ajustar os filtros</p>
          </div>
        </Card>
      ) : (
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-700">
            {logs.map((log) => {
              const Icon = getActionIcon(log.action)
              const colorClass = getActionColor(log.action)
              
              return (
                <div key={log.id} className="p-6 hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-3 rounded-lg ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {getActionLabel(log.action)}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Por: {log.user?.email || 'Sistema'}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      {/* Details */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">Detalhes:</p>
                          <pre className="text-xs text-gray-300 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Resource Info */}
                      {log.resource_type && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-900 rounded">
                            {log.resource_type}
                          </span>
                          {log.resource_id && (
                            <span className="font-mono">ID: {log.resource_id}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AuditLog
