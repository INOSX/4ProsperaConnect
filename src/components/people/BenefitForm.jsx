import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CompanyService } from '../../services/companyService'
import { BenefitService } from '../../services/benefitService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { 
  ArrowLeft, 
  Save, 
  Package, 
  FileText, 
  Settings, 
  Heart,
  ShoppingBag,
  Bus,
  TrendingUp,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign,
  Calendar,
  Users,
  Building2
} from 'lucide-react'

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
    { 
      value: 'health_insurance', 
      label: 'Plano de Saúde',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Assistência médica e hospitalar'
    },
    { 
      value: 'meal_voucher', 
      label: 'Vale Alimentação',
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Auxílio para compras de alimentos'
    },
    { 
      value: 'transportation', 
      label: 'Vale Transporte',
      icon: Bus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Auxílio para deslocamento'
    },
    { 
      value: 'financial_product', 
      label: 'Produto Financeiro',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Produtos bancários e seguros'
    },
    { 
      value: 'education', 
      label: 'Educação',
      icon: GraduationCap,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Cursos e capacitações'
    },
    { 
      value: 'wellness', 
      label: 'Bem-estar',
      icon: Sparkles,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: 'Academia, lazer e qualidade de vida'
    },
    { 
      value: 'other', 
      label: 'Outro',
      icon: Package,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Outros tipos de benefícios'
    }
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

  const getSelectedBenefitType = () => {
    return benefitTypes.find(type => type.value === formData.benefit_type)
  }

  const getCompletionPercentage = () => {
    let completed = 0
    let total = 3 // benefit_type, name, company_id

    if (formData.benefit_type) completed++
    if (formData.name) completed++
    if (formData.company_id) completed++

    return Math.round((completed / total) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Carregando...</div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Nenhuma empresa encontrada</p>
            <p className="text-gray-500 text-sm mb-4">Você precisa estar vinculado a uma empresa para criar benefícios.</p>
            <Button onClick={() => navigate('/people/benefits')}>
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const selectedType = getSelectedBenefitType()
  const completionPercentage = getCompletionPercentage()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => navigate('/people/benefits')}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  {selectedType ? (
                    <selectedType.icon className="h-6 w-6 text-white" />
                  ) : (
                    <Package className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {isEdit ? 'Editar Benefício' : 'Novo Benefício'}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building2 className="h-4 w-4 text-white/80" />
                    <p className="text-white/90">{company.company_name}</p>
                  </div>
                </div>
              </div>
              {selectedType && (
                <p className="text-white/80 text-sm">{selectedType.description}</p>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="ml-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[180px]">
              <div className="text-white/80 text-xs font-medium mb-2">Progresso do formulário</div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-white font-bold text-lg">{completionPercentage}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seleção de Tipo - Cards visuais */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-6 py-4 border-b border-primary-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary-600" />
                  Tipo de Benefício
                  <span className="ml-2 text-red-500">*</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {benefitTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.benefit_type === type.value
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleChange({ target: { name: 'benefit_type', value: type.value } })}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-105 ${
                          isSelected
                            ? `${type.bgColor} border-current ${type.color} shadow-md`
                            : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mb-2 ${isSelected ? type.color : 'text-gray-400 group-hover:text-primary-500'}`} />
                        <div className={`text-sm font-medium ${isSelected ? type.color : 'text-gray-700'}`}>
                          {type.label}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className={`absolute top-2 right-2 h-5 w-5 ${type.color}`} />
                        )}
                      </button>
                    )
                  })}
                </div>
                {errors.benefit_type && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.benefit_type}</span>
                  </div>
                )}
                {selectedType && (
                  <div className={`mt-4 p-3 rounded-lg ${selectedType.bgColor} border border-current ${selectedType.color}/20`}>
                    <div className="flex items-start space-x-2">
                      <Info className={`h-4 w-4 mt-0.5 ${selectedType.color}`} />
                      <p className={`text-sm ${selectedType.color}`}>
                        {selectedType.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Informações Básicas */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-6 py-4 border-b border-blue-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Informações Básicas
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Benefício
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Ex: Plano de Saúde Premium, Vale Alimentação R$500"
                    className="text-base"
                    required
                  />
                  {formData.name && formData.name.length >= 3 && (
                    <div className="flex items-center space-x-1 text-green-600 text-xs mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Nome válido</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição Detalhada
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base resize-none"
                    placeholder="Descreva os detalhes, coberturas, limites e condições do benefício..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length} caracteres
                  </p>
                </div>
              </div>
            </Card>

            {/* Configuração Dinâmica */}
            {formData.benefit_type && (
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 px-6 py-4 border-b border-purple-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-purple-600" />
                    Configuração Específica
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {formData.benefit_type === 'health_insurance' && (
                    <>
                      <Input
                        label="Fornecedor / Operadora"
                        value={formData.configuration.provider || ''}
                        onChange={(e) => handleConfigChange('provider', e.target.value)}
                        placeholder="Ex: Unimed, Bradesco Saúde, Amil"
                        icon={Building2}
                      />
                      <Input
                        label="Tipo de Cobertura"
                        value={formData.configuration.coverage || ''}
                        onChange={(e) => handleConfigChange('coverage', e.target.value)}
                        placeholder="Ex: Nacional, Regional, Apartamento"
                        icon={Heart}
                      />
                    </>
                  )}

                  {(formData.benefit_type === 'meal_voucher' || formData.benefit_type === 'transportation') && (
                    <>
                      <Input
                        label="Fornecedor do Vale"
                        value={formData.configuration.provider || ''}
                        onChange={(e) => handleConfigChange('provider', e.target.value)}
                        placeholder="Ex: Alelo, Sodexo, VR, Ticket"
                        icon={Building2}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="inline h-4 w-4 mr-1" />
                          Valor Mensal (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.configuration.amount || ''}
                            onChange={(e) => handleConfigChange('amount', parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                            placeholder="0,00"
                          />
                        </div>
                        {formData.configuration.amount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Valor anual: R$ {(formData.configuration.amount * 12).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {formData.benefit_type === 'education' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="inline h-4 w-4 mr-1" />
                          Valor Máximo Mensal (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.configuration.max_amount || ''}
                            onChange={(e) => handleConfigChange('max_amount', parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                      <Input
                        label="Tipos de Cursos Cobertos"
                        value={formData.configuration.course_types || ''}
                        onChange={(e) => handleConfigChange('course_types', e.target.value)}
                        placeholder="Ex: Graduação, Pós, MBA, Idiomas"
                      />
                    </>
                  )}

                  {formData.benefit_type === 'financial_product' && (
                    <>
                      <Input
                        label="Fornecedor / Instituição"
                        value={formData.configuration.provider || ''}
                        onChange={(e) => handleConfigChange('provider', e.target.value)}
                        placeholder="Ex: Banco ABC, Seguradora XYZ"
                        icon={Building2}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="inline h-4 w-4 mr-1" />
                          Valor de Cobertura (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.configuration.coverage_amount || ''}
                            onChange={(e) => handleConfigChange('coverage_amount', parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.benefit_type === 'wellness' && (
                    <>
                      <Input
                        label="Fornecedor / Parceiro"
                        value={formData.configuration.provider || ''}
                        onChange={(e) => handleConfigChange('provider', e.target.value)}
                        placeholder="Ex: Smart Fit, Total Pass"
                        icon={Building2}
                      />
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Regras de Elegibilidade */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-green-100/50 px-6 py-4 border-b border-green-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Regras de Elegibilidade
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Período Mínimo de Admissão
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        name="min_hire_days"
                        type="number"
                        min="0"
                        value={formData.min_hire_days}
                        onChange={handleChange}
                        className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                        placeholder="0"
                      />
                      <span className="text-gray-700">dias</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600 flex items-start">
                        <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Deixe em branco ou "0" para disponibilizar imediatamente após admissão</span>
                      </p>
                      {formData.min_hire_days > 0 && (
                        <p className="text-xs text-primary-600 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Benefício disponível após {formData.min_hire_days} dias ({Math.round(formData.min_hire_days / 30)} meses)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Status do Benefício</h3>
              </div>
              <div className="p-6">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      Benefício Ativo
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.is_active 
                        ? 'Colaboradores poderão receber este benefício' 
                        : 'Benefício inativo e não disponível para atribuição'}
                    </p>
                  </div>
                </label>

                <div className={`mt-4 p-3 rounded-lg ${formData.is_active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center space-x-2">
                    {formData.is_active ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Ativo</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Inativo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      {isEdit ? 'Atualizar Benefício' : 'Criar Benefício'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/people/benefits')}
                  className="w-full justify-center"
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </Card>

            {/* Help Card */}
            <Card className="overflow-hidden border-blue-200 bg-blue-50/50">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Dica</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Configure todos os detalhes do benefício antes de atribuí-lo aos colaboradores. Você poderá editar estas informações posteriormente.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default BenefitForm
