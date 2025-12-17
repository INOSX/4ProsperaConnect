import React from 'react'
import Card from '../ui/Card'
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react'

const RecommendationCard = ({ recommendation, onAccept, onReject }) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{recommendation.title}</h3>
          {recommendation.description && (
            <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
          )}
          {recommendation.reasoning && (
            <p className="text-xs text-gray-500 italic mb-2">{recommendation.reasoning}</p>
          )}
        </div>
        {recommendation.status === 'accepted' && (
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        )}
        {recommendation.status === 'rejected' && (
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-primary-600" />
          <span className="text-xs text-gray-500">Prioridade: {recommendation.priority || 0}/10</span>
        </div>

        {recommendation.status === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onAccept && onAccept(recommendation.id)}
              className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded hover:bg-green-50"
            >
              Aceitar
            </button>
            <button
              onClick={() => onReject && onReject(recommendation.id)}
              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50"
            >
              Rejeitar
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default RecommendationCard

