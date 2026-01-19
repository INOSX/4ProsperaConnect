import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModule } from '../../contexts/ModuleContext'
import { useSuperAdmin } from '../../hooks/useSuperAdmin'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Target, Mail, ChevronDown, UserPlus, Package, Briefcase, Building2, Settings, Plus, UserCircle, Shield, Database, BarChart3, Terminal, Activity } from 'lucide-react'

const ModuleTopMenu = () => {
  const { activeModule, selectModule, modules } = useModule()
  const { isSuperAdmin } = useSuperAdmin()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hoveredModule, setHoveredModule] = useState(null)

  // Obter role do usuário
  const userRole = user?.user_metadata?.role || user?.role || null

  console.log('🔍 [ModuleTopMenu] User role:', userRole)

  // Submenu para Gestão de Pessoas
  const peopleSubmenu = [
    {
      label: 'Gerenciar Colaboradores',
      route: '/people/employees',
      icon: UserPlus,
      description: 'Adicionar e gerenciar sua equipe'
    },
    {
      label: 'Gerenciar Benefícios',
      route: '/people/benefits',
      icon: Package,
      description: 'Configurar benefícios para colaboradores'
    },
    {
      label: 'Produtos Financeiros',
      route: '/people/products',
      icon: Briefcase,
      description: 'Ver produtos dos colaboradores'
    },
    {
      label: 'Portal do Colaborador',
      route: '/employees',
      icon: UserCircle,
      description: 'Visualizar dashboard dos colaboradores'
    }
  ]

  // Submenu para Prospecção de Clientes
  const prospectingSubmenu = [
    {
      label: 'Prospecção CNPJ',
      route: '/prospecting?tab=cnpj',
      icon: Target,
      description: 'Dashboard de prospecção de empresas CNPJ'
    },
    {
      label: 'CPF → CNPJ',
      route: '/prospecting?tab=cpf',
      icon: UserPlus,
      description: 'Identificar empresas a partir de CPFs'
    },
    {
      label: 'CNPJ → Cliente',
      route: '/prospecting?tab=unbanked',
      icon: Building2,
      description: 'Empresas não bancarizadas ou subexploradas'
    }
  ]

  // Submenu para Campanhas de Marketing
  const marketingSubmenu = [
    {
      label: 'Gerenciamento de Campanhas',
      route: '/campaigns',
      icon: Settings,
      description: 'Visualize e gerencie todas as campanhas'
    },
    {
      label: 'Criar Campanha',
      route: '/campaigns/create',
      icon: Plus,
      description: 'Criar uma nova campanha de marketing'
    }
  ]

  // Submenu para Super Admin
  const superAdminSubmenu = [
    {
      label: 'Dashboard',
      route: '/superadmin',
      icon: BarChart3,
      description: 'Visão geral do sistema'
    },
    {
      label: 'Gerenciar Usuários',
      route: '/superadmin/users',
      icon: Users,
      description: 'Criar e gerenciar usuários'
    },
    {
      label: 'Gerenciar Empresas',
      route: '/superadmin/companies',
      icon: Building2,
      description: 'Visualizar e gerenciar empresas'
    },
    {
      label: 'SQL Console',
      route: '/superadmin/sql',
      icon: Terminal,
      description: 'Executar queries SQL'
    },
    {
      label: 'Monitor do Sistema',
      route: '/superadmin/monitor',
      icon: Activity,
      description: 'Monitorar performance do sistema'
    },
    {
      label: 'Logs de Auditoria',
      route: '/superadmin/audit',
      icon: Database,
      description: 'Ver logs de ações dos usuários'
    },
    {
      label: 'Configurações',
      route: '/superadmin/settings',
      icon: Settings,
      description: 'Configurar sistema'
    }
  ]

  const moduleItems = [
    {
      id: modules.PEOPLE.id,
      name: modules.PEOPLE.name,
      icon: Users,
      route: modules.PEOPLE.defaultRoute,
      color: 'text-blue-600',
      activeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      hoverColor: 'hover:bg-blue-50 hover:text-blue-700',
      hasSubmenu: true,
      submenu: peopleSubmenu,
      allowedRoles: modules.PEOPLE.allowedRoles
    },
    {
      id: modules.PROSPECTING.id,
      name: modules.PROSPECTING.name,
      icon: Target,
      route: modules.PROSPECTING.defaultRoute,
      color: 'text-green-600',
      activeColor: 'bg-green-50 text-green-700 border-green-200',
      hoverColor: 'hover:bg-green-50 hover:text-green-700',
      hasSubmenu: true,
      submenu: prospectingSubmenu,
      allowedRoles: modules.PROSPECTING.allowedRoles
    },
    {
      id: modules.MARKETING.id,
      name: modules.MARKETING.name,
      icon: Mail,
      route: modules.MARKETING.defaultRoute,
      color: 'text-purple-600',
      activeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverColor: 'hover:bg-purple-50 hover:text-purple-700',
      hasSubmenu: true,
      submenu: marketingSubmenu,
      allowedRoles: modules.MARKETING.allowedRoles
    },
    {
      id: modules.SPECIALIST.id,
      name: modules.SPECIALIST.name,
      icon: Package,
      route: modules.SPECIALIST.defaultRoute,
      color: 'text-orange-600',
      activeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      hoverColor: 'hover:bg-orange-50 hover:text-orange-700',
      hasSubmenu: false,
      allowedRoles: modules.SPECIALIST.allowedRoles
    }
  ]

  // Função para verificar se usuário tem acesso ao módulo
  const hasAccessToModule = (module) => {
    // Se não há roles definidas, o módulo é público
    if (!module.allowedRoles || module.allowedRoles.length === 0) {
      return true
    }
    
    // Se não há role do usuário, não tem acesso
    if (!userRole) {
      return false
    }
    
    // Verificar se a role do usuário está na lista de roles permitidas
    return module.allowedRoles.includes(userRole)
  }

  // Filtrar módulos baseado nas permissões do usuário
  const visibleModules = moduleItems.filter(hasAccessToModule)

  console.log('📋 [ModuleTopMenu] Visible modules:', visibleModules.map(m => m.name))
  console.log('🔐 [ModuleTopMenu] Access check:')
  moduleItems.forEach(m => {
    console.log(`   - ${m.name}: ${hasAccessToModule(m)} | Required roles:`, m.allowedRoles || 'public')
  })

  // Adicionar Super Admin se o usuário tiver permissão
  if (isSuperAdmin) {
    visibleModules.push({
      id: 'super-admin',
      name: 'Super Admin',
      icon: Shield,
      route: '/superadmin',
      color: 'text-red-600',
      activeColor: 'bg-red-50 text-red-700 border-red-200',
      hoverColor: 'hover:bg-red-50 hover:text-red-700',
      hasSubmenu: true,
      submenu: superAdminSubmenu
    })
  }

  const handleModuleClick = (moduleId, route) => {
    selectModule(moduleId)
    navigate(route)
  }

  const handleSubmenuClick = (route) => {
    navigate(route)
    setHoveredModule(null)
  }

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center justify-center space-x-1 py-3 relative">
          {visibleModules.map((item) => {
            const Icon = item.icon
            const isActive = activeModule === item.id
            const isHovered = hoveredModule === item.id
            
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => item.hasSubmenu && setHoveredModule(item.id)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                <button
                  onClick={() => handleModuleClick(item.id, item.route)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 border
                    ${isActive 
                      ? `${item.activeColor} border-2 shadow-sm` 
                      : `text-gray-600 border-transparent ${item.hoverColor}`
                    }
                  `}
                  title={item.name}
                >
                  <Icon className={`h-4 w-4 ${isActive ? '' : item.color}`} />
                  <span className="hidden sm:inline">{item.name}</span>
                  {item.hasSubmenu && (
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Submenu Dropdown */}
                {item.hasSubmenu && isHovered && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {item.submenu.map((subItem, index) => {
                      const SubIcon = subItem.icon
                      // Determinar cores baseadas no módulo
                      const isPeople = item.id === modules.PEOPLE.id
                      const isProspecting = item.id === modules.PROSPECTING.id
                      const isMarketing = item.id === modules.MARKETING.id
                      const isSuperAdminModule = item.id === 'super-admin'
                      
                      const iconColor = isPeople ? 'text-blue-600' 
                        : isProspecting ? 'text-green-600' 
                        : isMarketing ? 'text-purple-600'
                        : isSuperAdminModule ? 'text-red-600'
                        : 'text-gray-600'
                        
                      const hoverBg = isPeople ? 'hover:bg-blue-50' 
                        : isProspecting ? 'hover:bg-green-50' 
                        : isMarketing ? 'hover:bg-purple-50'
                        : isSuperAdminModule ? 'hover:bg-red-50'
                        : 'hover:bg-gray-50'
                        
                      const hoverText = isPeople ? 'group-hover:text-blue-700' 
                        : isProspecting ? 'group-hover:text-green-700' 
                        : isMarketing ? 'group-hover:text-purple-700'
                        : isSuperAdminModule ? 'group-hover:text-red-700'
                        : 'group-hover:text-gray-700'
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleSubmenuClick(subItem.route)}
                          className={`w-full px-4 py-3 text-left transition-colors duration-150 group ${hoverBg}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">
                              <SubIcon className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium text-gray-900 ${hoverText}`}>
                                {subItem.label}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {subItem.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default ModuleTopMenu

