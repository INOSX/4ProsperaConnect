import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProductService } from '../../services/productService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { ArrowLeft, Save, Package, FileText, Settings, DollarSign, Users, X } from 'lucide-react'

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    description: '',
    product_type: '',
    category: '',
    target_audience: [],
    features: [],
    pricing: {},
    requirements: {},
    is_active: true
  })

  const [newFeature, setNewFeature] = useState('')
  const [newTargetAudience, setNewTargetAudience] = useState('')
  const [pricingFields, setPricingFields] = useState({
    min_amount: '',
    min_premium: '',
    min_monthly_contribution: '',
    interest_rate: '',
    yield: ''
  })

  const productTypes = [
    { value: 'account', label: 'Conta' },
    { value: 'credit', label: 'Crédito' },
    { value: 'investment', label: 'Investimento' },
    { value: 'insurance', label: 'Seguro' },
    { value: 'benefit', label: 'Benefício' },
    { value: 'service', label: 'Serviço' }
  ]

  useEffect(() => {
    if (isEdit && id) {
      loadProduct()
    }
  }, [id, isEdit])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const result = await ProductService.getProduct(id)
      if (result.success && result.product) {
        const product = result.product
        setFormData({
          product_code: product.product_code || '',
          name: product.name || '',
          description: product.description || '',
          product_type: product.product_type || '',
          category: product.category || '',
          target_audience: product.target_audience || [],
          features: product.features || [],
          pricing: product.pricing || {},
          requirements: product.requirements || {},
          is_active: product.is_active !== undefined ? product.is_active : true
        })

        // Preencher campos de preço
        if (product.pricing) {
          setPricingFields({
            min_amount: product.pricing.min_amount || '',
            min_premium: product.pricing.min_premium || '',
            min_monthly_contribution: product.pricing.min_monthly_contribution || '',
            interest_rate: product.pricing.interest_rate || '',
            yield: product.pricing.yield || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
      alert('Erro ao carregar produto. Tente novamente.')
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

  const handlePricingChange = (field, value) => {
    setPricingFields(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addTargetAudience = () => {
    if (newTargetAudience.trim()) {
      setFormData(prev => ({
        ...prev,
        target_audience: [...prev.target_audience, newTargetAudience.trim()]
      }))
      setNewTargetAudience('')
    }
  }

  const removeTargetAudience = (index) => {
    setFormData(prev => ({
      ...prev,
      target_audience: prev.target_audience.filter((_, i) => i !== index)
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.product_code || formData.product_code.trim().length < 2) {
      newErrors.product_code = 'Código do produto é obrigatório (mínimo 2 caracteres)'
    }
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }
    if (!formData.product_type) {
      newErrors.product_type = 'Tipo de produto é obrigatório'
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
      // Preparar dados de preço
      const pricing = {}
      if (pricingFields.min_amount) pricing.min_amount = parseFloat(pricingFields.min_amount)
      if (pricingFields.min_premium) pricing.min_premium = parseFloat(pricingFields.min_premium)
      if (pricingFields.min_monthly_contribution) pricing.min_monthly_contribution = parseFloat(pricingFields.min_monthly_contribution)
      if (pricingFields.interest_rate) pricing.interest_rate = pricingFields.interest_rate
      if (pricingFields.yield) pricing.yield = pricingFields.yield

      const productData = {
        product_code: formData.product_code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        product_type: formData.product_type,
        category: formData.category.trim() || null,
        target_audience: formData.target_audience,
        features: formData.features,
        pricing: Object.keys(pricing).length > 0 ? pricing : {},
        requirements: formData.requirements,
        is_active: formData.is_active
      }

      let result
      if (isEdit) {
        result = await ProductService.updateProduct(id, productData)
      } else {
        result = await ProductService.createProduct(productData)
      }

      if (result.success) {
        navigate('/people/products/catalog')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      if (error.code === '23505') {
        alert('Código do produto já existe. Escolha outro código.')
      } else {
        alert(error.message || 'Erro ao salvar produto. Tente novamente.')
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/people/products/catalog')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Produto' : 'Novo Produto Bancário'}
            </h1>
            <p className="text-gray-600">Cadastre um novo produto no catálogo</p>
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
                  <Input
                    label="Código do Produto *"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleChange}
                    error={errors.product_code}
                    placeholder="Ex: ACC-001, INV-002"
                    required
                  />

                  <Input
                    label="Nome do Produto *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    icon={Package}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Produto *
                    </label>
                    <select
                      name="product_type"
                      value={formData.product_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.product_type ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      {productTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.product_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.product_type}</p>
                    )}
                  </div>

                  <Input
                    label="Categoria"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Ex: Conta Corrente, CDB, Seguro de Vida"
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
                      placeholder="Descreva o produto em detalhes..."
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Características */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Características
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adicionar Característica
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        placeholder="Ex: Liquidez diária, Sem tarifa de manutenção"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addFeature}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {formData.features.length > 0 && (
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Público-alvo */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Público-alvo
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adicionar Público-alvo
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTargetAudience}
                        onChange={(e) => setNewTargetAudience(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetAudience())}
                        placeholder="Ex: Colaboradores, Empresas, PF"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addTargetAudience}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {formData.target_audience.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.target_audience.map((audience, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full"
                        >
                          <span className="text-sm">{audience}</span>
                          <button
                            type="button"
                            onClick={() => removeTargetAudience(index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Preços e Condições */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Preços e Condições
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Valor Mínimo (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricingFields.min_amount}
                    onChange={(e) => handlePricingChange('min_amount', e.target.value)}
                    placeholder="0.00"
                  />

                  <Input
                    label="Prêmio Mínimo (R$/mês)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricingFields.min_premium}
                    onChange={(e) => handlePricingChange('min_premium', e.target.value)}
                    placeholder="0.00"
                  />

                  <Input
                    label="Aporte Mínimo Mensal (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricingFields.min_monthly_contribution}
                    onChange={(e) => handlePricingChange('min_monthly_contribution', e.target.value)}
                    placeholder="0.00"
                  />

                  <Input
                    label="Taxa de Juros (%)"
                    type="text"
                    value={pricingFields.interest_rate}
                    onChange={(e) => handlePricingChange('interest_rate', e.target.value)}
                    placeholder="Ex: 1.5% ou CDI + 0.8%"
                  />

                  <Input
                    label="Rentabilidade"
                    type="text"
                    value={pricingFields.yield}
                    onChange={(e) => handlePricingChange('yield', e.target.value)}
                    placeholder="Ex: CDI + 0.8%"
                    className="md:col-span-2"
                  />
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
                  <span className="text-sm text-gray-700">Produto Ativo</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Produtos inativos não aparecerão nas listagens para colaboradores
                </p>
              </div>
            </Card>

            <div className="flex flex-col space-y-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Produto'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/people/products/catalog')}
                className="w-full"
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

export default ProductForm

