import React, { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 🖱️ Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 🎨 Obter ícone e cor por tipo
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          Icon: CheckCircle2,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800'
        }
      case 'warning':
        return {
          Icon: AlertTriangle,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800'
        }
      case 'error':
        return {
          Icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800'
        }
      case 'info':
      default:
        return {
          Icon: Info,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800'
        }
    }
  }

  // ⏰ Formatar timestamp
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
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell Button com Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        title="Notificações"
      >
        <div className="relative">
          <Bell className={`h-5 w-5 transition-all duration-300 ${isOpen ? 'rotate-12 scale-110' : 'group-hover:-rotate-12'}`} />
          
          {/* 📍 Badge de contador */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline">Notificações</span>
      </button>

      {/* 📋 Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
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
                  setIsOpen(false)
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
  )
}

export default NotificationCenter
