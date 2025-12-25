import React from 'react'
import { HelpCircle, X } from 'lucide-react'
import { useTour } from '../../contexts/TourContext'
import { getTourConfigForRoute } from '../../config/tourConfigs'
import { useLocation } from 'react-router-dom'

const TourButton = () => {
  const location = useLocation()
  const {
    run,
    startTour,
    stopTour,
    steps,
    tourDisabled
  } = useTour()

  const handleClick = () => {
    if (run) {
      stopTour()
    } else {
      const configKey = getTourConfigForRoute(location.pathname)
      if (configKey && steps.length > 0) {
        startTour(steps)
      } else {
        // Se não houver tour configurado para esta página, mostrar mensagem
        alert('Tour guiado não disponível para esta página.')
      }
    }
  }

  if (tourDisabled) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-lg transition-colors relative ${
        run 
          ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' 
          : 'hover:bg-gray-100 text-gray-600'
      }`}
      title={run ? 'Parar tour guiado' : 'Iniciar tour guiado'}
    >
      {run ? (
        <X className="h-5 w-5" />
      ) : (
        <HelpCircle className="h-5 w-5" />
      )}
      {run && (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse"></span>
      )}
    </button>
  )
}

export default TourButton

