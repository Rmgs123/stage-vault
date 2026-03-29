import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'

// --- Hoisted mocks ---

const mockAccessCode = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
}))

const mockEvent = vi.hoisted(() => ({
  findUnique: vi.fn(),
}))

const mockEventMember = vi.hoisted(() => ({
  findUnique: vi.fn(),
}))

vi.mock('../../lib/prisma.js', () => ({
  default: {
    accessCode: mockAccessCode,
    event: mockEvent,
    eventMember: mockEventMember,
  },
}))

// --- Fixtures ---

const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)

const makeCode = (overrides: Record<string, unknown> = {}) => ({
  id: 'code-1',
  eventId: 'event-1',
  code: 'ABC123',
  expiresAt: futureDate,
  revoked: false,
  createdAt: new Date(),
  event: { id: 'event-1', title: 'Test Event' },
  ...overrides,
})

// --- App lifecycle ---

let app: FastifyInstance

beforeEach(async () => {
  vi.clearAllMocks()
  app = Fastify()
  const accessRoutes = (await import('./access.routes.js')).default
  await app.register(accessRoutes)
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

// ================================
// POST /api/access/verify (public)
// ================================
describe('POST /api/access/verify', () => {
  it('200 — возвращает токен при валидном коде', async () => {
    mockAccessCode.findUnique.mockResolvedValue(makeCode())

    const res = await app.inject({
      method: 'POST',
      url: '/api/access/verify',
      payload: { code: 'ABC123' },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.token).toBeDefined()
    expect(body.data.eventId).toBe('event-1')
    expect(body.data.eventTitle).toBe('Test Event')
    expect(body.message).toBe('Код подтверждён')
  })

  it('404 — несуществующий код', async () => {
    mockAccessCode.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'POST',
      url: '/api/access/verify',
      payload: { code: 'XXXXXX' },
    })

    expect(res.statusCode).toBe(404)
    expect(res.json().message).toContain('Неверный')
  })

  it('410 — отозванный код', async () => {
    mockAccessCode.findUnique.mockResolvedValue(makeCode({ revoked: true }))

    const res = await app.inject({
      method: 'POST',
      url: '/api/access/verify',
      payload: { code: 'ABC123' },
    })

    expect(res.statusCode).toBe(410)
    expect(res.json().message).toContain('отозван')
  })

  it('410 — истёкший код', async () => {
    mockAccessCode.findUnique.mockResolvedValue(makeCode({ expiresAt: pastDate }))

    const res = await app.inject({
      method: 'POST',
      url: '/api/access/verify',
      payload: { code: 'ABC123' },
    })

    expect(res.statusCode).toBe(410)
    expect(res.json().message).toContain('истёк')
  })

  it('400 — код неверной длины', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/access/verify',
      payload: { code: 'AB' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().message).toContain('6 символов')
  })

  it('400 — код с недопустимыми символами', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/access/verify',
      payload: { code: 'AB@#$%' },
    })

    expect(res.statusCode).toBe(400)
  })

  it('400 — пустое тело запроса', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/access/verify',
      payload: {},
    })

    expect(res.statusCode).toBe(400)
  })

  it('приводит код к верхнему регистру', async () => {
    mockAccessCode.findUnique.mockResolvedValue(makeCode())

    await app.inject({
      method: 'POST',
      url: '/api/access/verify',
      payload: { code: 'abc123' },
    })

    expect(mockAccessCode.findUnique).toHaveBeenCalledWith({
      where: { code: 'ABC123' },
      include: { event: { select: { id: true, title: true } } },
    })
  })
})

// =====================================================
// Protected endpoints (require authGuard + roleGuard)
// =====================================================
describe('Protected access-code endpoints', () => {
  it('401 — генерация кода без авторизации', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/events/event-1/access-codes',
      payload: { ttlHours: 24 },
    })

    expect(res.statusCode).toBe(401)
  })

  it('401 — получение кода без авторизации', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/events/event-1/access-codes',
    })

    expect(res.statusCode).toBe(401)
  })

  it('401 — отзыв кода без авторизации', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/events/event-1/access-codes/code-1',
    })

    expect(res.statusCode).toBe(401)
  })
})
