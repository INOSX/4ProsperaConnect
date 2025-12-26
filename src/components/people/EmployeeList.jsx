import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { EmployeeService, isCompanyAdmin } from '../../services/employeeService'
import { ClientService } from '../../services/clientService'
import { canManageEmployees } from '../../utils/permissions'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Users, Search, Plus, Edit, Eye, Filter, X, Shield } from 'lucide-react'

const EmployeeList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isBankAdmin, setIsBankAdmin] = useState(false)
  const [isCompanyAdminUser, setIsCompanyAdminUser] = useState(false)
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    if (user) {
      loadCompanyAndEmployees()
    }
  }, [user])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm, departmentFilter, statusFilter])

  const loadCompanyAndEmployees = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Verificar se é Admin do Banco
      let userIsBankAdmin = false
      try {
        const clientResult = await ClientService.getClientByUserId(user.id)
        if (clientResult.success && clientResult.client) {
          userIsBankAdmin = clientResult.client.role === 'admin'
          setIsBankAdmin(userIsBankAdmin)
        }
      } catch (e) {
        console.warn('Error checking bank admin status:', e)
      }

      const companyResult = await CompanyService.getUserCompanies(user.id, userIsBankAdmin)
      if (companyResult.success && companyResult.companies && companyResult.companies.length > 0) {
        const userCompany = companyResult.companies[0]
        setCompany(userCompany)

        // Verificar se é Admin do Cliente desta empresa
        const userIsCompanyAdmin = await isCompanyAdmin(user.id, userCompany.id)
        setIsCompanyAdminUser(userIsCompanyAdmin)
        setCanManage(canManageEmployees(userIsBankAdmin ? 'admin' : 'user', userIsCompanyAdmin))

        const employeesResult = await EmployeeService.getCompanyEmployees(userCompany.id)
        if (employeesResult.success) {
          setEmployees(employeesResult.employees || [])
        }
      }
    } catch (error) {
      console.error('Error loading company and employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    let filtered = [...employees]

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.cpf?.includes(term) ||
        emp.position?.toLowerCase().includes(term)
      )
    }

    // Filtro por departamento
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter)
    }

    // Filtro por status
    if (statusFilter === 'active') {
      filtered = filtered.filter(emp => emp.is_active)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(emp => !emp.is_active)
    }

    setFilteredEmployees(filtered)
  }

  const getDepartments = () => {
    const departments = new Set()
    employees.forEach(emp => {
      if (emp.department) {
        departments.add(emp.department)
      }
    })
    return Array.from(departments).sort()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDepartmentFilter('')
    setStatusFilter('all')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando colaboradores...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma empresa encontrada</p>
        <p className="text-sm text-gray-400 mt-2">Entre em contato com o suporte para configurar sua empresa</p>
      </div>
    )
  }

  const departments = getDepartments()
  const activeCount = employees.filter(e => e.is_active).length
  const inactiveCount = employees.filter(e => !e.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
            {isBankAdmin && (
              <span className="px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Admin do Banco</span>
              </span>
            )}
            {isCompanyAdminUser && !isBankAdmin && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Admin da Empresa</span>
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {canManage 
              ? `Gerencie os colaboradores de ${company.company_name}`
              : `Visualize os colaboradores de ${company.company_name}`
            }
          </p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            onClick={() => navigate('/people/employees/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Colaborador
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-gray-400">{inactiveCount}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </h2>
            {(searchTerm || departmentFilter || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email, CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filtro por departamento */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Filtro por status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Apenas ativos</option>
              <option value="inactive">Apenas inativos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de colaboradores */}
      <Card>
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Mostrando {filteredEmployees.length} de {employees.length} colaborador{employees.length !== 1 ? 'es' : ''}
            </p>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhum colaborador encontrado</p>
              {employees.length === 0 && (
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate('/people/employees/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Colaborador
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-medium">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.cpf}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.position || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/people/employees/${employee.id}`)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalhes"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/people/employees/${employee.id}/edit`)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default EmployeeList

