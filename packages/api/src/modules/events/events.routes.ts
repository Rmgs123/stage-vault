import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { authGuard } from '../../middleware/auth.js'

const createEventSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200),
  description: z.string().max(2000).optional(),
  date: z.string().datetime().optional(),
  status: z.enum(['draft', 'ready', 'done']).optional(),
})

const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  date: z.string().datetime().nullable().optional(),
  status: z.enum(['draft', 'ready', 'done']).optional(),
})

export default async function eventsRoutes(app: FastifyInstance) {
  // All routes require auth
  app.addHook('preHandler', authGuard)

  // GET /api/events — list my events + events where I'm a member
  app.get('/api/events', async (request) => {
    const userId = request.userId!

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, nickname: true, email: true } },
        _count: { select: { members: true, files: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      coverUrl: event.coverUrl,
      status: event.status,
      ownerId: event.ownerId,
      role: event.ownerId === userId ? 'owner' : 'member',
      membersCount: event._count.members + 1, // +1 for owner
      filesCount: event._count.files,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }))
  })

  // POST /api/events — create event
  app.post('/api/events', async (request, reply) => {
    const parsed = createEventSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const userId = request.userId!
    const { title, description, date, status } = parsed.data

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        date: date ? new Date(date) : null,
        status: status || 'draft',
        ownerId: userId,
      },
    })

    return reply.code(201).send(event)
  })

  // GET /api/events/:id — get single event
  app.get('/api/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, nickname: true, email: true } },
        _count: { select: { members: true, files: true } },
      },
    })

    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден' })
    }

    // Check access: owner or member
    const isMember = await prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId: id, userId } },
    })

    if (event.ownerId !== userId && !isMember) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }

    const memberRole = isMember?.role || null

    return {
      ...event,
      role: event.ownerId === userId ? 'owner' : memberRole,
      membersCount: event._count.members + 1,
      filesCount: event._count.files,
    }
  })

  // PATCH /api/events/:id — update event (owner only)
  app.patch('/api/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден' })
    }

    if (event.ownerId !== userId) {
      return reply.code(403).send({ message: 'Только владелец может редактировать проект' })
    }

    const parsed = updateEventSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { title, description, date, status } = parsed.data

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: date ? new Date(date) : null }),
        ...(status !== undefined && { status }),
      },
    })

    return updated
  })

  // DELETE /api/events/:id — delete event (owner only)
  app.delete('/api/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден' })
    }

    if (event.ownerId !== userId) {
      return reply.code(403).send({ message: 'Только владелец может удалить проект' })
    }

    await prisma.event.delete({ where: { id } })

    return { message: 'Проект удалён' }
  })
}
