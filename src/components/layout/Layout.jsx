import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import ModuleTopMenu from './ModuleTopMenu'
import FloatingSpecialist from './FloatingSpecialist'

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  // Verificar se está dentro de um iframe
  const isInIframe = window.self !== window.top

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  // Não mostrar ModuleTopMenu na página de seleção de módulos
  const showModuleMenu = location.pathname !== '/modules'

  // Se estiver dentro de um iframe, renderizar apenas o conteúdo sem Layout
  if (isInIframe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          onMenuToggle={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
        />
        
        {/* Module Top Menu */}
        {showModuleMenu && <ModuleTopMenu />}
        
        {/* Page content */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      
      {/* Floating Specialist Widget */}
      <FloatingSpecialist />
    </div>
  )
}

export default Layout
