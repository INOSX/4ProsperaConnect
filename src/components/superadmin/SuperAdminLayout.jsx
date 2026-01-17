import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Terminal, 
  Activity,
  FileText,
  Settings,
  Shield
} from 'lucide-react'

const SuperAdminLayout = () => {
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
        <div className="w-64 bg-gray-900 min-h-screen border-r border-red-800">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Super Admin
            </h2>
            <p className="text-gray-400 text-sm mt-1">Painel de Controle</p>
          </div>

          <nav className="mt-6 px-3 space-y-1">
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
