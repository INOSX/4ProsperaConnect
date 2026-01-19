import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmployeeService } from '../../services/employeeService'
import { BenefitService } from '../../services/benefitService'
import { useAuth } from '../../contexts/AuthContext'
import { ClientService } from '../../services/clientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Search, Users, Package, Gift, Plus, Trash2, CheckCircle, XCircle, Building2 } from 'lucide-react'

const AssignProductsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [employees, setEmployees] = useState([])
  const [companies, setCompanies] = useState([])
  const [benefits, setBenefits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (user) {
      loadInitialData()
    }
  }, [user])

  useEffect(() => {
    if (selectedCompany) {
      loadEmployees()
      loadCompanyBenefits()
    }
  }, [selectedCompany])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Verificar se usuário é admin para carregar todas as empresas
      const clientResult = await ClientService.getClientByUserId(user.id)
      const isAdmin = clientResult.success && ['super_admin', 'bank_manager', 'admin'].includes(clientResult.client?.role)
      
      if (isAdmin) {
        // Carregar todas as empresas
        const { supabase } = await import('../../services/supabase')
        const { data: companiesData } = await supabase
          .from('companies')
          .select('*')
          .eq('is_active', true)
          .order('company_name')
        
        setCompanies(companiesData || [])
      } else {
        // Carregar apenas empresas do usuário
        const { CompanyService } = await import('../../services/companyService')
        const result = await CompanyService.getUserCompanies(user.id)
        setCompanies(result.success ? result.companies : [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    if (!selectedCompany) return
    
    try {
      const result = await EmployeeService.getCompanyEmployees(selectedCompany)
      if (result.success) {
        // Carregar benefícios de cada funcionário
        const employeesWithBenefits = await Promise.all(
          (result.employees || []).map(async (emp) => {
            const benefitsResult = await EmployeeService.getEmployeeBenefits(emp.id)
            return {
              ...emp,
              assignedBenefits: benefitsResult.success ? benefitsResult.benefits : []
            }
          })
        )
        setEmployees(employeesWithBenefits)
      }
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
    }
  }

  const loadCompanyBenefits = async () => {
    if (!selectedCompany) return
    
    try {
      const result = await BenefitService.getCompanyBenefits(selectedCompany)
      if (result.success) {
        setBenefits(result.benefits || [])
      }
    } catch (error) {
      console.error('Erro ao carregar benefícios:', error)
    }
  }

  const handleAssignBenefit = async (employeeId, benefitId) => {
    try {
      setAssigning(true)
      const result = await EmployeeService.assignBenefit(employeeId, benefitId)
      
      if (result.success) {
        await loadEmployees()
        setShowAssignModal(false)
        setSelectedEmployee(null)
      } else {
        alert('Erro ao atribuir benefício: ' + result.error)
      }
    } catch (error) {
      console.error('Erro ao atribuir benefício:', error)
      alert('Erro ao atribuir benefício')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveBenefit = async (employeeId, benefitId) => {
    if (!confirm('Deseja remover este benefício?')) return
    
    try {
      const result = await EmployeeService.removeBenefit(employeeId, benefitId)
      
      if (result.success) {
        await loadEmployees()
      } else {
        alert('Erro ao remover benefício: ' + result.error)
      }
    } catch (error) {
      console.error('Erro ao remover benefício:', error)
      alert('Erro ao remover benefício')
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cpf?.includes(searchTerm) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAvailableBenefits = (employee) => {
    const assignedIds = (employee.assignedBenefits || []).map(b => b.id)
    return benefits.filter(b => !assignedIds.includes(b.id) && b.is_active)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atribuir Produtos e Benefícios</h1>
          <p className="text-gray-600 mt-1">Gerencie benefícios e produtos dos colaboradores</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/people/products')}
        >
          Voltar
        </Button>
      </div>

      {/* Seleção de Empresa */}
      <Card>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline h-4 w-4 mr-2" />
            Selecione a Empresa
          </label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">-- Selecione uma empresa --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.company_name} - {company.cnpj}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedCompany && (
        <>
          {/* Busca */}
          <Card>
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador por nome, CPF ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          {/* Lista de Colaboradores */}
          <div className="grid grid-cols-1 gap-4">
            {filteredEmployees.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum colaborador encontrado</p>
                </div>
              </Card>
            ) : (
              filteredEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-5 w-5 text-primary-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                          {employee.is_active ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">CPF: {employee.cpf}</p>
                          {employee.email && <p className="text-sm text-gray-600">Email: {employee.email}</p>}
                          {employee.position && <p className="text-sm text-gray-600">Cargo: {employee.position}</p>}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setShowAssignModal(true)
                        }}
                        disabled={getAvailableBenefits(employee).length === 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Atribuir Benefício
                      </Button>
                    </div>

                    {/* Benefícios Atribuídos */}
                    {employee.assignedBenefits && employee.assignedBenefits.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                          <Gift className="h-4 w-4 mr-2" />
                          Benefícios Atribuídos ({employee.assignedBenefits.length})
                        </h4>
                        <div className="space-y-2">
                          {employee.assignedBenefits.map((benefit) => (
                            <div
                              key={benefit.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{benefit.name}</p>
                                {benefit.description && (
                                  <p className="text-sm text-gray-600">{benefit.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveBenefit(employee.id, benefit.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remover benefício"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal de Atribuição */}
      {showAssignModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Atribuir Benefício para {selectedEmployee.name}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {getAvailableBenefits(selectedEmployee).length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Todos os benefícios já foram atribuídos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getAvailableBenefits(selectedEmployee).map((benefit) => (
                    <button
                      key={benefit.id}
                      onClick={() => handleAssignBenefit(selectedEmployee.id, benefit.id)}
                      disabled={assigning}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{benefit.name}</p>
                          {benefit.description && (
                            <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Tipo: {benefit.benefit_type}
                          </p>
                        </div>
                        <Plus className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedEmployee(null)
                }}
                disabled={assigning}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignProductsPage
