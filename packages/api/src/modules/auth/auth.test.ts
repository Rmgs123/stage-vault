import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// --- Hoisted mocks (vi.mock factory не может обращаться к переменным модуля) ---

const mockPrismaUser = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}))

vi.mock('../../lib/prisma.js', () => ({
  default: { user: mockPrismaUser },
}))

vi.mock('../../lib/email.js', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}))

// --- Fixtures ---

let hashedPassword: string

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: hashedPassword,
  nickname: 'testuser',
  emailVerified: true,
  theme: 'light',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// --- App lifecycle ---

let app: FastifyInstance

beforeAll(async () => {
  hashedPassword = await bcrypt.hash('password123', 10)
})

beforeEach(async () => {
  vi.clearAllMocks()
  app = Fastify()
  const authRoutes = (await import('./auth.routes.js')).default
  await app.register(authRoutes)
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

// ===================
// REGISTER
// ===================
describe('POST /api/auth/register', () => {
  it('201 — успешная регистрация', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockPrismaUser.create.mockResolvedValue(makeUser({ id: 'new-1' }))

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'new@example.com', password: 'password123' },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json().message).toContain('Регистрация')
    expect(mockPrismaUser.create).toHaveBeenCalledOnce()
  })

  it('400 — короткий пароль', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'new@example.com', password: '123' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().message).toContain('8 символов')
  })

  it('400 — невалидный email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'not-email', password: 'password123' },
    })

    expect(res.statusCode).toBe(400)
  })

  it('409 — дублирующийся email', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(makeUser())

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'test@example.com', password: 'password123' },
    })

    expect(res.statusCode).toBe(409)
    expect(res.json().message).toContain('уже существует')
  })

  it('409 — занятый никнейм', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockPrismaUser.findFirst.mockResolvedValue(makeUser())

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'new@example.com', password: 'password123', nickname: 'testuser' },
    })

    expect(res.statusCode).toBe(409)
    expect(res.json().message).toContain('никнейм')
  })
})

// ===================
// LOGIN
// ===================
describe('POST /api/auth/login', () => {
  it('200 — возвращает токены и пользователя', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(makeUser())

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'test@example.com', password: 'password123' },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.accessToken).toBeDefined()
    expect(body.refreshToken).toBeDefined()
    expect(body.user.email).toBe('test@example.com')
  })

  it('401 — неверный пароль', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(makeUser())

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'test@example.com', password: 'wrongpassword' },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().message).toContain('Неверный')
  })

  it('401 — несуществующий пользователь', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'no@example.com', password: 'password123' },
    })

    expect(res.statusCode).toBe(401)
  })

  it('403 — неподтверждённый email', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(makeUser({ emailVerified: false }))

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'test@example.com', password: 'password123' },
    })

    expect(res.statusCode).toBe(403)
    expect(res.json().message).toContain('Подтвердите')
  })

  it('400 — пустые поля', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {},
    })

    expect(res.statusCode).toBe(400)
  })
})

// ===================
// VERIFY EMAIL
// ===================
describe('POST /api/auth/verify-email', () => {
  it('200 — подтверждает email', async () => {
    const token = jwt.sign(
      { userId: 'user-1', purpose: 'email-verify' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '1h' },
    )
    mockPrismaUser.update.mockResolvedValue(makeUser({ emailVerified: true }))

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-email',
      payload: { token },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().message).toContain('подтверждён')
  })

  it('400 — отсутствующий токен', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-email',
      payload: {},
    })

    expect(res.statusCode).toBe(400)
  })

  it('400 — токен с неверной целью', async () => {
    const token = jwt.sign(
      { userId: 'user-1', purpose: 'password-reset' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '1h' },
    )

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-email',
      payload: { token },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().message).toContain('Недействительный')
  })
})

// ===================
// REFRESH
// ===================
describe('POST /api/auth/refresh', () => {
  it('200 — обновляет токены', async () => {
    const refreshToken = jwt.sign(
      { userId: 'user-1' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' },
    )
    mockPrismaUser.findUnique.mockResolvedValue(makeUser())

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      payload: { refreshToken },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.accessToken).toBeDefined()
    expect(body.refreshToken).toBeDefined()
  })

  it('400 — отсутствующий refresh token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      payload: {},
    })

    expect(res.statusCode).toBe(400)
  })

  it('401 — невалидный refresh token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      payload: { refreshToken: 'invalid' },
    })

    expect(res.statusCode).toBe(401)
  })
})

// ===================
// FORGOT PASSWORD
// ===================
describe('POST /api/auth/forgot-password', () => {
  it('200 — всегда успех (защита от enumeration)', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/forgot-password',
      payload: { email: 'noone@example.com' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().message).toContain('ссылка')
  })

  it('400 — пустой email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/forgot-password',
      payload: {},
    })

    expect(res.statusCode).toBe(400)
  })
})

// ===================
// RESET PASSWORD
// ===================
describe('POST /api/auth/reset-password', () => {
  it('200 — обновляет пароль', async () => {
    const token = jwt.sign(
      { userId: 'user-1', purpose: 'password-reset' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '1h' },
    )
    mockPrismaUser.update.mockResolvedValue(makeUser())

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/reset-password',
      payload: { token, password: 'newpassword123' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().message).toContain('обновлён')
  })

  it('400 — короткий пароль', async () => {
    const token = jwt.sign(
      { userId: 'user-1', purpose: 'password-reset' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '1h' },
    )

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/reset-password',
      payload: { token, password: '12' },
    })

    expect(res.statusCode).toBe(400)
  })

  it('400 — невалидный токен', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/reset-password',
      payload: { token: 'bad', password: 'newpassword123' },
    })

    expect(res.statusCode).toBe(400)
  })
})
