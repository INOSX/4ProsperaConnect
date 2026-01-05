import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// 🎨 Tipos de notificação
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  // 💾 Carregar notificações do localStorage ao iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(parsed)
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
      }
    }
  }, [])

  // 💾 Salvar notificações no localStorage quando mudar
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    } else {
      localStorage.removeItem('notifications')
    }
  }, [notifications])

  // ➕ Adicionar nova notificação
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: NOTIFICATION_TYPES.INFO,
      ...notification
    }

    setNotifications(prev => [newNotification, ...prev])
    return newNotification.id
  }, [])

  // ✅ Marcar notificação como lida
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    )
  }, [])

  // ✅ Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }, [])

  // 🗑️ Remover notificação
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    )
  }, [])

  // 🗑️ Limpar todas as notificações
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // 🗑️ Limpar notificações lidas
  const clearRead = useCallback(() => {
    setNotifications(prev =>
      prev.filter(notif => !notif.read)
    )
  }, [])

  // 📊 Contadores
  const unreadCount = notifications.filter(n => !n.read).length
  const totalCount = notifications.length

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    unreadCount,
    totalCount
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
