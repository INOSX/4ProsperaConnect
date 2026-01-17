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
  Eye,
  RefreshCw,
  Clock,
  TrendingUp,
  BarChart3,
  X,
  Loader2
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
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    loadAuditLogs()
    loadStats()
  }, [actionFilter, dateRange, limit])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      console.log('🔍 [AuditLog] Carregando logs...', { limit, actionFilter, dateRange })
      
      const data = await superAdminService.getRecentActivity({
        limit,
        action: actionFilter || null,
        startDate: dateRange.start || null,
        endDate: dateRange.end || null
      })
      
      console.log('✅ [AuditLog] Logs carregados:', data.length)
      setLogs(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('❌ [AuditLog] Erro ao carregar audit logs:', error)
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
      console.log('📊 [AuditLog] Stats carregadas:', data)
      setStats(data)
    } catch (error) {
      console.error('❌ [AuditLog] Erro ao carregar stats:', error)
    }
  }

  const actionIcons = {
    UPDATE_USER_ROLE: Shield,
    TOGGLE_USER_STATUS: Activity,
    CREATE_USER: Plus,
    DELETE_USER: Trash2,
    UPDATE_COMPANY: Edit,
    VIEW_DETAILS: Eye,
    SQL_CONSOLE_QUERY: FileText,
    DEFAULT: FileText
  }

  const actionColors = {
    UPDATE_USER_ROLE: { icon: 'text-blue-400', bg: 'bg-blue-600/20', border: 'border-blue-500/30', shadow: 'hover:shadow-blue-500/20' },
    TOGGLE_USER_STATUS: { icon: 'text-yellow-400', bg: 'bg-yellow-600/20', border: 'border-yellow-500/30', shadow: 'hover:shadow-yellow-500/20' },
    CREATE_USER: { icon: 'text-green-400', bg: 'bg-green-600/20', border: 'border-green-500/30', shadow: 'hover:shadow-green-500/20' },
    DELETE_USER: { icon: 'text-red-400', bg: 'bg-red-600/20', border: 'border-red-500/30', shadow: 'hover:shadow-red-500/20' },
    UPDATE_COMPANY: { icon: 'text-purple-400', bg: 'bg-purple-600/20', border: 'border-purple-500/30', shadow: 'hover:shadow-purple-500/20' },
    VIEW_DETAILS: { icon: 'text-gray-400', bg: 'bg-gray-600/20', border: 'border-gray-500/30', shadow: 'hover:shadow-gray-500/20' },
    SQL_CONSOLE_QUERY: { icon: 'text-orange-400', bg: 'bg-orange-600/20', border: 'border-orange-500/30', shadow: 'hover:shadow-orange-500/20' },
    DEFAULT: { icon: 'text-gray-400', bg: 'bg-gray-600/20', border: 'border-gray-500/30', shadow: 'hover:shadow-gray-500/20' }
  }

  const actionLabels = {
    UPDATE_USER_ROLE: 'Atualização de Role',
    TOGGLE_USER_STATUS: 'Alteração de Status',
    CREATE_USER: 'Criação de Usuário',
    DELETE_USER: 'Exclusão de Usuário',
    UPDATE_COMPANY: 'Atualização de Empresa',
    VIEW_DETAILS: 'Visualização de Detalhes',
    SQL_CONSOLE_QUERY: 'Execução de Query SQL'
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

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      getActionLabel(log.action).toLowerCase().includes(searchLower) ||
      log.user?.email?.toLowerCase().includes(searchLower) ||
      log.resource_type?.toLowerCase().includes(searchLower)
    )
  })

  const clearFilters = () => {
    setActionFilter('')
    setDateRange({ start: '', end: '' })
    setSearchTerm('')
  }

  const hasActiveFilters = actionFilter || dateRange.start || dateRange.end || searchTerm

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Moderno com Gradiente */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-700 bg-clip-text text-transparent flex items-center gap-3">
            <FileText className="h-10 w-10 text-indigo-500 drop-shadow-glow" />
            Audit Log
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">
            Registro completo de todas as ações realizadas no sistema
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <button
          onClick={loadAuditLogs}
          disabled={loading}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/50 hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-indigo-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-indigo-600/20 rounded-xl">
                <Activity className="h-8 w-8 text-indigo-400" />
              </div>
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">Total de Ações</p>
            <p className="text-5xl font-black text-white drop-shadow-glow">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <Filter className="h-8 w-8 text-purple-400" />
              </div>
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">Tipos de Ação</p>
            <p className="text-5xl font-black text-white drop-shadow-glow">{Object.keys(stats.byAction).length}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">Dias Ativos</p>
            <p className="text-5xl font-black text-white drop-shadow-glow">{Object.keys(stats.byDay).length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-green-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <BarChart3 className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">Média/Dia</p>
            <p className="text-5xl font-black text-white drop-shadow-glow">
              {Object.keys(stats.byDay).length > 0 
                ? Math.round(stats.total / Object.keys(stats.byDay).length)
                : 0
              }
            </p>
          </div>
        </div>
      )}

      {/* Filtros Modernos */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ação, usuário ou recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-20 py-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-lg font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-300" />
            </button>
          )}
        </div>

        {/* Filtros Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Action Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="">Todas as ações</option>
              {allActions.map(action => (
                <option key={action} value={action}>{getActionLabel(action)}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
              placeholder="Data início"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
              placeholder="Data fim"
            />
          </div>

          {/* Limit */}
          <div className="relative">
            <BarChart3 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
            >
              <option value={20}>20 registros</option>
              <option value={50}>50 registros</option>
              <option value={100}>100 registros</option>
              <option value={200}>200 registros</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full py-3 bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 hover:from-red-600/30 hover:to-red-800/30 text-red-300 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold"
          >
            <X className="h-5 w-5" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Logs Timeline */}
      {loading ? (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-16 border border-gray-700 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-300 text-lg font-medium">Carregando audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-16 border border-gray-700">
          <div className="text-center">
            <AlertCircle className="h-20 w-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum registro encontrado</h3>
            <p className="text-gray-400 text-lg">Tente ajustar os filtros ou período de busca</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-semibold"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <p>Exibindo <span className="font-bold text-white">{filteredLogs.length}</span> {filteredLogs.length === 1 ? 'registro' : 'registros'}</p>
            {searchTerm && (
              <p>Buscando por: <span className="font-bold text-indigo-400">"{searchTerm}"</span></p>
            )}
          </div>

          {filteredLogs.map((log, index) => {
            const Icon = getActionIcon(log.action)
            const colors = getActionColor(log.action)
            
            return (
              <div 
                key={log.id} 
                className={`bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border ${colors.border} hover:scale-[1.01] transition-all hover:shadow-xl ${colors.shadow} animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-4 rounded-2xl ${colors.bg}`}>
                      <Icon className={`h-8 w-8 ${colors.icon}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {getActionLabel(log.action)}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-300 font-medium">
                              {log.user?.email || 'Sistema'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium whitespace-nowrap">
                              {new Date(log.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Resource Info */}
                      {log.resource_type && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs font-semibold">
                            {log.resource_type}
                          </span>
                          {log.resource_id && (
                            <span className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-lg text-xs font-mono">
                              ID: {log.resource_id}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Details */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-3 p-4 bg-gray-900/80 border border-gray-700 rounded-xl">
                          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Detalhes da Operação:</p>
                          <pre className="text-xs text-gray-300 overflow-x-auto font-mono">
{JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}

export default AuditLog
