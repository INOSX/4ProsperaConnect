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
    setSteps
  } = useTour()

  // Carregar steps quando a rota mudar
  useEffect(() => {
    const loadStepsForRoute = () => {
      const configKey = getTourConfigForRoute(location.pathname)
      
      if (configKey && tourStepsMap[configKey]) {
        const routeSteps = tourStepsMap[configKey]
        // Aguardar um pouco para garantir que o DOM foi renderizado antes de verificar elementos
        setTimeout(() => {
          // Verificar se os elementos existem antes de adicionar ao tour
          const validSteps = routeSteps.filter(step => {
            const element = document.querySelector(step.target)
            return element !== null
          })
          
          setSteps(validSteps.length > 0 ? validSteps : routeSteps)
        }, 300)
      } else {
        setSteps([])
      }
    }

    loadStepsForRoute()
  }, [location.pathname, setSteps])

  // Verificar se elementos existem antes de iniciar o tour
  useEffect(() => {
    if (run && steps.length > 0) {
      const currentStep = steps[stepIndex]
      if (currentStep) {
        const element = document.querySelector(currentStep.target)
        if (!element) {
          // Se o elemento não existe, pular para o próximo
          if (stepIndex < steps.length - 1) {
            handleStepChange({ index: stepIndex + 1 })
          } else {
            stopTour()
          }
        }
      }
    }
  }, [run, steps, stepIndex, stopTour, handleStepChange])

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data

    if (status === 'finished' || status === 'skipped') {
      handleTourEnd(data)
    } else if (type === 'step:after' || type === 'error:target_not_found') {
      handleStepChange(data)
    }
  }

  return (
    <>
      {children}
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
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
        disableOverlayClose
        disableScrolling={false}
        scrollToFirstStep
        spotlightClicks
      />
    </>
  )
}

export default TourProvider

