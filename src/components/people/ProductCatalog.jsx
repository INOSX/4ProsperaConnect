import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductService } from '../../services/productService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Package, Plus, Search, Filter, Edit, CheckCircle, XCircle } from 'lucide-react'

const ProductCatalog = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [productTypeFilter, setProductTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'active', 'inactive'

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const result = await ProductService.getProducts({})
      if (result.success) {
        setProducts(result.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProductTypeLabel = (type) => {
    const labels = {
      account: 'Conta',
      credit: 'Crédito',
      investment: 'Investimento',
      insurance: 'Seguro',
      benefit: 'Benefício',
      service: 'Serviço'
    }
    return labels[type] || type
  }

  const getProductTypeColor = (type) => {
    const colors = {
      account: 'bg-blue-100 text-blue-800',
      credit: 'bg-green-100 text-green-800',
      investment: 'bg-purple-100 text-purple-800',
      insurance: 'bg-red-100 text-red-800',
      benefit: 'bg-yellow-100 text-yellow-800',
      service: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (value) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    if (productTypeFilter && product.product_type !== productTypeFilter) return false
    if (activeFilter === 'active' && !product.is_active) return false
    if (activeFilter === 'inactive' && product.is_active) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return product.name.toLowerCase().includes(term) ||
             product.description?.toLowerCase().includes(term) ||
             product.product_code?.toLowerCase().includes(term)
    }
    return true
  })

  const productTypes = [...new Set(products.map(p => p.product_type))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando produtos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos Bancários</h1>
          <p className="text-gray-600">Visualize e gerencie todos os produtos disponíveis</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/people/products/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produtos Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.is_active).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produtos Inativos</p>
              <p className="text-2xl font-bold text-gray-600">
                {products.filter(p => !p.is_active).length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tipos de Produtos</p>
              <p className="text-2xl font-bold text-primary-600">{productTypes.length}</p>
            </div>
            <Filter className="h-8 w-8 text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, código, descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filtro por tipo */}
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os tipos</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{getProductTypeLabel(type)}</option>
              ))}
            </select>

            {/* Filtro por status */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Apenas ativos</option>
              <option value="inactive">Apenas inativos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || productTypeFilter || activeFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro produto bancário'}
            </p>
            {!searchTerm && !productTypeFilter && activeFilter === 'all' && (
              <Button
                variant="primary"
                onClick={() => navigate('/people/products/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Produto
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      {product.is_active ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getProductTypeColor(product.product_type)}`}>
                        {getProductTypeLabel(product.product_type)}
                      </span>
                      {product.product_code && (
                        <span className="text-xs text-gray-500">#{product.product_code}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{product.description || 'Sem descrição'}</p>
                  </div>
                </div>

                {/* Informações de preço */}
                {product.pricing && Object.keys(product.pricing).length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Informações de Preço</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {product.pricing.min_premium && (
                        <p>Prêmio mínimo: {formatCurrency(product.pricing.min_premium)}/mês</p>
                      )}
                      {product.pricing.min_amount && (
                        <p>Valor mínimo: {formatCurrency(product.pricing.min_amount)}</p>
                      )}
                      {product.pricing.min_monthly_contribution && (
                        <p>Aporte mínimo: {formatCurrency(product.pricing.min_monthly_contribution)}/mês</p>
                      )}
                      {product.pricing.interest_rate && (
                        <p>Taxa de juros: {product.pricing.interest_rate}%</p>
                      )}
                      {product.pricing.yield && (
                        <p>Rentabilidade: {product.pricing.yield}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Características:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {product.features.length > 3 && (
                        <li className="text-gray-500">+{product.features.length - 3} mais</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Target Audience */}
                {product.target_audience && product.target_audience.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-1">Público-alvo:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.target_audience.map((audience, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                        >
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    product.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/people/products/${product.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductCatalog

