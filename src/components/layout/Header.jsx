import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  BarChart3,
  BookOpen,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import Button from '../ui/Button'
import TourButton from '../tour/TourButton'
import Documentation from '../documentation/Documentation'

const Header = ({ onMenuToggle, isSidebarOpen, hideSidebarToggle = false }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead
  } = useNotifications()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const notificationRef = useRef(null)

  // 🖱️ Fechar notification dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
    navigate('/login')
  }

  const getUserInitials = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U'
  }

  // 🎨 Obter ícone e cor por tipo de notificação
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          Icon: CheckCircle2,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20'
        }
      case 'warning':
        return {
          Icon: AlertTriangle,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-900/20'
        }
      case 'error':
        return {
          Icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-900/20'
        }
      case 'info':
      default:
        return {
          Icon: Info,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20'
        }
    }
  }

  // ⏰ Formatar timestamp relativo
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}m atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 h-16 flex items-center justify-between flex-shrink-0 transition-colors duration-300">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {/* Menu hambúrguer - Oculta se não houver sidebar */}
        {!hideSidebarToggle && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}

        <button
          onClick={() => navigate('/modules')}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">4Prospera</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard Inteligente</p>
          </div>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* 🔔 Notifications Center */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
            title="Notificações"
          >
            <Bell className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-all duration-300 ${showNotifications ? 'rotate-12 scale-110' : 'group-hover:-rotate-12'}`} />
            
            {/* 📍 Badge contador */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-lg">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* 📋 Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
              {/* 📌 Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Notificações
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* 🎯 Actions */}
                <div className="flex items-center space-x-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Marcar todas como lidas"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  
                  {notifications.length > 0 && (
                    <button
                      onClick={clearRead}
                      className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Limpar lidas"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 📜 Lista de Notificações */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  // 🎉 Estado vazio
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Nenhuma notificação
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Você está em dia! 🎉
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const style = getNotificationStyle(notification.type)
                    const Icon = style.Icon

                    return (
                      <div
                        key={notification.id}
                        className={`
                          relative px-4 py-3 border-b border-gray-100 dark:border-gray-700 
                          transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50
                          ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                        `}
                      >
                        <div className="flex items-start space-x-3">
                          {/* 🎨 Ícone */}
                          <div className={`mt-0.5 p-2 rounded-lg ${style.bg}`}>
                            <Icon className={`h-4 w-4 ${style.color}`} />
                          </div>

                          {/* 📝 Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>

                          {/* 🎯 Actions */}
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                title="Marcar como lida"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Remover"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* 📍 Indicador de não lida */}
                        {!notification.read && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* 🗑️ Footer com Limpar Tudo */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={() => {
                      clearAll()
                      setShowNotifications(false)
                    }}
                    className="w-full text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    Limpar todas as notificações
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documentation button */}
        <button
          onClick={() => setShowDocumentation(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Documentação"
        >
          <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Tour button */}
        <TourButton />

        {/* Settings button */}
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Configurações"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                {getUserInitials(user?.email)}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.user_metadata?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button 
                onClick={() => { setShowUserMenu(false); navigate('/profile') }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </button>
              <button 
                onClick={() => { setShowUserMenu(false); navigate('/settings') }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Documentation Modal */}
      {showDocumentation && (
        <Documentation onClose={() => setShowDocumentation(false)} />
      )}
    </header>
  )
}

export default Header
