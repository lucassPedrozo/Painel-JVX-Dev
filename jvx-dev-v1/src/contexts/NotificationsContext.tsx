import * as React from 'react'
import { type Work } from '@/lib/api'

export interface Notification {
  id: string
  type: 'overdue' | 'urgent' | 'payment' | 'new' | 'success'
  title: string
  message: string
  timestamp: number
  read: boolean
  workId?: number
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAll: () => void
}

const NotificationsContext = React.createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children, works }: { children: React.ReactNode, works: Work[] }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])

  // Gerar notificações baseadas nos trabalhos
  React.useEffect(() => {
    const newNotifications: Notification[] = []
    const now = new Date()

    works.forEach(work => {
      const cadastroDate = new Date(work.date)
      const deadline = new Date(cadastroDate)
      deadline.setDate(deadline.getDate() + 30)
      
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const isPaid = work.paymentStatus === 'Pago'

      // Notificação de projeto atrasado
      if (!isPaid && daysUntilDeadline < 0) {
        newNotifications.push({
          id: `overdue-${work.id}`,
          type: 'overdue',
          title: 'Projeto Atrasado',
          message: `${work.typeWork} está ${Math.abs(daysUntilDeadline)} dias atrasado`,
          timestamp: Date.now(),
          read: false,
          workId: work.id
        })
      }
      
      // Notificação de projeto urgente (≤3 dias)
      else if (!isPaid && daysUntilDeadline > 0 && daysUntilDeadline <= 3) {
        newNotifications.push({
          id: `urgent-${work.id}`,
          type: 'urgent',
          title: 'Prazo Próximo',
          message: `${work.typeWork} vence em ${daysUntilDeadline} dia(s)`,
          timestamp: Date.now(),
          read: false,
          workId: work.id
        })
      }

      // Notificação de pagamento pendente (>30 dias)
      if (!isPaid && daysUntilDeadline < -30) {
        newNotifications.push({
          id: `payment-${work.id}`,
          type: 'payment',
          title: 'Pagamento Pendente',
          message: `${work.typeWork} aguarda pagamento há ${Math.abs(daysUntilDeadline)} dias`,
          timestamp: Date.now(),
          read: false,
          workId: work.id
        })
      }
    })

    // Mesclar com notificações existentes, preservando status de leitura
    setNotifications(prev => {
      const existingMap = new Map(prev.map(n => [n.id, n]))
      return newNotifications.map(n => ({
        ...n,
        read: existingMap.get(n.id)?.read || false
      }))
    })
  }, [works])

  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  const markAsRead = React.useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllAsRead = React.useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = React.useCallback(() => {
    setNotifications([])
  }, [])

  const value = React.useMemo(
    () => ({ notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll }),
    [notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = React.useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
