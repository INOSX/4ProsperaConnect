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
      const statsData = await superAdminService.getSystemStats()
      setStats(statsData)
      
      // Carregar atividades recentes
      try {
        const activityData = await superAdminService.getRecentActivity({ limit: 5 })
        setRecentActivity(activityData)
      } catch (err) {
        console.log('Audit log:', err)
        setRecentActivity([])
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            Painel de Controle
          </h1>
          <p className="text-gray-400 mt-1">Visão geral completa da plataforma 4Prospera</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Activity className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Main Stats - 3 cards maiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-12 w-12 text-white opacity-80" />
              <TrendingUp className="h-6 w-6 text-white opacity-60" />
            </div>
            <h3 className="text-white opacity-90 text-sm font-medium mb-2">Total de Usuários</h3>
            <p className="text-5xl font-bold text-white mb-4">{stats?.users?.total || 0}</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(stats?.users?.byRole || {}).map(([role, count]) => (
                <span key={role} className="px-2 py-1 bg-white/20 rounded text-white text-xs font-semibold">
                  {roleNames[role]}: {count}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-12 w-12 text-white opacity-80" />
              <BarChart3 className="h-6 w-6 text-white opacity-60" />
            </div>
            <h3 className="text-white opacity-90 text-sm font-medium mb-2">Empresas Cadastradas</h3>
            <p className="text-5xl font-bold text-white mb-4">{stats?.companies || 0}</p>
            <p className="text-white opacity-80 text-sm">
              {stats?.employees || 0} colaboradores totais
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Database className="h-12 w-12 text-white opacity-80" />
              <Activity className="h-6 w-6 text-white opacity-60" />
            </div>
            <h3 className="text-white opacity-90 text-sm font-medium mb-2">Dados no Sistema</h3>
            <p className="text-5xl font-bold text-white mb-4">
              {((stats?.prospects || 0) + (stats?.campaigns || 0)).toLocaleString()}
            </p>
            <p className="text-white opacity-80 text-sm">
              {stats?.prospects || 0} prospects • {stats?.campaigns || 0} campanhas
            </p>
          </div>
        </Card>
      </div>

      {/* Secondary Stats - Grid de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role - Detailed */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Distribuição de Usuários
              </h2>
              <button
                onClick={() => navigate('/superadmin/users')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(stats?.users?.byRole || {}).length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum usuário cadastrado</p>
              ) : (
                Object.entries(stats?.users?.byRole || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([role, count]) => {
                    const percentage = ((count / stats.users.total) * 100).toFixed(1)
                    return (
                      <div key={role}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${roleColors[role]}`}></div>
                            <span className="text-white text-sm font-medium">
                              {roleNames[role] || role}
                            </span>
                          </div>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${roleColors[role]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{percentage}% do total</p>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Atividade Recente
              </h2>
              <button
                onClick={() => navigate('/superadmin/audit')}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Ver audit log <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Nenhuma atividade registrada ainda
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Ações serão exibidas aqui
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {activity.action === 'SQL_CONSOLE_QUERY' ? (
                        <Terminal className="h-5 w-5 text-orange-500" />
                      ) : activity.action === 'UPDATE_USER_ROLE' ? (
                        <Shield className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Activity className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {actionLabels[activity.action] || activity.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Por: {activity.user?.email || 'Sistema'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
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

      {/* Quick Actions - Modernizado */}
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/superadmin/users')}
              className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-blue-500 rounded-lg transition-all text-left group"
            >
              <Users className="h-8 w-8 text-white mb-3" />
              <p className="text-lg font-bold text-white">Gerenciar Usuários</p>
              <p className="text-sm text-white opacity-80 mt-1">
                {stats?.users?.total || 0} usuários cadastrados
              </p>
              <div className="flex items-center gap-1 mt-3 text-white opacity-90 group-hover:gap-2 transition-all">
                <span className="text-sm font-medium">Acessar</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            <button
              onClick={() => navigate('/superadmin/companies')}
              className="p-4 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border border-green-500 rounded-lg transition-all text-left group"
            >
              <Building2 className="h-8 w-8 text-white mb-3" />
              <p className="text-lg font-bold text-white">Ver Empresas</p>
              <p className="text-sm text-white opacity-80 mt-1">
                {stats?.companies || 0} empresas ativas
              </p>
              <div className="flex items-center gap-1 mt-3 text-white opacity-90 group-hover:gap-2 transition-all">
                <span className="text-sm font-medium">Acessar</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            <button
              onClick={() => navigate('/superadmin/monitor')}
              className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border border-purple-500 rounded-lg transition-all text-left group"
            >
              <Activity className="h-8 w-8 text-white mb-3" />
              <p className="text-lg font-bold text-white">Monitor</p>
              <p className="text-sm text-white opacity-80 mt-1">
                Status e métricas do sistema
              </p>
              <div className="flex items-center gap-1 mt-3 text-white opacity-90 group-hover:gap-2 transition-all">
                <span className="text-sm font-medium">Acessar</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            <button
              onClick={() => navigate('/superadmin/sql')}
              className="p-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500 rounded-lg transition-all text-left group"
            >
              <Terminal className="h-8 w-8 text-white mb-3" />
              <p className="text-lg font-bold text-white">Console SQL</p>
              <p className="text-sm text-white opacity-80 mt-1">
                Acesso total ao banco de dados
              </p>
              <div className="flex items-center gap-1 mt-3 text-white opacity-90 group-hover:gap-2 transition-all">
                <span className="text-sm font-medium">Acessar</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SuperAdminDashboard
