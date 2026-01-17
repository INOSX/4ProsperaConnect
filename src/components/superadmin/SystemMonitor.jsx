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
  CheckCircle,
  Cpu,
  Server,
  BarChart3,
  Gauge,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react'
import Card from '../ui/Card'
import Loading from '../ui/Loading'
import { supabase } from '../../services/supabase'

const SystemMonitor = () => {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [slowQueries, setSlowQueries] = useState([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    loadMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadMetrics()
        setLastUpdate(new Date())
      }, 10000) // 10 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      console.log('🔍 [SystemMonitor] Carregando métricas...')

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
          activeConnections: Math.round(Math.random() * 20 + 5), // Simulado
          cpuUsage: Math.round(Math.random() * 30 + 20), // Simulado
          memoryUsage: Math.round(Math.random() * 40 + 30), // Simulado
          storageUsage: Math.round(Math.random() * 50 + 30) // Simulado
        }
      }

      setMetrics(metricsData)
      console.log('✅ [SystemMonitor] Métricas carregadas:', metricsData)

      // Queries lentas (simulado por enquanto)
      setSlowQueries([
        {
          query: 'SELECT * FROM prospects WHERE status = \'active\' AND...',
          duration: 2534,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          user: 'Super Admin'
        },
        {
          query: 'UPDATE companies SET annual_revenue = ... WHERE...',
          duration: 1823,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          user: 'Bank Manager'
        },
        {
          query: 'INSERT INTO audit_logs (action, user_id, ...) VALUES...',
          duration: 1245,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          user: 'Company Manager'
        }
      ])

    } catch (error) {
      console.error('❌ [SystemMonitor] Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalRecords = () => {
    if (!metrics) return 0
    return Object.values(metrics.database).reduce((a, b) => a + b, 0)
  }

  const getHealthStatus = () => {
    if (!metrics) return { status: 'Desconhecido', color: 'gray', icon: AlertCircle, bgColor: 'gray-600', textColor: 'gray-300' }
    
    const uptime = metrics.performance.uptime
    if (uptime >= 99.5) return { 
      status: 'Excelente', 
      color: 'green', 
      icon: CheckCircle,
      bgColor: 'green-600',
      textColor: 'green-300'
    }
    if (uptime >= 95) return { 
      status: 'Bom', 
      color: 'yellow', 
      icon: AlertCircle,
      bgColor: 'yellow-600',
      textColor: 'yellow-300'
    }
    return { 
      status: 'Atenção', 
      color: 'red', 
      icon: AlertCircle,
      bgColor: 'red-600',
      textColor: 'red-300'
    }
  }

  const getUsageColor = (percentage) => {
    if (percentage >= 80) return 'red'
    if (percentage >= 60) return 'yellow'
    return 'green'
  }

  const health = getHealthStatus()
  const HealthIcon = health.icon

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center">
          <Loader2 className="h-20 w-20 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-xl font-medium">Carregando métricas do sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Moderno com Gradiente */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-500 via-pink-600 to-purple-700 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="h-10 w-10 text-purple-500 drop-shadow-glow animate-pulse" />
            Monitor do Sistema
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">
            Métricas de performance e saúde do sistema em tempo real
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg font-semibold ${
              autoRefresh
                ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white hover:scale-105 hover:shadow-green-500/50'
                : 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105'
            }`}
          >
            {autoRefresh ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* System Health - Card Destacado */}
      <div className={`bg-gradient-to-r from-${health.bgColor}/20 to-${health.bgColor}/10 border-2 border-${health.bgColor}/30 rounded-2xl p-8 hover:scale-[1.02] transition-all hover:shadow-2xl hover:shadow-${health.bgColor}/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`p-4 bg-${health.bgColor}/20 rounded-2xl`}>
              <HealthIcon className={`h-16 w-16 text-${health.textColor} drop-shadow-glow`} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white mb-2">Status: {health.status}</h3>
              <div className="flex items-center gap-4 text-gray-300">
                <span className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-400" />
                  Uptime: <span className="font-bold text-white">{metrics?.performance.uptime}%</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  <span className="font-bold text-white">{metrics?.performance.activeConnections}</span> conexões ativas
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 font-medium mb-1">Tempo Médio de Resposta</p>
            <p className="text-5xl font-black text-white drop-shadow-glow">{metrics?.performance.avgResponseTime}<span className="text-2xl text-gray-400">ms</span></p>
            <div className="flex items-center justify-end gap-2 mt-2">
              <TrendingDown className="h-5 w-5 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">-12% vs ontem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-gradient-to-br from-${getUsageColor(metrics?.performance.cpuUsage)}-600/20 to-${getUsageColor(metrics?.performance.cpuUsage)}-800/20 backdrop-blur-sm border border-${getUsageColor(metrics?.performance.cpuUsage)}-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-${getUsageColor(metrics?.performance.cpuUsage)}-500/20`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Cpu className="h-8 w-8 text-blue-400" />
            </div>
            <Gauge className={`h-6 w-6 text-${getUsageColor(metrics?.performance.cpuUsage)}-400`} />
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Uso de CPU</h3>
          <p className="text-5xl font-black text-white mb-2">{metrics?.performance.cpuUsage}<span className="text-2xl text-gray-400">%</span></p>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`bg-gradient-to-r from-${getUsageColor(metrics?.performance.cpuUsage)}-500 to-${getUsageColor(metrics?.performance.cpuUsage)}-600 h-3 rounded-full transition-all duration-500`}
              style={{ width: `${metrics?.performance.cpuUsage}%` }}
            />
          </div>
        </div>

        <div className={`bg-gradient-to-br from-${getUsageColor(metrics?.performance.memoryUsage)}-600/20 to-${getUsageColor(metrics?.performance.memoryUsage)}-800/20 backdrop-blur-sm border border-${getUsageColor(metrics?.performance.memoryUsage)}-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-${getUsageColor(metrics?.performance.memoryUsage)}-500/20`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <Server className="h-8 w-8 text-purple-400" />
            </div>
            <BarChart3 className={`h-6 w-6 text-${getUsageColor(metrics?.performance.memoryUsage)}-400`} />
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Uso de Memória</h3>
          <p className="text-5xl font-black text-white mb-2">{metrics?.performance.memoryUsage}<span className="text-2xl text-gray-400">%</span></p>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`bg-gradient-to-r from-${getUsageColor(metrics?.performance.memoryUsage)}-500 to-${getUsageColor(metrics?.performance.memoryUsage)}-600 h-3 rounded-full transition-all duration-500`}
              style={{ width: `${metrics?.performance.memoryUsage}%` }}
            />
          </div>
        </div>

        <div className={`bg-gradient-to-br from-${getUsageColor(metrics?.performance.storageUsage)}-600/20 to-${getUsageColor(metrics?.performance.storageUsage)}-800/20 backdrop-blur-sm border border-${getUsageColor(metrics?.performance.storageUsage)}-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-${getUsageColor(metrics?.performance.storageUsage)}-500/20`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-600/20 rounded-xl">
              <HardDrive className="h-8 w-8 text-orange-400" />
            </div>
            <TrendingUp className={`h-6 w-6 text-${getUsageColor(metrics?.performance.storageUsage)}-400`} />
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Uso de Storage</h3>
          <p className="text-5xl font-black text-white mb-2">{metrics?.performance.storageUsage}<span className="text-2xl text-gray-400">%</span></p>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`bg-gradient-to-r from-${getUsageColor(metrics?.performance.storageUsage)}-500 to-${getUsageColor(metrics?.performance.storageUsage)}-600 h-3 rounded-full transition-all duration-500`}
              style={{ width: `${metrics?.performance.storageUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Database Stats - Grid Moderno */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Database className="h-10 w-10 text-blue-400" />
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Total de Registros</h3>
          <p className="text-5xl font-black text-white drop-shadow-glow">{getTotalRecords().toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Todos os registros no banco de dados</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-600/20 rounded-xl">
              <Users className="h-10 w-10 text-green-400" />
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Usuários</h3>
          <p className="text-5xl font-black text-white drop-shadow-glow">{metrics?.database.clients.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-2 font-semibold">
            +{metrics?.activity.newUsersLast24h} nas últimas 24h
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-800/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-600/20 rounded-xl">
              <Zap className="h-10 w-10 text-yellow-400" />
            </div>
            <Activity className="h-6 w-6 text-purple-400 animate-pulse" />
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Atividade (24h)</h3>
          <p className="text-5xl font-black text-white drop-shadow-glow">{metrics?.activity.last24h}</p>
          <p className="text-xs text-gray-400 mt-2">Ações registradas no sistema</p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Tables */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600/10 to-blue-800/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-400" />
              Registros por Tabela
            </h3>
            <p className="text-gray-400 text-sm mt-1">Distribuição de dados no banco</p>
          </div>
          <div className="p-6 space-y-5">
            {metrics && Object.entries(metrics.database).map(([table, count], index) => {
              const percentage = (count / getTotalRecords()) * 100
              const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan']
              const color = colors[index % colors.length]
              
              return (
                <div key={table} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 capitalize font-medium">
                      {table.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">{count.toLocaleString()}</span>
                      <span className={`text-${color}-400 text-xs font-semibold`}>{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r from-${color}-500 to-${color}-600 h-3 rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Slow Queries */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-orange-600/10 to-red-800/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-400" />
              Queries Lentas
            </h3>
            <p className="text-gray-400 text-sm mt-1">Últimas 24 horas</p>
          </div>
          <div className="divide-y divide-gray-700">
            {slowQueries.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
                <p className="text-gray-300 font-medium">Nenhuma query lenta detectada</p>
                <p className="text-gray-500 text-sm mt-1">Sistema operando perfeitamente! 🎉</p>
              </div>
            ) : (
              slowQueries.map((query, i) => (
                <div key={i} className="p-4 hover:bg-gray-900/50 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-xs text-gray-300 flex-1 truncate font-mono bg-gray-900/50 px-2 py-1 rounded">
                      {query.query}
                    </code>
                    <span className="text-orange-400 font-black text-base ml-3 px-3 py-1 bg-orange-600/20 rounded-lg">
                      {query.duration}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{query.user}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{new Date(query.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics - Cards Grandes */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-green-400" />
          Métricas de Performance em Tempo Real
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center bg-gradient-to-br from-blue-600/10 to-blue-800/10 border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-blue-500/20">
            <div className="text-6xl font-black text-white mb-3 drop-shadow-glow">
              {metrics?.performance.avgResponseTime}<span className="text-2xl text-gray-400">ms</span>
            </div>
            <div className="text-sm text-gray-300 font-medium mb-3">Tempo Médio de Resposta</div>
            <TrendingDown className="h-6 w-6 text-green-400 mx-auto" />
          </div>
          
          <div className="text-center bg-gradient-to-br from-green-600/10 to-emerald-800/10 border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-green-500/20">
            <div className="text-6xl font-black text-white mb-3 drop-shadow-glow">
              {metrics?.performance.uptime}<span className="text-2xl text-gray-400">%</span>
            </div>
            <div className="text-sm text-gray-300 font-medium mb-3">Uptime</div>
            <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
          </div>
          
          <div className="text-center bg-gradient-to-br from-purple-600/10 to-purple-800/10 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-purple-500/20">
            <div className="text-6xl font-black text-white mb-3 drop-shadow-glow">
              {metrics?.performance.activeConnections}
            </div>
            <div className="text-sm text-gray-300 font-medium mb-3">Conexões Ativas</div>
            <Activity className="h-6 w-6 text-purple-400 mx-auto animate-pulse" />
          </div>
          
          <div className="text-center bg-gradient-to-br from-orange-600/10 to-orange-800/10 border border-orange-500/20 rounded-2xl p-6 hover:scale-105 transition-all hover:shadow-xl hover:shadow-orange-500/20">
            <div className="text-6xl font-black text-white mb-3 drop-shadow-glow">
              {(getTotalRecords() / 1000).toFixed(1)}<span className="text-2xl text-gray-400">K</span>
            </div>
            <div className="text-sm text-gray-300 font-medium mb-3">Total de Registros</div>
            <HardDrive className="h-6 w-6 text-orange-400 mx-auto" />
          </div>
        </div>
      </div>

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

export default SystemMonitor
