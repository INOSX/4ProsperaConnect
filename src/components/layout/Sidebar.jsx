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
  Grid3x3
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getCurrentModule } = useModule()
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
          <nav className="flex-1 px-4 py-6 space-y-2">
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
