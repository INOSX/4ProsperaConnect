import React from 'react'

const ScoringBadge = ({ score, size = 'md' }) => {
  const getColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1'
      case 'lg': return 'text-lg px-4 py-2'
      default: return 'text-sm px-3 py-1'
    }
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${getColor(score)} ${getSizeClasses(size)}`}>
      {score || 0}
    </span>
  )
}

export default ScoringBadge

