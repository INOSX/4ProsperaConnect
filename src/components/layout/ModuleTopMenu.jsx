import React from 'react'
import { useModule } from '../../contexts/ModuleContext'
import { Users, Target, Mail } from 'lucide-react'

const ModuleTopMenu = () => {
  const { activeModule, selectModule, modules } = useModule()

  const moduleItems = [
    {
      id: modules.PEOPLE.id,
      name: modules.PEOPLE.name,
      icon: Users,
      route: modules.PEOPLE.defaultRoute,
      color: 'text-blue-600',
      activeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      hoverColor: 'hover:bg-blue-50 hover:text-blue-700'
    },
    {
      id: modules.PROSPECTING.id,
      name: modules.PROSPECTING.name,
      icon: Target,
      route: modules.PROSPECTING.defaultRoute,
      color: 'text-green-600',
      activeColor: 'bg-green-50 text-green-700 border-green-200',
      hoverColor: 'hover:bg-green-50 hover:text-green-700'
    },
    {
      id: modules.MARKETING.id,
      name: modules.MARKETING.name,
      icon: Mail,
      route: modules.MARKETING.defaultRoute,
      color: 'text-purple-600',
      activeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverColor: 'hover:bg-purple-50 hover:text-purple-700'
    }
  ]

  const handleModuleClick = (moduleId, route) => {
    selectModule(moduleId)
  }

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center justify-center space-x-1 py-3">
          {moduleItems.map((item) => {
            const Icon = item.icon
            const isActive = activeModule === item.id
            
            return (
              <button
                key={item.id}
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
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default ModuleTopMenu

