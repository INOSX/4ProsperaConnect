// Configurações principais do tour
// Mapeia rotas para seus respectivos arquivos de configuração

export const TOUR_ROUTES = {
  '/': 'modules',
  '/modules': 'modules',
  '/dashboard': 'dashboard',
  '/prospecting': 'prospecting',
  '/prospecting/list': 'prospecting-list',
  '/prospecting/enrich': 'prospecting-enrich',
  '/companies': 'companies',
  '/companies/:id': 'company-detail',
  '/employees': 'employees',
  '/people/employees': 'people-employees',
  '/people/benefits': 'people-benefits',
  '/people/products': 'people-products',
  '/people/products/catalog': 'product-catalog',
  '/campaigns': 'campaigns',
  '/campaigns/create': 'campaigns-create',
  '/integrations': 'integrations',
  '/settings': 'settings',
  '/profile': 'profile',
  '/datasets': 'datasets',
  '/upload': 'upload',
  '/specialist': 'specialist'
}

// Função para obter a configuração do tour baseada na rota
export const getTourConfigForRoute = (pathname, searchParams = '') => {
  // Verificar query parameters para rotas especiais
  if (pathname === '/prospecting' && searchParams.includes('tab=cpf')) {
    return 'prospecting-cpf'
  }

  // Tentar match exato primeiro
  if (TOUR_ROUTES[pathname]) {
    return TOUR_ROUTES[pathname]
  }

  // Tentar match com parâmetros dinâmicos
  for (const [route, config] of Object.entries(TOUR_ROUTES)) {
    if (route.includes(':')) {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}$`)
      if (regex.test(pathname)) {
        return config
      }
    }
  }

  // Retornar configuração padrão se não encontrar
  return null
}

// Configurações padrão de estilo
export const TOUR_STYLES = {
  options: {
    primaryColor: '#3b82f6', // blue-500
    textColor: '#1f2937', // gray-800
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    spotlightShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
    zIndex: 10000,
    arrowColor: '#3b82f6'
  },
  tooltip: {
    borderRadius: 8,
    fontSize: 14,
    padding: 20
  },
  spotlight: {
    borderRadius: 8
  }
}

// Textos padrão
export const TOUR_TEXTS = {
  back: 'Voltar',
  close: 'Fechar',
  last: 'Finalizar',
  next: 'Próximo',
  open: 'Abrir tour',
  skip: 'Pular tour'
}

