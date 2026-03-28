import { create } from 'zustand'
import { api } from '../api/client'

export interface NotificationMeta {
  eventId?: string
  eventTitle?: string
  fromUserId?: string
  fromUserName?: string
  newRole?: string
}

export interface Notification {
  id: string
  userId: string
  type: 'invite' | 'role_change' | 'removed'
  title: string
  body: string | null
  meta: NotificationMeta | null
  read: boolean
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean

  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  acceptInvite: (id: string) => Promise<{ eventId: string; eventTitle: string }>
  declineInvite: (id: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const notifications = await api.get<Notification[]>('/notifications')
      const unreadCount = notifications.filter((n) => !n.read).length
      set({ notifications, unreadCount, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { count } = await api.get<{ count: number }>('/notifications/unread-count')
      set({ unreadCount: count })
    } catch {
      // ignore
    }
  },

  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}`)
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  acceptInvite: async (id) => {
    const result = await api.post<{ message: string; data: { eventId: string; eventTitle: string } }>(
      `/notifications/${id}/accept`,
    )
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
    return result.data
  },

  declineInvite: async (id) => {
    await api.post(`/notifications/${id}/decline`)
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },
}))
