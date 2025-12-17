import React from 'react'
import { TrendingUp, Activity, DollarSign } from 'lucide-react'

const MarketSignalIndicator = ({ signals }) => {
  if (!signals || Object.keys(signals).length === 0) {
    return null
  }

  const signalCount = Object.keys(signals).filter(key => signals[key] === true).length
  const hasStrongSignals = signalCount >= 3

  return (
    <div className="flex items-center space-x-2">
      {hasStrongSignals && <TrendingUp className="h-4 w-4 text-green-600" />}
      {signalCount > 0 && (
        <span className="text-xs text-gray-600">
          {signalCount} sinal{signalCount !== 1 ? 'is' : ''} de mercado
        </span>
      )}
    </div>
  )
}

export default MarketSignalIndicator

