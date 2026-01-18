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
  Loader2,
  Eye,
  User,
  Crown,
  UserPlus,
  Trash2,
  EyeOff,
  Dices,
  Sparkles,
  Skull
} from 'lucide-react'
import Card from '../ui/Card'
import Loading from '../ui/Loading'
import superAdminService from '../../services/superAdminService'
import { supabase } from '../../services/supabase'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {}
  })
  
  // Estados para CRIAÇÃO de usuário
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'company_employee',
    isActive: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  // Estados para EXCLUSÃO de usuário
  const [deletingUser, setDeletingUser] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteCountdown, setDeleteCountdown] = useState(3)
  
  const pageSize = 15

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    loadUsers()
  }, [currentPage, roleFilter, searchTerm, statusFilter])

  useEffect(() => {
    loadStats()
  }, [])

  // Countdown para exclusão
  useEffect(() => {
    if (deletingUser && deleteCountdown > 0) {
      const timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [deletingUser, deleteCountdown])

  // Validar força da senha
  useEffect(() => {
    if (createForm.password) {
      let strength = 0
      if (createForm.password.length >= 8) strength += 25
      if (/[a-z]/.test(createForm.password)) strength += 25
      if (/[A-Z]/.test(createForm.password)) strength += 25
      if (/[0-9]/.test(createForm.password) && /[!@#$%^&*]/.test(createForm.password)) strength += 25
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [createForm.password])

  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('🔍 Carregando usuários...')
      
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
      setStats({
        total: statsData.users.total,
        active: statsData.users.active,
        inactive: statsData.users.inactive,
        byRole: statsData.users.byRole
      })
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }

  // ========== CRIAR USUÁRIO ==========
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCreateForm({ ...createForm, password })
  }

  const validateEmail = async (email) => {
    if (!email) {
      setEmailError('')
      return false
    }

    // Validar formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido')
      return false
    }

    // Verificar se já existe
    try {
      const { data } = await supabase
        .from('clients')
        .select('email')
        .eq('email', email)
        .single()
      
      if (data) {
        setEmailError('Email já cadastrado')
        return false
      }
      
      setEmailError('')
      return true
    } catch (error) {
      setEmailError('')
      return true // Se der erro na query, assume que não existe
    }
  }

  const handleCreateUser = async () => {
    try {
      setActionLoading(true)

      // Validações
      if (!createForm.name || !createForm.email || !createForm.password) {
        alert('Preencha todos os campos obrigatórios')
        return
      }

      if (emailError) {
        alert('Corrija os erros antes de continuar')
        return
      }

      console.log('🔨 Criando usuário:', createForm.email)

      // Chamar API serverless que usa service_role key
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
          role: createForm.role,
          isActive: createForm.isActive
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Erro na API:', result)
        throw new Error(result.details || result.error || 'Erro ao criar usuário')
      }

      console.log('✅ Usuário criado com sucesso:', result.user)

      // 3. Registrar no audit log
      await superAdminService.logAction('CREATE_USER', {
        userId: authData.user.id,
        email: createForm.email,
        role: createForm.role
      })

      // 4. Fechar modal e atualizar lista
      setShowCreateModal(false)
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'company_employee',
        isActive: true
      })
      
      setSuccessMessage(`🎉 Usuário ${createForm.name} criado com sucesso!`)
      setTimeout(() => setSuccessMessage(''), 5000)
      
      await loadUsers()
      await loadStats()

    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error)
      alert(error.message || 'Erro ao criar usuário')
    } finally {
      setActionLoading(false)
    }
  }

  // ========== EXCLUIR USUÁRIO ==========
  const handleDeleteUser = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Digite DELETE para confirmar')
      return
    }

    if (deleteCountdown > 0) {
      alert('Aguarde o contador finalizar')
      return
    }

    try {
      setActionLoading(true)
      console.log('🗑️ Excluindo usuário:', deletingUser.email)

      // Chamar API serverless que usa service_role key
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: deletingUser.user_id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Erro na API:', result)
        throw new Error(result.details || result.error || 'Erro ao excluir usuário')
      }

      console.log('✅ Usuário excluído com sucesso')

      // 3. Registrar no audit log
      await superAdminService.logAction('DELETE_USER', {
        userId: deletingUser.user_id,
        email: deletingUser.email,
        name: deletingUser.name
      })

      // 4. Fechar modal e atualizar lista
      setDeletingUser(null)
      setDeleteConfirmation('')
      setDeleteCountdown(3)
      
      setSuccessMessage(`🗑️ Usuário ${deletingUser.name} excluído permanentemente`)
      setTimeout(() => setSuccessMessage(''), 5000)
      
      await loadUsers()
      await loadStats()

    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      alert(error.message || 'Erro ao excluir usuário')
    } finally {
      setActionLoading(false)
    }
  }

  // ========== OUTRAS FUNÇÕES ==========
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

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const roleNames = {
    super_admin: 'Super Admin',
    bank_manager: 'Bank Manager',
    company_manager: 'Company Manager',
    company_employee: 'Company Employee'
  }

  const roleColors = {
    super_admin: 'from-red-500 to-red-600',
    bank_manager: 'from-blue-500 to-blue-600',
    company_manager: 'from-green-500 to-green-600',
    company_employee: 'from-gray-500 to-gray-600'
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case 'super_admin': return Crown
      case 'bank_manager': return Shield
      case 'company_manager': return Award
      default: return User
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500'
    if (passwordStrength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Fraca'
    if (passwordStrength < 75) return 'Média'
    return 'Forte'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Mensagem de Sucesso */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-800/20 border-2 border-green-500/30 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
          <Sparkles className="h-6 w-6 text-green-400 animate-pulse" />
          <p className="text-white font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Header Moderno com Botão Criar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="h-10 w-10 text-blue-500 drop-shadow-glow" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">
            {totalUsers} {totalUsers === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
            {searchTerm && <span className="text-blue-400 ml-2">• Buscando: "{searchTerm}"</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/50 hover:scale-105 font-semibold"
          >
            <UserPlus className="h-5 w-5" />
            Criar Usuário
          </button>
          <button
            onClick={loadUsers}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105 font-semibold"
          >
            <RefreshCw className="h-5 w-5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium mb-1">Total</p>
              <p className="text-6xl font-black text-white drop-shadow-glow">{stats.total}</p>
            </div>
            <Users className="h-16 w-16 text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:border-green-400/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium mb-1">Ativos</p>
              <p className="text-6xl font-black text-white drop-shadow-glow">{stats.active}</p>
            </div>
            <Check className="h-16 w-16 text-green-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 hover:border-red-400/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium mb-1">Inativos</p>
              <p className="text-6xl font-black text-white drop-shadow-glow">{stats.inactive}</p>
            </div>
            <X className="h-16 w-16 text-red-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filtros Modernos */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-20 py-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all text-lg font-medium"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm font-medium mb-2 block">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
            >
              <option value="">Todos os roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="bank_manager">Bank Manager</option>
              <option value="company_manager">Company Manager</option>
              <option value="company_employee">Company Employee</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm font-medium mb-2 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      {loading ? (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-16 border border-gray-700 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-300 text-lg font-medium">Carregando usuários...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-16 border border-gray-700">
          <div className="text-center">
            <AlertCircle className="h-20 w-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-400 text-lg">Tente ajustar os filtros de busca</p>
          </div>
        </div>
      ) : (
        <>
          {/* Cards de Usuários */}
          <div className="space-y-4">
            {users.map((user, index) => {
              const RoleIcon = getRoleIcon(user.role)
              return (
                <div
                  key={user.id}
                  className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in-up group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Avatar e Info Principal */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative">
                        <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${roleColors[user.role] || 'from-gray-500 to-gray-600'} flex items-center justify-center shadow-lg`}>
                          <RoleIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-gray-800 ${
                          user.is_active !== false ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                        <p className="text-gray-400 mb-3 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.user?.email || user.email || 'N/A'}
                        </p>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-3 py-1 bg-gradient-to-r ${roleColors[user.role] || 'from-gray-500 to-gray-600'} bg-opacity-20 text-white rounded-lg text-sm font-bold border border-white/20`}>
                            {roleNames[user.role] || user.role}
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            user.is_active !== false
                              ? 'bg-green-600/20 text-green-300'
                              : 'bg-red-600/20 text-red-300'
                          }`}>
                            {user.is_active !== false ? '✓ Ativo' : '✕ Inativo'}
                          </span>
                          {user.created_at && (
                            <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>

                        {/* Grid de Info */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">User ID</p>
                            <p className="text-white font-mono text-xs truncate">
                              {user.user_id?.substring(0, 8)}...
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">Client ID</p>
                            <p className="text-white font-mono text-xs truncate">
                              {user.id?.toString().substring(0, 8)}...
                            </p>
                          </div>
                          {user.company_id && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1 font-medium">Company ID</p>
                              <p className="text-white font-mono text-xs truncate">
                                {user.company_id?.toString().substring(0, 8)}...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEditRole(user)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105 font-semibold flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Editar Role
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-4 py-2 bg-gradient-to-r ${
                          user.is_active !== false
                            ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-red-500/50'
                            : 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/50'
                        } text-white rounded-xl transition-all shadow-lg hover:scale-105 font-semibold flex items-center gap-2`}
                      >
                        <Power className="h-4 w-4" />
                        {user.is_active !== false ? 'Desativar' : 'Ativar'}
                      </button>
                      {/* Botão EXCLUIR - só aparece no hover */}
                      <button
                        onClick={() => {
                          setDeletingUser(user)
                          setDeleteCountdown(3)
                          setDeleteConfirmation('')
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white rounded-xl transition-all shadow-lg hover:shadow-red-500/50 hover:scale-105 font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 hover:animate-shake"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-gray-300 font-medium">
                  Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 font-semibold flex items-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 font-semibold flex items-center gap-2"
                  >
                    Próxima
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL DE CRIAÇÃO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-2xl w-full border-2 border-green-500/30 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                <UserPlus className="h-8 w-8 text-green-500" />
                Criar Novo Usuário
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-gray-300 font-medium mb-2 block">Nome Completo *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-gray-300 font-medium mb-2 block">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, email: e.target.value })
                    validateEmail(e.target.value)
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="Ex: joao@empresa.com"
                  className={`w-full px-4 py-3 bg-gray-900 border-2 rounded-xl text-white focus:outline-none transition-all ${
                    emailError ? 'border-red-500' : 'border-gray-700 focus:border-green-500'
                  }`}
                />
                {emailError && <p className="text-red-400 text-sm mt-1">{emailError}</p>}
              </div>

              {/* Senha */}
              <div>
                <label className="text-gray-300 font-medium mb-2 block">Senha *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-3 pr-24 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title={showPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Gerar senha aleatória"
                    >
                      <Dices className="h-4 w-4 text-green-400" />
                    </button>
                  </div>
                </div>
                {createForm.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Força da senha:</span>
                      <span className={`text-sm font-semibold ${
                        passwordStrength < 50 ? 'text-red-400' : passwordStrength < 75 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="text-gray-300 font-medium mb-2 block">Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all"
                >
                  <option value="company_employee">Company Employee</option>
                  <option value="company_manager">Company Manager</option>
                  <option value="bank_manager">Bank Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-gray-300 font-medium mb-2 block">Status Inicial</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, isActive: true })}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      createForm.isActive
                        ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Check className="h-5 w-5 inline mr-2" />
                    Ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, isActive: false })}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      !createForm.isActive
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <X className="h-5 w-5 inline mr-2" />
                    Inativo
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                disabled={actionLoading || !createForm.name || !createForm.email || !createForm.password || emailError}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Criar Usuário
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full border-2 border-red-500/30 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <Skull className="h-20 w-20 text-red-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-3xl font-bold text-red-500 mb-2">⚠️ TEM CERTEZA ABSOLUTA?</h3>
              <p className="text-gray-300">Esta ação NÃO pode ser desfeita!</p>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-white font-bold text-lg">{deletingUser.name}</p>
              <p className="text-gray-400 text-sm">{deletingUser.email}</p>
              <p className="text-gray-500 text-xs mt-2">Role: {roleNames[deletingUser.role]}</p>
            </div>

            <div className="mb-6">
              <label className="text-gray-300 font-medium mb-2 block">
                Digite <span className="text-red-500 font-bold">DELETE</span> para confirmar:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 bg-gray-900 border-2 border-red-500/30 rounded-xl text-white focus:outline-none focus:border-red-500 transition-all font-mono text-center text-lg"
              />
            </div>

            {deleteCountdown > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6 text-center">
                <p className="text-yellow-300 font-semibold">
                  Aguarde {deleteCountdown} segundo{deleteCountdown !== 1 ? 's' : ''}...
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeletingUser(null)
                  setDeleteConfirmation('')
                  setDeleteCountdown(3)
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading || deleteConfirmation !== 'DELETE' || deleteCountdown > 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 animate-pulse disabled:animate-none"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    EXCLUIR PERMANENTEMENTE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Role */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full border-2 border-gray-700 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Alterar Role</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-2">Usuário:</p>
              <p className="text-xl font-bold text-white">{editingUser.name}</p>
              <p className="text-gray-400 text-sm">{editingUser.user?.email || editingUser.email}</p>
            </div>

            <div className="mb-6">
              <label className="text-gray-300 font-medium mb-3 block">Novo Role:</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              >
                <option value="super_admin">Super Admin</option>
                <option value="bank_manager">Bank Manager</option>
                <option value="company_manager">Company Manager</option>
                <option value="company_employee">Company Employee</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRole}
                disabled={actionLoading || newRole === editingUser.role}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
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
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out both;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}

export default UserManagement
