import React from 'react'
import Card from '../ui/Card'
import { Package, DollarSign, TrendingUp } from 'lucide-react'

const ProductCard = ({ product, onSelect }) => {
  const getProductIcon = (type) => {
    switch (type) {
      case 'account': return DollarSign
      case 'credit': return TrendingUp
      default: return Package
    }
  }

  const Icon = getProductIcon(product.product_type)

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect && onSelect(product)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Icon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{product.product_type}</p>
          </div>
        </div>
      </div>

      {product.description && (
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
      )}

      {product.features && product.features.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1">Características:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onSelect && (
        <button className="w-full mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium">
          Ver detalhes
        </button>
      )}
    </Card>
  )
}

export default ProductCard

