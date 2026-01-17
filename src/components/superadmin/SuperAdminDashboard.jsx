import React, { useEffect, useState } from 'react'
import { 
  Users, 
  Building2, 
  UserCheck, 
  Target,
  Mail,
  TrendingUp,
  Activity,
  Shield,
  Terminal,
  Eye,
  ArrowRight,
  BarChart3,
  Database
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import superAdminService from '../../services/superAdminService'
import Loading from '../ui/Loading'
import Card from '../ui/Card'

const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log('🔍 [Dashboard] Carregando dados do dashboard...')
      
      const statsData = await superAdminService.getSystemStats()
      setStats(statsData)
      console.log('✅ [Dashboard] Stats carregadas:', statsData)
      
      // Carregar atividades recentes
      try {
        const activityData = await superAdminService.getRecentActivity({ limit: 5 })
        setRecentActivity(activityData)
        console.log('✅ [Dashboard] Atividades carregadas:', activityData.length)
      } catch (err) {
        console.log('⚠️ [Dashboard] Audit log não disponível:', err)
        setRecentActivity([])
      }
      
      console.log('🎯 [Dashboard] Dashboard carregado com sucesso!')
    } catch (error) {
      console.error('❌ [Dashboard] Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center">
          <Shield className="h-20 w-20 text-red-500 animate-pulse mx-auto mb-4 drop-shadow-glow" />
          <p className="text-gray-300 text-xl font-medium">Carregando painel de controle...</p>
        </div>
      </div>
    )
  }

  const roleColors = {
    super_admin: 'bg-red-500 border-red-600',
    bank_manager: 'bg-blue-500 border-blue-600',
    company_manager: 'bg-green-500 border-green-600',
    company_employee: 'bg-gray-500 border-gray-600'
  }

  const roleNames = {
    super_admin: 'Super Admin',
    bank_manager: 'Bank Manager',
    company_manager: 'Company Manager',
    company_employee: 'Employee'
  }

  const actionLabels = {
    UPDATE_USER_ROLE: 'Atualização de Role',
    TOGGLE_USER_STATUS: 'Alteração de Status',
    SQL_CONSOLE_QUERY: 'Query SQL Executada'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header com Gradiente */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent flex items-center gap-3">
            <Shield className="h-10 w-10 text-red-500 drop-shadow-glow" />
            Painel de Controle
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">
            Visão geral completa da plataforma 4Prospera
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-red-500/50 hover:scale-105 font-semibold"
        >
          <Activity className="h-5 w-5" />
          Atualizar
        </button>
      </div>

      {/* Main Stats - 3 cards ÉPICOS com animações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Usuários */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <Card className="relative bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-500 shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <Users className="h-16 w-16 text-white drop-shadow-lg" />
                <TrendingUp className="h-8 w-8 text-white/60" />
              </div>
              <h3 className="text-white text-base font-bold mb-3 uppercase tracking-wide">
                Total de Usuários
              </h3>
              <p className="text-6xl font-black text-white mb-6 drop-shadow-lg">
                {stats?.users?.total || 0}
              </p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(stats?.users?.byRole || {}).map(([role, count]) => (
                  <span 
                    key={role} 
                    className="px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-lg text-white text-sm font-bold border border-white/20 hover:bg-white/40 transition-all"
                  >
                    {roleNames[role]}: {count}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Card Empresas */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <Card className="relative bg-gradient-to-br from-green-600 to-green-700 border-2 border-green-500 shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <Building2 className="h-16 w-16 text-white drop-shadow-lg" />
                <BarChart3 className="h-8 w-8 text-white/60" />
              </div>
              <h3 className="text-white text-base font-bold mb-3 uppercase tracking-wide">
                Empresas Cadastradas
              </h3>
              <p className="text-6xl font-black text-white mb-6 drop-shadow-lg">
                {stats?.companies || 0}
              </p>
              <p className="text-white/90 text-base font-semibold">
                {stats?.employees || 0} colaboradores totais
              </p>
            </div>
          </Card>
        </div>

        {/* Card Dados */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <Card className="relative bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-purple-500 shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <Database className="h-16 w-16 text-white drop-shadow-lg" />
                <Activity className="h-8 w-8 text-white/60" />
              </div>
              <h3 className="text-white text-base font-bold mb-3 uppercase tracking-wide">
                Dados no Sistema
              </h3>
              <p className="text-6xl font-black text-white mb-6 drop-shadow-lg">
                {((stats?.prospects || 0) + (stats?.campaigns || 0)).toLocaleString()}
              </p>
              <p className="text-white/90 text-base font-semibold">
                {stats?.prospects || 0} prospects • {stats?.campaigns || 0} campanhas
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Secondary Stats - Grid de 2 colunas MELHORADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role - Detailed */}
        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-2 border-gray-700 shadow-xl hover:border-blue-500/50 transition-all">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-400" />
                Distribuição de Usuários
              </h2>
              <button
                onClick={() => navigate('/superadmin/users')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 font-semibold px-4 py-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-5">
              {Object.entries(stats?.users?.byRole || {}).length === 0 ? (
                <p className="text-gray-400 text-base">Nenhum usuário cadastrado</p>
              ) : (
                Object.entries(stats?.users?.byRole || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([role, count]) => {
                    const percentage = ((count / stats.users.total) * 100).toFixed(1)
                    return (
                      <div key={role} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${roleColors[role]} shadow-lg`}></div>
                            <span className="text-white text-base font-bold">
                              {roleNames[role] || role}
                            </span>
                          </div>
                          <span className="text-white font-black text-lg">{count}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                          <div
                            className={`h-3 rounded-full ${roleColors[role]} transition-all duration-1000 ease-out shadow-lg`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-2 font-semibold">
                          {percentage}% do total
                        </p>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </Card>

        {/* Recent Activity MELHORADO */}
        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-2 border-gray-700 shadow-xl hover:border-purple-500/50 transition-all">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity className="h-6 w-6 text-purple-400" />
                Atividade Recente
              </h2>
              <button
                onClick={() => navigate('/superadmin/audit')}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2 font-semibold px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-all"
              >
                Ver audit log <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-base font-semibold">
                    Nenhuma atividade registrada ainda
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Ações serão exibidas aqui
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-gray-700 hover:border-gray-600 transition-all hover:scale-102 shadow-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.action === 'SQL_CONSOLE_QUERY' ? (
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Terminal className="h-6 w-6 text-orange-400" />
                        </div>
                      ) : activity.action === 'UPDATE_USER_ROLE' ? (
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Shield className="h-6 w-6 text-blue-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-500/20 rounded-lg">
                          <Activity className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-white">
                        {actionLabels[activity.action] || activity.action}
                      </p>
                      <p className="text-sm text-gray-300 mt-1 font-medium">
                        Por: {activity.user?.email || 'Sistema'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-semibold">
                        {new Date(activity.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions - ÉPICO */}
      <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-2 border-gray-700 shadow-2xl">
        <div className="p-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <ArrowRight className="h-6 w-6 text-red-500" />
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Gerenciar Usuários',
                stat: `${stats?.users?.total || 0} usuários cadastrados`,
                gradient: 'from-blue-600 to-blue-700',
                hoverGradient: 'hover:from-blue-700 hover:to-blue-800',
                border: 'border-blue-500',
                route: '/superadmin/users'
              },
              {
                icon: Building2,
                title: 'Ver Empresas',
                stat: `${stats?.companies || 0} empresas ativas`,
                gradient: 'from-green-600 to-green-700',
                hoverGradient: 'hover:from-green-700 hover:to-green-800',
                border: 'border-green-500',
                route: '/superadmin/companies'
              },
              {
                icon: Activity,
                title: 'Monitor',
                stat: 'Status e métricas do sistema',
                gradient: 'from-purple-600 to-purple-700',
                hoverGradient: 'hover:from-purple-700 hover:to-purple-800',
                border: 'border-purple-500',
                route: '/superadmin/monitor'
              },
              {
                icon: Terminal,
                title: 'Console SQL',
                stat: 'Acesso total ao banco de dados',
                gradient: 'from-red-600 to-red-700',
                hoverGradient: 'hover:from-red-700 hover:to-red-800',
                border: 'border-red-500',
                route: '/superadmin/sql'
              }
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.route)}
                className={`relative group p-6 bg-gradient-to-br ${action.gradient} ${action.hoverGradient} border-2 ${action.border} rounded-2xl transition-all text-left transform hover:scale-105 hover:-translate-y-1 shadow-xl overflow-hidden`}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative">
                  <action.icon className="h-10 w-10 text-white mb-4 drop-shadow-lg group-hover:scale-110 transition-transform" />
                  <p className="text-xl font-black text-white mb-2">
                    {action.title}
                  </p>
                  <p className="text-sm text-white/90 font-semibold mb-4">
                    {action.stat}
                  </p>
                  <div className="flex items-center gap-2 text-white font-bold group-hover:gap-3 transition-all">
                    <span className="text-sm">Acessar</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes fade-in {
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
          animation: fade-in 0.6s ease-out;
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}

export default SuperAdminDashboard
