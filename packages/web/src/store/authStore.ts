import { create } from 'zustand'
import { api } from '../api/client'
import { applyTheme, type Theme } from '../utils/theme'

interface User {
  id: string
  email: string
  nickname: string | null
  theme: string
  emailVerified: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; nickname?: string }) => Promise<string>
  logout: () => void
  fetchUser: () => Promise<void>
  refreshTokens: () => Promise<boolean>
  updateNickname: (nickname: string) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  updateTheme: (theme: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: async (email, password) => {
    const data = await api.post<{
      accessToken: string
      refreshToken: string
      user: User
    }>('/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    const user = { ...data.user, emailVerified: true, createdAt: '' } as User
    applyTheme((user.theme as Theme) || 'light')
    set({ user, isAuthenticated: true })
  },

  register: async (data) => {
    const res = await api.post<{ message: string }>('/auth/register', data)
    return res.message
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    applyTheme('light')
    set({ user: null, isAuthenticated: false })
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true })
      const user = await api.get<User>('/users/me')
      applyTheme((user.theme as Theme) || 'light')
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      const refreshed = await get().refreshTokens()
      if (refreshed) {
        try {
          const user = await api.get<User>('/users/me')
          applyTheme((user.theme as Theme) || 'light')
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          get().logout()
          set({ isLoading: false })
        }
      } else {
        get().logout()
        set({ isLoading: false })
      }
    }
  },

  refreshTokens: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return false
    try {
      const data = await api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        refreshToken,
      })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return true
    } catch {
      return false
    }
  },

  updateNickname: async (nickname) => {
    const data = await api.patch<{ id: string; email: string; nickname: string; theme: string }>(
      '/users/me/nickname',
      { nickname },
    )
    set((state) => ({
      user: state.user ? { ...state.user, nickname: data.nickname } : null,
    }))
  },

  updatePassword: async (currentPassword, newPassword) => {
    await api.patch('/users/me/password', { currentPassword, newPassword })
  },

  updateTheme: async (theme) => {
    applyTheme(theme as Theme)
    await api.patch('/users/me/theme', { theme })
    set((state) => ({ user: state.user ? { ...state.user, theme } : null }))
  },
}))
