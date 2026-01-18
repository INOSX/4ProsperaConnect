import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const ModuleContext = createContext()

export const useModule = () => {
  const context = useContext(ModuleContext)
  if (!context) {
    throw new Error('useModule must be used within a ModuleProvider')
  }
  return context
}

const MODULES = {
  PEOPLE: {
    id: 'people',
    name: 'Gestão de Pessoas',
    description: 'Gerencie colaboradores e benefícios para pequenas empresas',
    routes: ['/employees', '/companies'],
    defaultRoute: '/companies',
    allowedRoles: ['super_admin', 'bank_manager', 'company_manager']
  },
  PROSPECTING: {
    id: 'prospecting',
    name: 'Prospecção de Clientes',
    description: 'Identifique e qualifique potenciais clientes',
    routes: ['/prospecting'],
    defaultRoute: '/prospecting',
    allowedRoles: ['super_admin', 'bank_manager']
  },
  MARKETING: {
    id: 'marketing',
    name: 'Campanhas de Marketing',
    description: 'Crie e gerencie campanhas de marketing digital',
    routes: ['/campaigns'],
    defaultRoute: '/campaigns'
  },
  SPECIALIST: {
    id: 'specialist',
    name: 'Especialista',
    description: 'Consultoria inteligente por voz com IA avançada',
    routes: ['/specialist'],
    defaultRoute: '/specialist'
  },
  SUPERADMIN: {
    id: 'superadmin',
    name: 'Super Admin',
    description: 'Acesso total à plataforma e banco de dados',
    routes: ['/superadmin'],
    defaultRoute: '/superadmin',
    requiresSuperAdmin: true
  }
}

export const ModuleProvider = ({ children }) => {
  const [activeModule, setActiveModule] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Detectar módulo baseado na rota atual
  useEffect(() => {
    const detectModuleFromRoute = () => {
      const path = location.pathname
      
      // Verificar se está em alguma rota de módulo
      for (const [key, module] of Object.entries(MODULES)) {
        if (module.routes.some(route => path.startsWith(route))) {
          if (activeModule !== module.id) {
            setActiveModule(module.id)
            localStorage.setItem('activeModule', module.id)
          }
          return
        }
      }
    }

    detectModuleFromRoute()
  }, [location.pathname, activeModule])

  // Carregar módulo salvo do localStorage ao inicializar
  useEffect(() => {
    const savedModule = localStorage.getItem('activeModule')
    if (savedModule && Object.values(MODULES).some(m => m.id === savedModule)) {
      setActiveModule(savedModule)
    }
  }, [])

  const selectModule = (moduleId) => {
    const module = Object.values(MODULES).find(m => m.id === moduleId)
    if (module) {
      setActiveModule(moduleId)
      localStorage.setItem('activeModule', moduleId)
      navigate(module.defaultRoute)
    }
  }

  const getModuleByRoute = (route) => {
    for (const [key, module] of Object.entries(MODULES)) {
      if (module.routes.some(r => route.startsWith(r))) {
        return module
      }
    }
    return null
  }

  const getCurrentModule = () => {
    if (!activeModule) return null
    return Object.values(MODULES).find(m => m.id === activeModule)
  }

  const value = {
    activeModule,
    selectModule,
    getModuleByRoute,
    getCurrentModule,
    modules: MODULES,
    navigateToModule: (moduleId) => {
      selectModule(moduleId)
    }
  }

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  )
}

export default ModuleContext

