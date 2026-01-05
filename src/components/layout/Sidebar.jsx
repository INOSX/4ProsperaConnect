import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useModule } from '../../contexts/ModuleContext'
import { useTheme } from '../../contexts/ThemeContext'
import { ClientService } from '../../services/clientService'
import { isCompanyAdminAny } from '../../services/employeeService'
import { canAccessProspecting, canAccessCampaigns } from '../../utils/permissions'
import { supabase } from '../../services/supabase'
import { 
  BarChart3, 
  Upload, 
  FileText, 
  Settings, 
  HelpCircle,
  TrendingUp,
  Building2,
  Database,
  Grid3x3,
  UserPlus,
  Package,
  Briefcase,
  UserCircle,
  Target,
  Mail,
  Sun,
  Moon
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getCurrentModule, activeModule } = useModule()
  const { theme, toggleTheme, isDark } = useTheme()
  const [vectorFiles, setVectorFiles] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [error, setError] = useState(null)
  const [selectKey, setSelectKey] = useState(0)
  const [refreshTick, setRefreshTick] = useState(0)
  const [isBankAdmin, setIsBankAdmin] = useState(false)
  const [isCompanyAdminUser, setIsCompanyAdminUser] = useState(false)
  const [canAccessProspectingModule, setCanAccessProspectingModule] = useState(false)
  const [canAccessCampaignsModule, setCanAccessCampaignsModule] = useState(false)

  useEffect(() => {
    if (user) {
      checkPermissions()
    }
  }, [user])

  const checkPermissions = async () => {
    if (!user) return
    try {
      const clientResult = await ClientService.getClientByUserId(user.id)
      let userRole = 'user'
      if (clientResult.success && clientResult.client) {
        userRole = clientResult.client.role || 'user'
        setIsBankAdmin(userRole === 'admin')
      }

      // Verificar se é Admin do Cliente
      const userIsCompanyAdmin = await isCompanyAdminAny(user.id)
      setIsCompanyAdminUser(userIsCompanyAdmin)

      // Verificar permissões de módulos
      setCanAccessProspectingModule(canAccessProspecting(userRole))
      setCanAccessCampaignsModule(canAccessCampaigns(userRole))
    } catch (error) {
      console.warn('Error checking permissions:', error)
    }
  }

  useEffect(() => {
    let mounted = true
    async function loadFiles() {
      if (!user) return
      setLoadingFiles(true)
      setError(null)
      try {
        const cr = await ClientService.getClientByUserId(user.id)
        if (!cr.success) throw new Error('Cliente não encontrado')
        const bucket = String(cr.client.id)
        // Listar DIRETAMENTE os arquivos do Supabase Storage do cliente (bucket por usuário)
        const { data: storageEntries, error: stErr } = await supabase.storage.from(bucket).list('')
        if (stErr) throw stErr
        let items = (storageEntries || [])
          .filter(e => !!e.name && (e.name.endsWith('.csv') || e.name.endsWith('.xlsx') || e.name.endsWith('.xls')))
          .map(e => ({ id: e.name, name: e.name }))

        if (!mounted) return
        setVectorFiles(items)
        setSelectKey(prev => prev + 1)
      } catch (e) {
        if (!mounted) return
        setError(e.message)
        setVectorFiles([])
        setSelectKey(prev => prev + 1)
      } finally {
        if (mounted) setLoadingFiles(false)
      }
    }
    loadFiles()
    return () => { mounted = false }
  }, [user, refreshTick])

  // Recarregar quando o upload concluir
  useEffect(() => {
    const onUpdated = () => setRefreshTick(t => t + 1)
    window.addEventListener('storage-updated', onUpdated)
    return () => window.removeEventListener('storage-updated', onUpdated)
  }, [])
  // 🎯 Submenus dos módulos
  const moduleSubmenus = {
    people: [
      {
        icon: UserPlus,
        label: 'Gerenciar Colaboradores',
        href: '/people/employees',
        description: 'Adicionar e gerenciar sua equipe',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        hoverColor: 'hover:bg-blue-100'
      },
      {
        icon: Package,
        label: 'Gerenciar Benefícios',
        href: '/people/benefits',
        description: 'Configurar benefícios para colaboradores',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        hoverColor: 'hover:bg-blue-100'
      },
      {
        icon: Briefcase,
        label: 'Produtos Financeiros',
        href: '/people/products',
        description: 'Ver produtos dos colaboradores',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        hoverColor: 'hover:bg-blue-100'
      },
      {
        icon: UserCircle,
        label: 'Portal do Colaborador',
        href: '/employees',
        description: 'Visualizar dashboard dos colaboradores',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        hoverColor: 'hover:bg-blue-100'
      }
    ],
    prospecting: [
      {
        icon: Target,
        label: 'Prospecção CNPJ',
        href: '/prospecting?tab=cnpj',
        description: 'Dashboard de prospecção de empresas CNPJ',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        hoverColor: 'hover:bg-green-100'
      },
      {
        icon: UserPlus,
        label: 'CPF → CNPJ',
        href: '/prospecting?tab=cpf',
        description: 'Identificar empresas a partir de CPFs',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        hoverColor: 'hover:bg-green-100'
      },
      {
        icon: Building2,
        label: 'CNPJ → Cliente',
        href: '/prospecting?tab=unbanked',
        description: 'Empresas não bancarizadas ou subexploradas',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        hoverColor: 'hover:bg-green-100'
      }
    ],
    marketing: [
      {
        icon: Settings,
        label: 'Gerenciar Campanhas',
        href: '/campaigns',
        description: 'Visualize e gerencie todas as campanhas',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        hoverColor: 'hover:bg-purple-100'
      },
      {
        icon: Mail,
        label: 'Criar Campanha',
        href: '/campaigns/create',
        description: 'Criar uma nova campanha de marketing',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        hoverColor: 'hover:bg-purple-100'
      }
    ]
  }

  // Menu items base - sempre visíveis
  const baseMenuItems = [
    {
      icon: BarChart3,
      label: 'Dashboard',
      href: '/dashboard',
      active: true
    },
    {
      icon: Upload,
      label: 'Upload de Dados',
      href: '/upload'
    },
    {
      icon: FileText,
      label: 'Meus Datasets',
      href: '/datasets'
    },
    {
      icon: Building2,
      label: 'Minha Empresa',
      href: '/companies'
    },
    {
      icon: TrendingUp,
      label: 'Análises',
      href: '/analyses'
    }
  ]

  // Menu items adicionais baseados em permissões
  const additionalMenuItems = []
  
  if (canAccessProspectingModule) {
    additionalMenuItems.push({
      icon: TrendingUp,
      label: 'Prospecção de Clientes',
      href: '/prospecting'
    })
  }

  if (canAccessCampaignsModule) {
    additionalMenuItems.push({
      icon: Database,
      label: 'Campanhas de Marketing',
      href: '/campaigns'
    })
  }

  const menuItems = [...baseMenuItems, ...additionalMenuItems]
  
  // 🎨 Obter submenu do módulo ativo
  const activeModuleSubmenu = activeModule && moduleSubmenus[activeModule] ? moduleSubmenus[activeModule] : []

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigate('/modules')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer w-full text-left"
            >
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">4Prospera</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const tourId = item.href === '/upload' ? 'sidebar-upload' : item.href === '/datasets' ? 'sidebar-datasets' : null
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    data-tour-id={tourId}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${item.active 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                )
              })}
            </div>

            {/* 🎯 SUBMENU DO MÓDULO ATIVO */}
            {activeModuleSubmenu.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-1 animate-fade-in">
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {activeModule === 'people' && '👥 Gestão de Pessoas'}
                    {activeModule === 'prospecting' && '🎯 Prospecção'}
                    {activeModule === 'marketing' && '📧 Marketing'}
                  </h3>
                </div>
                {activeModuleSubmenu.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(item.href)
                        onClose()
                      }}
                      className={`
                        group flex items-start space-x-3 px-3 py-3 rounded-lg text-sm 
                        transition-all duration-200 ${item.hoverColor} dark:hover:bg-gray-800 border border-transparent
                        hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm
                      `}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-md ${item.bgColor} dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}

            {/* Lista de Arquivos do Supabase removida a pedido */}

            {/* Tipos de Gráficos removidos a pedido */}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* 🌙 Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium group"
              title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              <div className="flex items-center space-x-3">
                {isDark ? (
                  <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
                )}
                <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
              </div>
              
              {/* Animated Toggle Switch */}
              <div className="relative w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-300">
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isDark ? (
                      <Moon className="h-3 w-3 text-indigo-400" />
                    ) : (
                      <Sun className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                navigate('/modules')
                onClose()
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
            >
              <Grid3x3 className="h-5 w-5" />
              <span>Trocar Módulo</span>
            </button>
            {isBankAdmin && (
              <a
                href="/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </a>
            )}
            <a
              href="/help"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Ajuda</span>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
