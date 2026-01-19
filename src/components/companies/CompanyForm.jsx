import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { ClientService } from '../../services/clientService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { ArrowLeft, Save, Building2, AlertCircle } from 'lucide-react'

const CompanyForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    cnpj: '',
    company_name: '',
    trade_name: '',
    company_type: 'LTDA',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: ''
    },
    industry: '',
    annual_revenue: ''
  })

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
    if (isEdit && id) {
      loadCompany()
    }
  }, [user, id, isEdit])

  const checkAdminStatus = async () => {
    if (!user) return
    try {
      const clientResult = await ClientService.getClientByUserId(user.id)
      if (clientResult.success && clientResult.client) {
        const role = clientResult.client.role
        const userIsAdmin = ['super_admin', 'bank_manager', 'admin'].includes(role)
        console.log('🔐 [CompanyForm] User role:', role, '| isAdmin:', userIsAdmin)
        setIsAdmin(userIsAdmin)
        if (!userIsAdmin) {
          // Redirecionar se não for admin
          navigate('/companies', { state: { error: 'Apenas administradores podem criar/editar empresas.' } })
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const loadCompany = async () => {
    if (!id) return
    setLoading(true)
    try {
      const result = await CompanyService.getCompany(id)
      if (result.success && result.company) {
        const company = result.company
        setFormData({
          cnpj: company.cnpj || '',
          company_name: company.company_name || '',
          trade_name: company.trade_name || '',
          company_type: company.company_type || 'LTDA',
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipcode: ''
          },
          industry: company.industry || '',
          annual_revenue: company.annual_revenue || ''
        })
      }
    } catch (error) {
      console.error('Error loading company:', error)
      alert('Erro ao carregar dados da empresa')
    } finally {
      setLoading(false)
    }
  }

  const formatCNPJ = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return value
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'cnpj') {
      // Formatar CNPJ
      const formatted = formatCNPJ(value)
      setFormData(prev => ({
        ...prev,
        cnpj: formatted
      }))
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    const cleanCnpj = formData.cnpj.replace(/\D/g, '')
    if (!formData.cnpj || cleanCnpj === '') {
      newErrors.cnpj = 'CNPJ é obrigatório'
    } else if (cleanCnpj.length !== 14) {
      newErrors.cnpj = 'CNPJ deve conter 14 dígitos'
    }

    if (!formData.company_name || formData.company_name.trim() === '') {
      newErrors.company_name = 'Razão social é obrigatória'
    }

    if (!formData.company_type) {
      newErrors.company_type = 'Tipo de empresa é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAdmin) {
      alert('Você não tem permissão para realizar esta ação.')
      return
    }

    if (!validateForm()) {
      return
    }

    setSaving(true)
    setErrors({})

    try {
      // Limpar CNPJ (remover caracteres não numéricos)
      const cleanCnpj = formData.cnpj.replace(/\D/g, '')
      
      const companyData = {
        cnpj: cleanCnpj,
        company_name: formData.company_name.trim(),
        trade_name: formData.trade_name.trim() || null,
        company_type: formData.company_type,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: Object.values(formData.address).some(v => v) ? formData.address : null,
        industry: formData.industry.trim() || null,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null
      }

      let result
      if (isEdit) {
        result = await CompanyService.updateCompany(id, companyData)
      } else {
        result = await CompanyService.createCompany(companyData, user.id)
      }

      if (result.success) {
        navigate('/companies', { 
          state: { 
            message: isEdit ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!' 
          } 
        })
      } else {
        throw new Error(result.error || 'Erro ao salvar empresa')
      }
    } catch (error) {
      console.error('Error saving company:', error)
      const errorMessage = error.message || 'Erro ao salvar empresa. Tente novamente.'
      if (errorMessage.includes('já existe') || errorMessage.includes('already exists')) {
        setErrors({ cnpj: 'Uma empresa com este CNPJ já está cadastrada' })
      } else {
        alert(errorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando dados da empresa...</div>
      </div>
    )
  }

  if (!isAdmin && !loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <p className="text-gray-500 mb-2">Acesso Negado</p>
            <p className="text-sm text-gray-400 mb-4">
              Apenas administradores podem criar/editar empresas.
            </p>
            <Button onClick={() => navigate('/companies')}>
              Voltar para Lista
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/companies')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Empresa' : 'Nova Empresa'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Atualize as informações da empresa' : 'Cadastre uma nova empresa no sistema'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Informações Básicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    disabled={isEdit}
                    error={errors.cnpj}
                    maxLength={18}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Empresa <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="company_type"
                    value={formData.company_type}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.company_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="MEI">MEI</option>
                    <option value="PME">PME</option>
                    <option value="EIRELI">EIRELI</option>
                    <option value="LTDA">LTDA</option>
                    <option value="SA">SA</option>
                  </select>
                  {errors.company_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_type}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razão Social <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Nome completo da empresa"
                    error={errors.company_name}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Fantasia
                  </label>
                  <Input
                    type="text"
                    name="trade_name"
                    value={formData.trade_name}
                    onChange={handleChange}
                    placeholder="Nome comercial (opcional)"
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contato</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <Input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rua
                  </label>
                  <Input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Nome da rua"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <Input
                    type="text"
                    name="address.number"
                    value={formData.address.number}
                    onChange={handleChange}
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <Input
                    type="text"
                    name="address.complement"
                    value={formData.address.complement}
                    onChange={handleChange}
                    placeholder="Apto, Sala, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro
                  </label>
                  <Input
                    type="text"
                    name="address.neighborhood"
                    value={formData.address.neighborhood}
                    onChange={handleChange}
                    placeholder="Nome do bairro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <Input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <Input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <Input
                    type="text"
                    name="address.zipcode"
                    value={formData.address.zipcode}
                    onChange={handleChange}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setor/Indústria
                  </label>
                  <Input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Ex: Construção, Tecnologia, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receita Anual (R$)
                  </label>
                  <Input
                    type="number"
                    name="annual_revenue"
                    value={formData.annual_revenue}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/companies')}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? 'Atualizar' : 'Criar'} Empresa
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}

export default CompanyForm

