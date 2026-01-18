import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Terminal, 
  Activity,
  FileText,
  Settings,
  Shield,
  Bell,
  Sun,
  Moon,
  Grid3x3,
  HelpCircle
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import NotificationCenter from '../notifications/NotificationCenter'

const SuperAdminLayout = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const navigation = [
    { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard, end: true },
    { name: 'Usuários', path: '/superadmin/users', icon: Users },
    { name: 'Empresas', path: '/superadmin/companies', icon: Building2 },
    { name: 'Console SQL', path: '/superadmin/sql', icon: Terminal },
    { name: 'Monitor', path: '/superadmin/monitor', icon: Activity },
    { name: 'Audit Log', path: '/superadmin/audit', icon: FileText },
    { name: 'Configurações', path: '/superadmin/settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-3 border-b-4 border-red-800">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <span className="font-bold text-lg">SUPER ADMIN MODE</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 min-h-screen border-r border-red-800 flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Super Admin
            </h2>
            <p className="text-gray-400 text-sm mt-1">Painel de Controle</p>
          </div>

          <nav className="mt-6 px-3 space-y-1 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-gray-800 space-y-2">
            {/* 🔔 Notification Center */}
            <NotificationCenter />

            {/* 🌙 Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 font-medium group"
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
              <div className="relative w-11 h-6 bg-gray-700 rounded-full transition-colors duration-300">
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-gray-900 rounded-full shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}>
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

            {/* 🔄 Trocar Módulo */}
            <button
              onClick={() => navigate('/modules')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:text-red-400 hover:bg-red-900/20 transition-colors font-medium"
            >
              <Grid3x3 className="h-5 w-5" />
              <span>Trocar Módulo</span>
            </button>

            {/* ❓ Ajuda */}
            <button
              onClick={() => navigate('/help')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Ajuda</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminLayout
