import React, { useEffect, useState } from 'react'
import { 
  Users, 
  Building2, 
  UserCheck, 
  Target,
  Mail,
  TrendingUp,
  Activity,
  Crown
} from 'lucide-react'
import superAdminService from '../../services/superAdminService'
import Loading from '../ui/Loading'
import Card from '../ui/Card'

const SuperAdminDashboard = () => {
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
      
      // Tentar carregar atividades recentes, mas não falhar se não houver
      try {
        const activityData = await superAdminService.getRecentActivity({ limit: 10 })
        setRecentActivity(activityData)
      } catch (err) {
        console.log('Audit log ainda não configurado:', err)
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

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'blue',
      subtitle: `${stats?.users?.byRole?.super_admin || 0} Super Admins, ${stats?.users?.byRole?.bank_manager || 0} Bank Managers`
    },
    {
      title: 'Empresas',
      value: stats?.companies || 0,
      icon: Building2,
      color: 'green',
      subtitle: 'Empresas cadastradas'
    },
    {
      title: 'Colaboradores',
      value: stats?.employees || 0,
      icon: UserCheck,
      color: 'purple',
      subtitle: 'Total de funcionários'
    },
    {
      title: 'Prospects',
      value: stats?.prospects || 0,
      icon: Target,
      color: 'orange',
      subtitle: 'Em prospecção'
    },
    {
      title: 'Campanhas',
      value: stats?.campaigns || 0,
      icon: Mail,
      color: 'pink',
      subtitle: 'Ativas e finalizadas'
    }
  ]

  const roleColors = {
    super_admin: 'bg-red-100 text-red-800 border-red-300',
    bank_manager: 'bg-blue-100 text-blue-800 border-blue-300',
    company_manager: 'bg-green-100 text-green-800 border-green-300',
    company_employee: 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const roleNames = {
    super_admin: 'Super Admin',
    bank_manager: 'Bank Manager',
    company_manager: 'Company Manager',
    company_employee: 'Employee'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            Super Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Visão geral completa da plataforma 4Prospera</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Activity className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
            pink: 'bg-pink-500'
          }

          return (
            <Card key={stat.title} className="bg-gray-800 border-gray-700 hover:border-red-500 transition-all">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${colorClasses[stat.color]} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Usuários por Role</h2>
            <div className="space-y-3">
              {Object.entries(stats?.users?.byRole || {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[role]}`}>
                      {roleNames[role] || role}
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Atividade Recente</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma atividade recente (Audit Log não configurado ainda)</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.action || activity.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {activity.user?.email || activity.email || 'Sistema'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-sm font-medium text-white">Gerenciar Usuários</p>
              <p className="text-xs text-gray-500 mt-1">Ver todos os usuários</p>
            </button>
            <button className="p-4 bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left">
              <Building2 className="h-6 w-6 text-green-500 mb-2" />
              <p className="text-sm font-medium text-white">Ver Empresas</p>
              <p className="text-xs text-gray-500 mt-1">Todas as empresas</p>
            </button>
            <button className="p-4 bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-left">
              <Activity className="h-6 w-6 text-purple-500 mb-2" />
              <p className="text-sm font-medium text-white">Monitor</p>
              <p className="text-xs text-gray-500 mt-1">Status do sistema</p>
            </button>
            <button className="p-4 bg-red-900 hover:bg-red-800 border border-red-700 rounded-lg transition-colors text-left">
              <Crown className="h-6 w-6 text-yellow-500 mb-2" />
              <p className="text-sm font-medium text-white">Console SQL</p>
              <p className="text-xs text-gray-500 mt-1">⚠️ Acesso total ao DB</p>
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SuperAdminDashboard
