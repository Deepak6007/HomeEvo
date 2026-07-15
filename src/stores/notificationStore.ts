import { create } from "zustand"

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'> & { id?: string; createdAt?: string }) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        id: notification.id || Math.random().toString(36).substring(2, 9),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: false,
        createdAt: notification.createdAt || new Date().toISOString(),
      }
      const notifications = [newNotification, ...state.notifications]
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    }),
  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    }),
  markAllRead: () =>
    set((state) => {
      const notifications = state.notifications.map((n) => ({ ...n, read: true }))
      return {
        notifications,
        unreadCount: 0,
      }
    }),
  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}))
