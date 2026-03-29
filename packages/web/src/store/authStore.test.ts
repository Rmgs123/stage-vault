import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

// --- Mock API client ---

const mockPost = vi.fn()
const mockGet = vi.fn()
const mockPatch = vi.fn()

vi.mock('../api/client', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}))

// --- Mock localStorage ---

const storage: Record<string, string> = {}

vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => { storage[key] = val },
  removeItem: (key: string) => { delete storage[key] },
})

beforeEach(() => {
  vi.clearAllMocks()
  Object.keys(storage).forEach((k) => delete storage[k])
  // Сбрасываем стор
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
})

describe('authStore', () => {
  describe('login', () => {
    it('сохраняет токены и пользователя', async () => {
      mockPost.mockResolvedValue({
        accessToken: 'at-123',
        refreshToken: 'rt-456',
        user: { id: 'u1', email: 'a@b.com', nickname: 'test', theme: 'light' },
      })

      await useAuthStore.getState().login('a@b.com', 'password')

      expect(storage.accessToken).toBe('at-123')
      expect(storage.refreshToken).toBe('rt-456')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user?.email).toBe('a@b.com')
    })

    it('вызывает POST /auth/login', async () => {
      mockPost.mockResolvedValue({
        accessToken: 'at', refreshToken: 'rt',
        user: { id: 'u1', email: 'a@b.com', nickname: null, theme: 'light' },
      })

      await useAuthStore.getState().login('a@b.com', 'pass')

      expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' })
    })
  })

  describe('register', () => {
    it('возвращает сообщение об успехе', async () => {
      mockPost.mockResolvedValue({ message: 'OK' })

      const msg = await useAuthStore.getState().register({ email: 'a@b.com', password: 'pass123' })

      expect(msg).toBe('OK')
      expect(mockPost).toHaveBeenCalledWith('/auth/register', { email: 'a@b.com', password: 'pass123' })
    })
  })

  describe('logout', () => {
    it('очищает состояние и токены', () => {
      storage.accessToken = 'token'
      storage.refreshToken = 'refresh'
      useAuthStore.setState({ user: { id: 'u1', email: 'a@b.com', nickname: null, theme: 'light', emailVerified: true, createdAt: '' }, isAuthenticated: true })

      useAuthStore.getState().logout()

      expect(storage.accessToken).toBeUndefined()
      expect(storage.refreshToken).toBeUndefined()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('refreshTokens', () => {
    it('обновляет токены при наличии refresh token', async () => {
      storage.refreshToken = 'old-rt'
      mockPost.mockResolvedValue({ accessToken: 'new-at', refreshToken: 'new-rt' })

      const result = await useAuthStore.getState().refreshTokens()

      expect(result).toBe(true)
      expect(storage.accessToken).toBe('new-at')
      expect(storage.refreshToken).toBe('new-rt')
    })

    it('возвращает false без refresh token', async () => {
      const result = await useAuthStore.getState().refreshTokens()

      expect(result).toBe(false)
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('возвращает false при ошибке', async () => {
      storage.refreshToken = 'old-rt'
      mockPost.mockRejectedValue(new Error('fail'))

      const result = await useAuthStore.getState().refreshTokens()

      expect(result).toBe(false)
    })
  })

  describe('updateTheme', () => {
    it('обновляет тему пользователя', async () => {
      useAuthStore.setState({
        user: { id: 'u1', email: 'a@b.com', nickname: null, theme: 'light', emailVerified: true, createdAt: '' },
        isAuthenticated: true,
      })
      mockPatch.mockResolvedValue({})

      await useAuthStore.getState().updateTheme('dark')

      expect(mockPatch).toHaveBeenCalledWith('/users/me/theme', { theme: 'dark' })
      expect(useAuthStore.getState().user?.theme).toBe('dark')
    })
  })
})
