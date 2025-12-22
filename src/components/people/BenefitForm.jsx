import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { BenefitService } from '../../services/benefitService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { ArrowLeft, Save, Package, FileText, Settings } from 'lucide-react'

const BenefitForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!id
  const [company, setCompany] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    company_id: '',
    benefit_type: '',
    name: '',
    description: '',
    configuration: {},
    eligibility_rules: {},
    is_active: true,
    min_hire_days: ''
  })

  const benefitTypes = [
    { value: 'health_insurance', label: 'Plano de Saúde' },
    { value: 'meal_voucher', label: 'Vale Alimentação' },
    { value: 'transportation', label: 'Vale Transporte' },
    { value: 'financial_product', label: 'Produto Financeiro' },
    { value: 'education', label: 'Educação' },
    { value: 'wellness', label: 'Bem-estar' },
    { value: 'other', label: 'Outro' }
  ]

  useEffect(() => {
    if (user) {
      loadCompany()
    }
    if (isEdit && id) {
      loadBenefit()
    }
  }, [user, id, isEdit])

  const loadCompany = async () => {
    try {
      const companyResult = await CompanyService.getUserCompanies(user.id)
      if (companyResult.success && companyResult.companies && companyResult.companies.length > 0) {
        const userCompany = companyResult.companies[0]
        setCompany(userCompany)
        setFormData(prev => ({ ...prev, company_id: userCompany.id }))
      }
    } catch (error) {
      console.error('Error loading company:', error)
    }
  }

  const loadBenefit = async () => {
    setLoading(true)
    try {
      const benefitResult = await BenefitService.getBenefit(id)
      if (benefitResult.success && benefitResult.benefit) {
        const benefit = benefitResult.benefit
        setFormData({
          company_id: benefit.company_id,
          benefit_type: benefit.benefit_type || '',
          name: benefit.name || '',
          description: benefit.description || '',
          configuration: benefit.configuration || {},
          eligibility_rules: benefit.eligibility_rules || {},
          is_active: benefit.is_active !== undefined ? benefit.is_active : true,
          min_hire_days: benefit.eligibility_rules?.min_hire_days || ''
        })
      }
    } catch (error) {
      console.error('Error loading benefit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => {
      if (name === 'min_hire_days') {
        return {
          ...prev,
          eligibility_rules: {
            ...prev.eligibility_rules,
            min_hire_days: value ? parseInt(value) : undefined
          }
        }
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
    })
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value
      }
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.company_id) {
      newErrors.company_id = 'Empresa é obrigatória'
    }
    if (!formData.benefit_type) {
      newErrors.benefit_type = 'Tipo de benefício é obrigatório'
    }
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
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
      const benefitData = {
        company_id: formData.company_id,
        benefit_type: formData.benefit_type,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        configuration: formData.configuration,
        eligibility_rules: formData.eligibility_rules,
        is_active: formData.is_active
      }

      let result
      if (isEdit) {
        result = await BenefitService.updateBenefit(id, benefitData)
      } else {
        result = await BenefitService.createBenefit(benefitData)
      }

      if (result.success) {
        navigate('/people/benefits')
      }
    } catch (error) {
      console.error('Error saving benefit:', error)
      alert(error.message || 'Erro ao salvar benefício. Tente novamente.')
    } finally {
      setSaving(false)
    }
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
            onClick={() => navigate('/people/benefits')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Benefício' : 'Novo Benefício'}
            </h1>
            <p className="text-gray-600">{company.company_name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Informações Básicas
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Benefício *
                    </label>
                    <select
                      name="benefit_type"
                      value={formData.benefit_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.benefit_type ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      {benefitTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.benefit_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.benefit_type}</p>
                    )}
                  </div>

                  <Input
                    label="Nome do Benefício *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    icon={Package}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Descreva o benefício oferecido..."
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Configuração */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuração
                </h2>
                <div className="space-y-4">
                  {formData.benefit_type === 'health_insurance' && (
                    <>
                      <Input
                        label="Fornecedor (ex: Unimed, Bradesco)"
                        value={formData.configuration.provider || ''}
                        onChange={(e) => handleConfigChange('provider', e.target.value)}
                      />
                      <Input
                        label="Cobertura (ex: Nacional, Regional)"
                        value={formData.configuration.coverage || ''}
                        onChange={(e) => handleConfigChange('coverage', e.target.value)}
                      />
                    </>
                  )}

                  {(formData.benefit_type === 'meal_voucher' || formData.benefit_type === 'transportation') && (
                    <>
                      <Input
                        label="Fornecedor (ex: Alelo, Sodexo)"
                        value={formData.configuration.provider || ''}
                        onChange={(e) => handleConfigChange('provider', e.target.value)}
                      />
                      <Input
                        label="Valor Mensal (R$)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.configuration.amount || ''}
                        onChange={(e) => handleConfigChange('amount', parseFloat(e.target.value) || 0)}
                      />
                    </>
                  )}

                  {formData.benefit_type === 'education' && (
                    <>
                      <Input
                        label="Valor Máximo Mensal (R$)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.configuration.max_amount || ''}
                        onChange={(e) => handleConfigChange('max_amount', parseFloat(e.target.value) || 0)}
                      />
                    </>
                  )}

                  {formData.benefit_type === 'financial_product' && (
                    <>
                      <Input
                        label="Fornecedor"
                        value={formData.configuration.provider || ''}
                        onChange={(e) => handleConfigChange('provider', e.target.value)}
                      />
                      <Input
                        label="Valor de Cobertura"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.configuration.coverage_amount || ''}
                        onChange={(e) => handleConfigChange('coverage_amount', parseFloat(e.target.value) || 0)}
                      />
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Regras de Elegibilidade */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Regras de Elegibilidade
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Dias Mínimos de Admissão (opcional)"
                    name="min_hire_days"
                    type="number"
                    min="0"
                    value={formData.min_hire_days}
                    onChange={handleChange}
                    placeholder="Ex: 90 dias"
                  />
                  <p className="text-xs text-gray-500">
                    Deixe em branco se o benefício estiver disponível imediatamente após a admissão
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Benefício Ativo</span>
                </label>
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
                onClick={() => navigate('/people/benefits')}
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

export default BenefitForm

