import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { EmployeeService } from '../../services/employeeService'
import { BenefitService } from '../../services/benefitService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { ArrowLeft, Save, User, Mail, Phone, Briefcase, Calendar, DollarSign, Package } from 'lucide-react'

const EmployeeForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!id
  const [company, setCompany] = useState(null)
  const [availableBenefits, setAvailableBenefits] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    company_id: '',
    cpf: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: '',
    salary: '',
    has_platform_access: false,
    is_active: true,
    selected_benefits: []
  })

  useEffect(() => {
    if (user) {
      loadCompany()
    }
    if (isEdit && id) {
      loadEmployee()
    }
  }, [user, id, isEdit])

  const loadCompany = async () => {
    try {
      const companyResult = await CompanyService.getUserCompanies(user.id)
      if (companyResult.success && companyResult.companies && companyResult.companies.length > 0) {
        const userCompany = companyResult.companies[0]
        setCompany(userCompany)
        setFormData(prev => ({ ...prev, company_id: userCompany.id }))

        // Carregar benefícios disponíveis
        const benefitsResult = await BenefitService.getCompanyBenefits(userCompany.id)
        if (benefitsResult.success) {
          setAvailableBenefits(benefitsResult.benefits || [])
        }
      }
    } catch (error) {
      console.error('Error loading company:', error)
    }
  }

  const loadEmployee = async () => {
    setLoading(true)
    try {
      const employeeResult = await EmployeeService.getEmployee(id)
      if (employeeResult.success && employeeResult.employee) {
        const emp = employeeResult.employee
        setFormData({
          company_id: emp.company_id,
          cpf: emp.cpf || '',
          name: emp.name || '',
          email: emp.email || '',
          phone: emp.phone || '',
          position: emp.position || '',
          department: emp.department || '',
          hire_date: emp.hire_date ? emp.hire_date.split('T')[0] : '',
          salary: emp.salary || '',
          has_platform_access: emp.has_platform_access || false,
          is_active: emp.is_active !== undefined ? emp.is_active : true,
          selected_benefits: []
        })

        // Carregar benefícios do colaborador
        const benefitsResult = await EmployeeService.getEmployeeBenefits(id)
        if (benefitsResult.success) {
          const activeBenefits = benefitsResult.benefits
            .filter(b => b.status === 'active')
            .map(b => b.company_benefit_id)
          setFormData(prev => ({ ...prev, selected_benefits: activeBenefits }))
        }
      }
    } catch (error) {
      console.error('Error loading employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleBenefitToggle = (benefitId) => {
    setFormData(prev => {
      const benefits = prev.selected_benefits || []
      if (benefits.includes(benefitId)) {
        return { ...prev, selected_benefits: benefits.filter(id => id !== benefitId) }
      } else {
        return { ...prev, selected_benefits: [...benefits, benefitId] }
      }
    })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.company_id) {
      newErrors.company_id = 'Empresa é obrigatória'
    }
    if (!formData.cpf || formData.cpf.length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos'
    }
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.position) {
      newErrors.position = 'Cargo é obrigatório'
    }
    if (!formData.department) {
      newErrors.department = 'Departamento é obrigatório'
    }
    if (!formData.hire_date) {
      newErrors.hire_date = 'Data de admissão é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setSaving(true)
    try {
      const employeeData = {
        company_id: formData.company_id,
        cpf: formData.cpf.replace(/\D/g, ''),
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        position: formData.position.trim(),
        department: formData.department.trim(),
        hire_date: formData.hire_date,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        has_platform_access: formData.has_platform_access,
        is_active: formData.is_active
      }

      let result
      if (isEdit) {
        result = await EmployeeService.updateEmployee(id, employeeData)
      } else {
        result = await EmployeeService.createEmployee(employeeData)
      }

      if (result.success) {
        // Ativar benefícios selecionados
        if (formData.selected_benefits.length > 0) {
          const employeeId = result.employee.id
          for (const benefitId of formData.selected_benefits) {
            try {
              await EmployeeService.activateBenefit(employeeId, benefitId)
            } catch (error) {
              console.error('Error activating benefit:', error)
            }
          }
        }

        navigate(`/people/employees/${result.employee.id}`)
      }
    } catch (error) {
      console.error('Error saving employee:', error)
      alert(error.message || 'Erro ao salvar colaborador. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma empresa encontrada</p>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Colaborador' : 'Novo Colaborador'}
            </h1>
            <p className="text-gray-600">{company.company_name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações Pessoais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome Completo *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    icon={User}
                    required
                  />
                  <Input
                    label="CPF *"
                    name="cpf"
                    value={formatCPF(formData.cpf)}
                    onChange={(e) => {
                      const numbers = e.target.value.replace(/\D/g, '')
                      if (numbers.length <= 11) {
                        handleChange({ ...e, target: { ...e.target, value: numbers } })
                      }
                    }}
                    error={errors.cpf}
                    maxLength={14}
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={Mail}
                  />
                  <Input
                    label="Telefone"
                    name="phone"
                    value={formatPhone(formData.phone)}
                    onChange={(e) => {
                      const numbers = e.target.value.replace(/\D/g, '')
                      if (numbers.length <= 11) {
                        handleChange({ ...e, target: { ...e.target, value: numbers } })
                      }
                    }}
                    error={errors.phone}
                    maxLength={15}
                  />
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
                  <Input
                    label="Cargo *"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    error={errors.position}
                    icon={Briefcase}
                    required
                  />
                  <Input
                    label="Departamento *"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    error={errors.department}
                    required
                  />
                  <Input
                    label="Data de Admissão *"
                    name="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={handleChange}
                    error={errors.hire_date}
                    icon={Calendar}
                    required
                  />
                  <Input
                    label="Salário"
                    name="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salary}
                    onChange={handleChange}
                    error={errors.salary}
                    icon={DollarSign}
                  />
                </div>
              </div>
            </Card>

            {/* Benefícios */}
            {availableBenefits.length > 0 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Benefícios
                  </h2>
                  <div className="space-y-3">
                    {availableBenefits.map((benefit) => (
                      <label
                        key={benefit.id}
                        className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selected_benefits.includes(benefit.id)}
                          onChange={() => handleBenefitToggle(benefit.id)}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{benefit.name}</p>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Configurações</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="has_platform_access"
                      checked={formData.has_platform_access}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Acesso à Plataforma</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Colaborador Ativo</span>
                  </label>
                </div>
              </div>
            </Card>

            <div className="flex space-x-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/people/employees')}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EmployeeForm

