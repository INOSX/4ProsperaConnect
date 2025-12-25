import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

const TourContext = createContext()

export const useTour = () => {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}

const STORAGE_KEY = 'tour_preferences'
const DISABLED_KEY = 'tour_disabled'

export const TourProvider = ({ children }) => {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [steps, setSteps] = useState([])
  const [tourDisabled, setTourDisabled] = useState(false)
  const location = useLocation()

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedDisabled = localStorage.getItem(DISABLED_KEY)
    if (savedDisabled === 'true') {
      setTourDisabled(true)
    }
  }, [])

  // Salvar preferência de desabilitar tour
  const disableTour = useCallback((permanent = false) => {
    if (permanent) {
      localStorage.setItem(DISABLED_KEY, 'true')
      setTourDisabled(true)
    }
    setRun(false)
    setStepIndex(0)
  }, [])

  // Habilitar tour novamente
  const enableTour = useCallback(() => {
    localStorage.removeItem(DISABLED_KEY)
    setTourDisabled(false)
  }, [])

  // Iniciar tour
  const startTour = useCallback((tourSteps = []) => {
    if (tourDisabled) return
    
    if (tourSteps.length > 0) {
      setSteps(tourSteps)
      setStepIndex(0)
      setRun(true)
    }
  }, [tourDisabled])

  // Parar tour
  const stopTour = useCallback(() => {
    setRun(false)
    setStepIndex(0)
  }, [])

  // Pausar tour
  const pauseTour = useCallback(() => {
    setRun(false)
  }, [])

  // Continuar tour
  const resumeTour = useCallback(() => {
    if (steps.length > 0) {
      setRun(true)
    }
  }, [steps])

  // Próximo passo
  const nextStep = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      stopTour()
    }
  }, [stepIndex, steps.length, stopTour])

  // Passo anterior
  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    }
  }, [stepIndex])

  // Resetar tour
  const resetTour = useCallback(() => {
    setStepIndex(0)
    setRun(false)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Callback quando tour termina
  const handleTourEnd = useCallback((data) => {
    if (data.action === 'skip' || data.status === 'finished') {
      stopTour()
    }
  }, [stopTour])

  // Callback quando passo muda
  const handleStepChange = useCallback((data) => {
    if (data && typeof data.index === 'number' && data.index >= 0) {
      setStepIndex(data.index)
    }
  }, [])

  // Resetar tour quando rota muda
  useEffect(() => {
    if (run) {
      stopTour()
    }
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    run,
    stepIndex,
    steps,
    tourDisabled,
    startTour,
    stopTour,
    pauseTour,
    resumeTour,
    nextStep,
    prevStep,
    resetTour,
    disableTour,
    enableTour,
    handleTourEnd,
    handleStepChange,
    setSteps,
    setStepIndex,
    setRun
  }

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  )
}

