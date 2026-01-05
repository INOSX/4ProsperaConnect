import { useCallback } from 'react'
import { useNotifications, NOTIFICATION_TYPES } from '../contexts/NotificationContext'

// 🎭 Mock de notificações para teste
const MOCK_NOTIFICATIONS = [
  {
    type: NOTIFICATION_TYPES.SUCCESS,
    title: 'Colaborador aprovado',
    message: 'João Silva foi aprovado e adicionado à equipe.'
  },
  {
    type: NOTIFICATION_TYPES.INFO,
    title: 'Nova campanha criada',
    message: 'Campanha "Black Friday 2025" foi criada com sucesso.'
  },
  {
    type: NOTIFICATION_TYPES.WARNING,
    title: '5 benefícios pendentes',
    message: 'Existem benefícios aguardando aprovação.'
  },
  {
    type: NOTIFICATION_TYPES.ERROR,
    title: 'Erro ao processar pagamento',
    message: 'Falha ao processar pagamento do colaborador Maria Santos.'
  },
  {
    type: NOTIFICATION_TYPES.SUCCESS,
    title: 'Relatório gerado',
    message: 'Seu relatório mensal está pronto para visualização.'
  },
  {
    type: NOTIFICATION_TYPES.INFO,
    title: 'Backup concluído',
    message: 'Backup automático realizado às 03:00 com sucesso.'
  },
  {
    type: NOTIFICATION_TYPES.WARNING,
    title: 'Meta de campanha atingida',
    message: 'Campanha "Verão 2025" atingiu 80% da meta.'
  },
  {
    type: NOTIFICATION_TYPES.SUCCESS,
    title: '3 novos produtos cadastrados',
    message: 'Produtos financeiros foram adicionados ao catálogo.'
  },
  {
    type: NOTIFICATION_TYPES.INFO,
    title: 'Atualização disponível',
    message: 'Nova versão do sistema disponível. Clique para atualizar.'
  },
  {
    type: NOTIFICATION_TYPES.ERROR,
    title: 'Sessão expirada',
    message: 'Sua sessão expirou. Faça login novamente.'
  }
]

export const useNotificationMock = () => {
  const { addNotification } = useNotifications()

  // 🎲 Adicionar notificação aleatória
  const addRandomNotification = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * MOCK_NOTIFICATIONS.length)
    const mockNotif = MOCK_NOTIFICATIONS[randomIndex]
    addNotification(mockNotif)
  }, [addNotification])

  // 🎯 Adicionar notificação específica por tipo
  const addNotificationByType = useCallback((type) => {
    const filtered = MOCK_NOTIFICATIONS.filter(n => n.type === type)
    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length)
      addNotification(filtered[randomIndex])
    }
  }, [addNotification])

  // 🎪 Adicionar múltiplas notificações
  const addMultipleNotifications = useCallback((count = 5) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        addRandomNotification()
      }, i * 500) // 500ms entre cada notificação
    }
  }, [addRandomNotification])

  return {
    addRandomNotification,
    addNotificationByType,
    addMultipleNotifications
  }
}
