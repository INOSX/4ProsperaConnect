import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { EmployeeService } from '../../services/employeeService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ArrowLeft, Edit, User, Mail, Phone, Briefcase, Calendar, DollarSign, Package, CheckCircle, XCircle } from 'lucide-react'

const EmployeeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [benefits, setBenefits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadEmployeeData()
    }
  }, [id])

  const loadEmployeeData = async () => {
    setLoading(true)
    try {
      const employeeResult = await EmployeeService.getEmployee(id)
      if (employeeResult.success && employeeResult.employee) {
        setEmployee(employeeResult.employee)

        const benefitsResult = await EmployeeService.getEmployeeBenefits(id)
        if (benefitsResult.success) {
          setBenefits(benefitsResult.benefits || [])
        }
      }
    } catch (error) {
      console.error('Error loading employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!employee) return

    try {
      const result = await EmployeeService.updateEmployee(id, {
        is_active: !employee.is_active
      })

      if (result.success) {
        setEmployee(result.employee)
      }
    } catch (error) {
      console.error('Error updating employee status:', error)
      alert('Erro ao atualizar status do colaborador')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando dados do colaborador...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Colaborador não encontrado</p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/people/employees')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Lista
        </Button>
      </div>
    )
  }

  const activeBenefits = benefits.filter(b => b.status === 'active')
  const formatCurrency = (value) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/people/employees')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-gray-600">{employee.position || 'Sem cargo definido'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/people/employees/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant={employee.is_active ? 'danger' : 'primary'}
            onClick={handleToggleStatus}
          >
            {employee.is_active ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Desativar
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Ativar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          employee.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {employee.is_active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome Completo</p>
                  <p className="text-base font-medium text-gray-900">{employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="text-base font-medium text-gray-900">{employee.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </p>
                  <p className="text-base font-medium text-gray-900">{employee.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Telefone
                  </p>
                  <p className="text-base font-medium text-gray-900">{employee.phone || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Informações Profissionais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cargo</p>
                  <p className="text-base font-medium text-gray-900">{employee.position || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Departamento</p>
                  <p className="text-base font-medium text-gray-900">{employee.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Data de Admissão
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Salário
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {formatCurrency(employee.salary)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Acesso à Plataforma</p>
                  <p className="text-base font-medium text-gray-900">
                    {employee.has_platform_access ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Benefícios */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Benefícios ({activeBenefits.length})
              </h2>
              {activeBenefits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum benefício ativo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBenefits.map((benefit) => (
                    <div key={benefit.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {benefit.company_benefits?.name || 'Benefício'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {benefit.company_benefits?.description || ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Ativo desde {new Date(benefit.activation_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar com Ações Rápidas */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate(`/people/employees/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Colaborador
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/people/benefits')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Gerenciar Benefícios
                </Button>
              </div>
            </div>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">ID do Colaborador</p>
                  <p className="text-gray-900 font-mono text-xs">{employee.id}</p>
                </div>
                {employee.created_at && (
                  <div>
                    <p className="text-gray-600">Data de Cadastro</p>
                    <p className="text-gray-900">
                      {new Date(employee.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {employee.updated_at && (
                  <div>
                    <p className="text-gray-600">Última Atualização</p>
                    <p className="text-gray-900">
                      {new Date(employee.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetail

