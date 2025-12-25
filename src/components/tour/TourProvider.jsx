import React, { useEffect, useState } from 'react'
import Joyride from 'react-joyride'
import { useLocation } from 'react-router-dom'
import { useTour } from '../../contexts/TourContext'
import { getTourConfigForRoute } from '../../config/tourConfigs'
import { TOUR_STYLES, TOUR_TEXTS } from '../../config/tourConfigs'

// Importar configurações de tour
import dashboardSteps from '../../config/tourSteps/dashboard.json'
import prospectingSteps from '../../config/tourSteps/prospecting.json'
import prospectingListSteps from '../../config/tourSteps/prospecting-list.json'
import prospectingEnrichSteps from '../../config/tourSteps/prospecting-enrich.json'
import companiesSteps from '../../config/tourSteps/companies.json'
import companyDetailSteps from '../../config/tourSteps/company-detail.json'
import campaignsSteps from '../../config/tourSteps/campaigns.json'
import campaignsCreateSteps from '../../config/tourSteps/campaigns-create.json'
import peopleEmployeesSteps from '../../config/tourSteps/people-employees.json'
import peopleBenefitsSteps from '../../config/tourSteps/people-benefits.json'
import peopleProductsSteps from '../../config/tourSteps/people-products.json'
import productCatalogSteps from '../../config/tourSteps/product-catalog.json'
import integrationsSteps from '../../config/tourSteps/integrations.json'
import settingsSteps from '../../config/tourSteps/settings.json'
import modulesSteps from '../../config/tourSteps/modules.json'
import employeesSteps from '../../config/tourSteps/employees.json'

const tourStepsMap = {
  'dashboard': dashboardSteps,
  'prospecting': prospectingSteps,
  'prospecting-list': prospectingListSteps,
  'prospecting-enrich': prospectingEnrichSteps,
  'companies': companiesSteps,
  'company-detail': companyDetailSteps,
  'campaigns': campaignsSteps,
  'campaigns-create': campaignsCreateSteps,
  'people-employees': peopleEmployeesSteps,
  'people-benefits': peopleBenefitsSteps,
  'people-products': peopleProductsSteps,
  'product-catalog': productCatalogSteps,
  'integrations': integrationsSteps,
  'settings': settingsSteps,
  'modules': modulesSteps,
  'employees': employeesSteps
}

const TourProvider = ({ children }) => {
  const location = useLocation()
  const {
    run,
    stepIndex,
    steps,
    startTour,
    stopTour,
    handleTourEnd,
    handleStepChange,
    setSteps,
    setStepIndex
  } = useTour()

  // Carregar steps quando a rota mudar
  useEffect(() => {
    const loadStepsForRoute = () => {
      const configKey = getTourConfigForRoute(location.pathname)
      
      if (configKey && tourStepsMap[configKey]) {
        const routeSteps = tourStepsMap[configKey]
        // Primeiro, definir os steps imediatamente (sem verificação de elementos)
        setSteps(routeSteps)
        
        // Depois, aguardar um pouco e verificar se os elementos existem
        setTimeout(() => {
          const validSteps = routeSteps.filter(step => {
            const element = document.querySelector(step.target)
            return element !== null
          })
          
          // Atualizar apenas se houver diferença
          if (validSteps.length !== routeSteps.length) {
            setSteps(validSteps.length > 0 ? validSteps : routeSteps)
          }
        }, 500)
      } else {
        setSteps([])
      }
    }

    loadStepsForRoute()
  }, [location.pathname, setSteps])

  // Verificar se elementos existem - apenas para logging/debug, não interferir na navegação
  useEffect(() => {
    if (run && steps.length > 0 && stepIndex < steps.length) {
      const currentStep = steps[stepIndex]
      if (currentStep) {
        const element = document.querySelector(currentStep.target)
        if (!element) {
          // Log apenas, não interferir - o react-joyride já trata isso
          console.warn(`Tour step target not found: ${currentStep.target}`)
        }
      }
    }
  }, [run, steps, stepIndex])

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data

    // Quando o tour termina ou é pulado
    if (status === 'finished' || status === 'skipped') {
      handleTourEnd(data)
      return
    }

    // Quando há erro de elemento não encontrado
    if (type === 'error:target_not_found') {
      // Pular para o próximo step se disponível
      if (typeof index === 'number' && index < steps.length - 1) {
        handleStepChange({ index: index + 1 })
      } else {
        handleTourEnd(data)
      }
      return
    }

    // CRÍTICO: Atualizar stepIndex para TODOS os eventos que tenham um index válido
    // O react-joyride com continuous=true gerencia o stepIndex internamente,
    // mas precisamos sincronizar nosso estado através do callback
    if (typeof index === 'number' && index >= 0 && index < steps.length) {
      // Usar setStepIndex diretamente para garantir atualização imediata
      setStepIndex(index)
    }

    // Tratamento adicional para eventos específicos de navegação
    if (type === 'step:after' || action === 'next' || action === 'prev') {
      if (typeof index === 'number' && index >= 0 && index < steps.length) {
        setStepIndex(index)
      }
    }
  }

  return (
    <>
      {children}
      {steps.length > 0 && (
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        disableScrolling={false}
        scrollOffset={20}
        disableOverlayClose={true}
        spotlightClicks={false}
        floaterProps={{
          disableAnimation: false
        }}
        styles={{
          options: {
            primaryColor: TOUR_STYLES.options.primaryColor,
            textColor: TOUR_STYLES.options.textColor,
            overlayColor: TOUR_STYLES.options.overlayColor,
            spotlightShadow: TOUR_STYLES.options.spotlightShadow,
            zIndex: TOUR_STYLES.options.zIndex,
            arrowColor: TOUR_STYLES.options.arrowColor
          },
          tooltip: {
            borderRadius: TOUR_STYLES.tooltip.borderRadius,
            fontSize: TOUR_STYLES.tooltip.fontSize,
            padding: TOUR_STYLES.tooltip.padding
          },
          tooltipContainer: {
            textAlign: 'left'
          },
          buttonNext: {
            backgroundColor: TOUR_STYLES.options.primaryColor,
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: '500'
          },
          buttonBack: {
            color: TOUR_STYLES.options.textColor,
            fontSize: '14px',
            padding: '8px 16px',
            marginRight: '8px'
          },
          buttonSkip: {
            color: '#6b7280',
            fontSize: '14px'
          },
          spotlight: {
            borderRadius: TOUR_STYLES.spotlight.borderRadius
          }
        }}
        locale={{
          back: TOUR_TEXTS.back,
          close: TOUR_TEXTS.close,
          last: TOUR_TEXTS.last,
          next: TOUR_TEXTS.next,
          open: TOUR_TEXTS.open,
          skip: TOUR_TEXTS.skip
        }}
        scrollToFirstStep={true}
      />
      )}
    </>
  )
}

export default TourProvider

