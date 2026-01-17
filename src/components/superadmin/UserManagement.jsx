import React, { useEffect, useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  Power,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Mail,
  Calendar,
  Award,
  Loader2
} from 'lucide-react'
import Card from '../ui/Card'
import Loading from '../ui/Loading'
import superAdminService from '../../services/superAdminService'

const UserManagement = () => {
  console.log('🚀 [UserManagement] Componente montado!')
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [editingUser, setEditingUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [stats, setStats] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const pageSize = 15

  console.log('📊 [UserManagement] Estado atual:', { 
    usersCount: users.length, 
    loading, 
    totalUsers,
    searchTerm,
    roleFilter,
    statusFilter
  })

  // Debounce search
  useEffect(() => {
    console.log('⏱️ [UserManagement] useEffect debounce executado', { searchInput })
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    console.log('🔄 [UserManagement] useEffect loadUsers executado')
    loadUsers()
  }, [currentPage, roleFilter, searchTerm, statusFilter])

  useEffect(() => {
    console.log('📈 [UserManagement] useEffect loadStats executado')
    loadStats()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('🔍 Carregando usuários...', { 
        page: currentPage, 
        pageSize, 
        role: roleFilter, 
        search: searchTerm,
        status: statusFilter 
      })
      
      const result = await superAdminService.getAllUsers({
        page: currentPage,
        pageSize,
        role: roleFilter || null,
        search: searchTerm,
        status: statusFilter
      })
      
      console.log('✅ Usuários carregados:', result)
      
      setUsers(result.users)
      setTotalPages(result.pages)
      setTotalUsers(result.total)
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await superAdminService.getSystemStats()
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }

  const handleEditRole = (user) => {
    setEditingUser(user)
    setNewRole(user.role)
  }

  const handleSaveRole = async () => {
    if (!editingUser || !newRole || newRole === editingUser.role) {
      setEditingUser(null)
      return
    }

    try {
      setActionLoading(true)
      await superAdminService.updateUserRole(editingUser.user_id, newRole)
      
      setSuccessMessage(`Role de ${editingUser.name} atualizado para ${roleNames[newRole]}`)
      setTimeout(() => setSuccessMessage(''), 3000)
      
      await loadUsers()
      await loadStats()
      setEditingUser(null)
      setNewRole('')
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      alert('Erro ao atualizar role do usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active
    const action = newStatus ? 'ativar' : 'desativar'
    
    if (!confirm(`Deseja ${action} o usuário ${user.name}?`)) return

    try {
      setActionLoading(true)
      await superAdminService.toggleUserStatus(user.user_id, newStatus)
      
      setSuccessMessage(`Usuário ${user.name} ${newStatus ? 'ativado' : 'desativado'} com sucesso`)
      setTimeout(() => setSuccessMessage(''), 3000)
      
      await loadUsers()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status do usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const roleColors = {
    super_admin: 'bg-red-500/20 text-red-400 border-red-500/50',
    bank_manager: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    company_manager: 'bg-green-500/20 text-green-400 border-green-500/50',
    company_employee: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  }

  const roleIcons = {
    super_admin: Award,
    bank_manager: Shield,
    company_manager: Users,
    company_employee: Users
  }

  const roleNames = {
    super_admin: 'Super Admin',
    bank_manager: 'Bank Manager',
    company_manager: 'Company Manager',
    company_employee: 'Employee'
  }

  const allRoles = ['super_admin', 'bank_manager', 'company_manager', 'company_employee']

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getAvatarColor = (role) => {
    const colors = {
      super_admin: 'bg-gradient-to-br from-red-500 to-red-600',
      bank_manager: 'bg-gradient-to-br from-blue-500 to-blue-600',
      company_manager: 'bg-gradient-to-br from-green-500 to-green-600',
      company_employee: 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
    return colors[role] || colors.company_employee
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-400 mt-1">
            {totalUsers} usuários {searchTerm && `• Buscando por "${searchTerm}"`} {users.length > 0 && `• ${users.length} nesta página`}
          </p>
        </div>
        <button
          onClick={() => {
            loadUsers()
            loadStats()
          }}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-400" />
          <p className="text-green-400 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total</p>
                  <p className="text-3xl font-bold text-white">{stats.users.total}</p>
                </div>
                <Users className="h-10 w-10 text-white/30" />
              </div>
            </div>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Super Admins</p>
                  <p className="text-2xl font-bold text-red-400">{stats.users.byRole.super_admin || 0}</p>
                </div>
                <Award className="h-8 w-8 text-red-500/30" />
              </div>
            </div>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Bank Managers</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.users.byRole.bank_manager || 0}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500/30" />
              </div>
            </div>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Company Managers</p>
                  <p className="text-2xl font-bold text-green-400">{stats.users.byRole.company_manager || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-500/30" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Todos os roles</option>
              {allRoles.map(role => (
                <option key={role} value={role}>{roleNames[role]}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Power className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      {loading ? (
        <Card className="bg-gray-800 border-gray-700 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Carregando usuários...</p>
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const RoleIcon = roleIcons[user.role] || Users
            const isEditing = editingUser?.id === user.id
            
            return (
              <Card 
                key={user.id} 
                className={`bg-gray-800 border-gray-700 hover:border-gray-600 transition-all ${
                  isEditing ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 h-14 w-14 rounded-full ${getAvatarColor(user.role)} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-lg">
                          {getInitials(user.name)}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">{user.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role & Status */}
                    <div className="flex items-center gap-4">
                      {/* Role Badge */}
                      <div>
                        {isEditing ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-4 py-2 bg-gray-900 border-2 border-blue-500 rounded-lg text-sm text-white font-medium focus:outline-none"
                            disabled={actionLoading}
                          >
                            {allRoles.map(role => (
                              <option key={role} value={role}>{roleNames[role]}</option>
                            ))}
                          </select>
                        ) : (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${roleColors[user.role]}`}>
                            <RoleIcon className="h-4 w-4" />
                            <span className="text-sm font-semibold">{roleNames[user.role]}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div>
                        {user.is_active !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50 text-sm font-semibold">
                            <Check className="h-4 w-4" /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 text-sm font-semibold">
                            <X className="h-4 w-4" /> Inativo
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveRole}
                              disabled={actionLoading}
                              className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Salvar alterações"
                            >
                              {actionLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Check className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null)
                                setNewRole('')
                              }}
                              disabled={actionLoading}
                              className="p-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                              title="Cancelar"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditRole(user)}
                              disabled={actionLoading}
                              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Editar Role"
                            >
                              <Shield className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={actionLoading}
                              className={`p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.is_active !== false
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-green-600 hover:bg-green-700'
                              } text-white`}
                              title={user.is_active !== false ? 'Desativar usuário' : 'Ativar usuário'}
                            >
                              <Power className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Página <span className="text-white font-semibold">{currentPage}</span> de{' '}
              <span className="text-white font-semibold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default UserManagement
