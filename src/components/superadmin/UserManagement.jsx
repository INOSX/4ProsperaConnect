import React, { useEffect, useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Edit2, 
  Shield, 
  Power,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import Card from '../ui/Card'
import Loading from '../ui/Loading'
import superAdminService from '../../services/superAdminService'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [editingUser, setEditingUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const pageSize = 20

  useEffect(() => {
    loadUsers()
  }, [currentPage, roleFilter, searchTerm])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const result = await superAdminService.getAllUsers({
        page: currentPage,
        pageSize,
        role: roleFilter || null,
        search: searchTerm
      })
      setUsers(result.users)
      setTotalPages(result.pages)
      setTotalUsers(result.total)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = (user) => {
    setEditingUser(user)
    setNewRole(user.role)
  }

  const handleSaveRole = async () => {
    if (!editingUser || !newRole) return

    try {
      setActionLoading(true)
      await superAdminService.updateUserRole(editingUser.user_id, newRole)
      await loadUsers()
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
    const confirmMsg = user.is_active 
      ? `Desativar o usuário ${user.name}?`
      : `Ativar o usuário ${user.name}?`
    
    if (!confirm(confirmMsg)) return

    try {
      setActionLoading(true)
      await superAdminService.toggleUserStatus(user.user_id, !user.is_active)
      await loadUsers()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status do usuário')
    } finally {
      setActionLoading(false)
    }
  }

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

  const allRoles = ['super_admin', 'bank_manager', 'company_manager', 'company_employee']

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
            Total: {totalUsers} usuários cadastrados
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
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
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos os roles</option>
              {allRoles.map(role => (
                <option key={role} value={role}>{roleNames[role]}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      {loading ? (
        <Card className="bg-gray-800 border-gray-700 p-12">
          <div className="flex justify-center">
            <Loading />
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
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingUser?.id === user.id ? (
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="px-3 py-1 bg-gray-900 border border-blue-500 rounded text-sm text-white"
                          disabled={actionLoading}
                        >
                          {allRoles.map(role => (
                            <option key={role} value={role}>{roleNames[role]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[user.role]}`}>
                          {roleNames[user.role] || user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <Check className="h-3 w-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          <X className="h-3 w-3" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingUser?.id === user.id ? (
                          <>
                            <button
                              onClick={handleSaveRole}
                              disabled={actionLoading}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                              title="Salvar"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null)
                                setNewRole('')
                              }}
                              disabled={actionLoading}
                              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                              title="Cancelar"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditRole(user)}
                              disabled={actionLoading}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                              title="Editar Role"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={actionLoading}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                user.is_active !== false
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-green-600 hover:bg-green-700'
                              } text-white`}
                              title={user.is_active !== false ? 'Desativar' : 'Ativar'}
                            >
                              <Power className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default UserManagement
