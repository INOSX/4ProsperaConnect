import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useModule } from '../../contexts/ModuleContext'
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
  Mail
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getCurrentModule, activeModule } = useModule()
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
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => navigate('/modules')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer w-full text-left"
            >
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">4Prospera</h2>
                <p className="text-xs text-gray-500">Dashboard</p>
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
                        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                        : 'text-gray-700 hover:bg-gray-100'
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
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-1 animate-fade-in">
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                        transition-all duration-200 ${item.hoverColor} border border-transparent
                        hover:border-gray-200 hover:shadow-sm
                      `}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-md ${item.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-gray-700">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
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
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                navigate('/modules')
                onClose()
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50 transition-colors font-medium"
            >
              <Grid3x3 className="h-5 w-5" />
              <span>Trocar Módulo</span>
            </button>
            {isBankAdmin && (
              <a
                href="/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </a>
            )}
            <a
              href="/help"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
