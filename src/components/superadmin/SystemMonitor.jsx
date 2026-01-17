import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Database,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  HardDrive,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Card from '../ui/Card'
import Loading from '../ui/Loading'
import { supabase } from '../../services/supabase'

const SystemMonitor = () => {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [slowQueries, setSlowQueries] = useState([])
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 10000) // 10 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadMetrics = async () => {
    try {
      setLoading(true)

      // Métricas do banco
      const stats = await Promise.all([
        // Total de registros por tabela
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('prospects').select('*', { count: 'exact', head: true }),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
        
        // Atividade recente (últimas 24h)
        supabase
          .from('audit_logs')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        
        // Usuários criados nas últimas 24h
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      const metricsData = {
        database: {
          clients: stats[0].count || 0,
          companies: stats[1].count || 0,
          employees: stats[2].count || 0,
          prospects: stats[3].count || 0,
          campaigns: stats[4].count || 0,
          auditLogs: stats[5].count || 0
        },
        activity: {
          last24h: stats[6].data?.length || 0,
          newUsersLast24h: stats[7].count || 0
        },
        performance: {
          avgResponseTime: Math.round(Math.random() * 100 + 50), // Simulado
          uptime: 99.9, // Simulado
          activeConnections: Math.round(Math.random() * 20 + 5) // Simulado
        }
      }

      setMetrics(metricsData)

      // Queries lentas (simulado por enquanto)
      setSlowQueries([
        {
          query: 'SELECT * FROM prospects WHERE...',
          duration: 2534,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          user: 'Super Admin'
        },
        {
          query: 'UPDATE companies SET...',
          duration: 1823,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          user: 'Super Admin'
        }
      ])

    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalRecords = () => {
    if (!metrics) return 0
    return Object.values(metrics.database).reduce((a, b) => a + b, 0)
  }

  const getHealthStatus = () => {
    if (!metrics) return { status: 'unknown', color: 'gray' }
    
    const uptime = metrics.performance.uptime
    if (uptime >= 99.5) return { status: 'Excelente', color: 'green', icon: CheckCircle }
    if (uptime >= 95) return { status: 'Bom', color: 'yellow', icon: AlertCircle }
    return { status: 'Atenção', color: 'red', icon: AlertCircle }
  }

  const health = getHealthStatus()
  const HealthIcon = health.icon

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-500" />
            Monitor do Sistema
          </h1>
          <p className="text-gray-400 mt-1">
            Métricas de performance e saúde do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              autoRefresh
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* System Health */}
      <Card className={`bg-${health.color}-900/20 border-${health.color}-800 p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HealthIcon className={`h-12 w-12 text-${health.color}-500`} />
            <div>
              <h3 className="text-2xl font-bold text-white">Status: {health.status}</h3>
              <p className="text-gray-400 text-sm">
                Uptime: {metrics?.performance.uptime}% • {metrics?.performance.activeConnections} conexões ativas
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Tempo médio de resposta</p>
            <p className="text-3xl font-bold text-white">{metrics?.performance.avgResponseTime}ms</p>
          </div>
        </div>
      </Card>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <Database className="h-10 w-10 text-blue-500" />
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Total de Registros</h3>
          <p className="text-3xl font-bold text-white">{getTotalRecords().toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Todos os registros no banco</p>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-10 w-10 text-green-500" />
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Usuários</h3>
          <p className="text-3xl font-bold text-white">{metrics?.database.clients.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-2">
            +{metrics?.activity.newUsersLast24h} nas últimas 24h
          </p>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="h-10 w-10 text-yellow-500" />
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Atividade (24h)</h3>
          <p className="text-3xl font-bold text-white">{metrics?.activity.last24h}</p>
          <p className="text-xs text-gray-500 mt-2">Ações registradas</p>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Tables */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Registros por Tabela
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {metrics && Object.entries(metrics.database).map(([table, count]) => (
              <div key={table}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400 capitalize">
                    {table.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-white font-semibold">{count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(count / getTotalRecords()) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Slow Queries */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Queries Lentas (últimas 24h)
            </h3>
          </div>
          <div className="divide-y divide-gray-700">
            {slowQueries.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhuma query lenta detectada 🎉
              </div>
            ) : (
              slowQueries.map((query, i) => (
                <div key={i} className="p-4 hover:bg-gray-900/50">
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-xs text-gray-300 flex-1 truncate">
                      {query.query}
                    </code>
                    <span className="text-orange-500 font-bold text-sm ml-2">
                      {query.duration}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{query.user}</span>
                    <span>•</span>
                    <span>{new Date(query.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Métricas de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {metrics?.performance.avgResponseTime}ms
            </div>
            <div className="text-sm text-gray-400">Tempo Médio Resposta</div>
            <div className="mt-2">
              <TrendingDown className="h-4 w-4 text-green-500 mx-auto" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {metrics?.performance.uptime}%
            </div>
            <div className="text-sm text-gray-400">Uptime</div>
            <div className="mt-2">
              <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {metrics?.performance.activeConnections}
            </div>
            <div className="text-sm text-gray-400">Conexões Ativas</div>
            <div className="mt-2">
              <Activity className="h-4 w-4 text-blue-500 mx-auto" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {(getTotalRecords() / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-gray-400">Total Registros</div>
            <div className="mt-2">
              <HardDrive className="h-4 w-4 text-purple-500 mx-auto" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SystemMonitor
