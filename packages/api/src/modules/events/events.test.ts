import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'

// --- Hoisted mocks ---

const mockEvent = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

const mockEventMember = vi.hoisted(() => ({
  findUnique: vi.fn(),
}))

vi.mock('../../lib/prisma.js', () => ({
  default: {
    event: mockEvent,
    eventMember: mockEventMember,
  },
}))

// --- Helpers ---

function makeToken(userId = 'user-1'): string {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '1h' })
}

const sampleEvent = {
  id: 'evt-1',
  title: 'Тестовое мероприятие',
  description: 'Описание',
  date: null,
  coverUrl: null,
  status: 'draft',
  ownerId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

// --- App lifecycle ---

let app: FastifyInstance

beforeEach(async () => {
  vi.clearAllMocks()
  app = Fastify()
  const eventsRoutes = (await import('./events.routes.js')).default
  await app.register(eventsRoutes)
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

// ============================
// GET /api/events
// ============================
describe('GET /api/events', () => {
  it('200 — возвращает список мероприятий', async () => {
    mockEvent.findMany.mockResolvedValue([
      {
        ...sampleEvent,
        owner: { id: 'user-1', nickname: 'admin', email: 'a@b.com' },
        _count: { members: 1, files: 3 },
      },
    ])

    const res = await app.inject({
      method: 'GET',
      url: '/api/events',
      headers: { authorization: `Bearer ${makeToken()}` },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body).toHaveLength(1)
    expect(body[0].title).toBe('Тестовое мероприятие')
    expect(body[0].role).toBe('owner')
  })

  it('401 — без авторизации', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/events',
    })

    expect(res.statusCode).toBe(401)
  })
})

// ============================
// POST /api/events
// ============================
describe('POST /api/events', () => {
  it('201 — создаёт мероприятие', async () => {
    mockEvent.create.mockResolvedValue(sampleEvent)

    const res = await app.inject({
      method: 'POST',
      url: '/api/events',
      headers: { authorization: `Bearer ${makeToken()}` },
      payload: { title: 'Тестовое мероприятие' },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json().title).toBe('Тестовое мероприятие')
  })

  it('400 — пустое название', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/events',
      headers: { authorization: `Bearer ${makeToken()}` },
      payload: { title: '' },
    })

    expect(res.statusCode).toBe(400)
  })

  it('401 — без авторизации', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/events',
      payload: { title: 'Test' },
    })

    expect(res.statusCode).toBe(401)
  })
})

// ============================
// GET /api/events/:id
// ============================
describe('GET /api/events/:id', () => {
  it('200 — возвращает мероприятие владельцу', async () => {
    mockEvent.findUnique.mockResolvedValue({
      ...sampleEvent,
      owner: { id: 'user-1', nickname: 'admin', email: 'a@b.com' },
      _count: { members: 0, files: 0 },
    })
    mockEventMember.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'GET',
      url: '/api/events/evt-1',
      headers: { authorization: `Bearer ${makeToken()}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().role).toBe('owner')
  })

  it('404 — несуществующее мероприятие', async () => {
    mockEvent.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'GET',
      url: '/api/events/no-such-id',
      headers: { authorization: `Bearer ${makeToken()}` },
    })

    expect(res.statusCode).toBe(404)
  })

  it('403 — нет доступа', async () => {
    mockEvent.findUnique.mockResolvedValue({
      ...sampleEvent,
      ownerId: 'other-user',
      owner: { id: 'other-user', nickname: 'other', email: 'o@b.com' },
      _count: { members: 0, files: 0 },
    })
    mockEventMember.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'GET',
      url: '/api/events/evt-1',
      headers: { authorization: `Bearer ${makeToken()}` },
    })

    expect(res.statusCode).toBe(403)
  })
})

// ============================
// PATCH /api/events/:id
// ============================
describe('PATCH /api/events/:id', () => {
  it('200 — обновляет мероприятие', async () => {
    mockEvent.findUnique.mockResolvedValue(sampleEvent)
    mockEvent.update.mockResolvedValue({ ...sampleEvent, title: 'Новое название' })

    const res = await app.inject({
      method: 'PATCH',
      url: '/api/events/evt-1',
      headers: { authorization: `Bearer ${makeToken()}` },
      payload: { title: 'Новое название' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().title).toBe('Новое название')
  })

  it('403 — не владелец', async () => {
    mockEvent.findUnique.mockResolvedValue({ ...sampleEvent, ownerId: 'other' })

    const res = await app.inject({
      method: 'PATCH',
      url: '/api/events/evt-1',
      headers: { authorization: `Bearer ${makeToken()}` },
      payload: { title: 'Hack' },
    })

    expect(res.statusCode).toBe(403)
  })
})

// ============================
// DELETE /api/events/:id
// ============================
describe('DELETE /api/events/:id', () => {
  it('200 — удаляет мероприятие', async () => {
    mockEvent.findUnique.mockResolvedValue(sampleEvent)
    mockEvent.delete.mockResolvedValue(sampleEvent)

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/events/evt-1',
      headers: { authorization: `Bearer ${makeToken()}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().message).toContain('удалён')
  })

  it('403 — не владелец', async () => {
    mockEvent.findUnique.mockResolvedValue({ ...sampleEvent, ownerId: 'other' })

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/events/evt-1',
      headers: { authorization: `Bearer ${makeToken()}` },
    })

    expect(res.statusCode).toBe(403)
  })

  it('404 — несуществующее мероприятие', async () => {
    mockEvent.findUnique.mockResolvedValue(null)

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/events/no-such',
      headers: { authorization: `Bearer ${makeToken()}` },
    })

    expect(res.statusCode).toBe(404)
  })
})
