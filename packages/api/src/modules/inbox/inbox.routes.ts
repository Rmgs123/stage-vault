import { FastifyInstance } from 'fastify'
import prisma from '../../lib/prisma.js'
import { authGuard } from '../../middleware/auth.js'

interface NotificationMeta {
  eventId?: string
  eventTitle?: string
  fromUserId?: string
  fromUserName?: string
  newRole?: string
}

export default async function inboxRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  // GET /api/notifications — list notifications for current user
  app.get('/api/notifications', async (request) => {
    const userId = request.userId!

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return notifications
  })

  // GET /api/notifications/unread-count — count unread notifications
  app.get('/api/notifications/unread-count', async (request) => {
    const userId = request.userId!

    const count = await prisma.notification.count({
      where: { userId, read: false },
    })

    return { count }
  })

  // PATCH /api/notifications/:nid — mark as read
  app.patch('/api/notifications/:nid', async (request, reply) => {
    const { nid } = request.params as { nid: string }
    const userId = request.userId!

    const notification = await prisma.notification.findUnique({
      where: { id: nid },
    })

    if (!notification || notification.userId !== userId) {
      return reply.code(404).send({ message: 'Уведомление не найдено' })
    }

    const updated = await prisma.notification.update({
      where: { id: nid },
      data: { read: true },
    })

    return updated
  })

  // POST /api/notifications/:nid/accept — accept invite
  app.post('/api/notifications/:nid/accept', async (request, reply) => {
    const { nid } = request.params as { nid: string }
    const userId = request.userId!

    const notification = await prisma.notification.findUnique({
      where: { id: nid },
    })

    if (!notification || notification.userId !== userId) {
      return reply.code(404).send({ message: 'Уведомление не найдено' })
    }

    if (notification.type !== 'invite') {
      return reply.code(400).send({ message: 'Это уведомление не является приглашением' })
    }

    if (notification.read) {
      return reply.code(400).send({ message: 'Приглашение уже обработано' })
    }

    const meta = notification.meta as NotificationMeta | null
    const eventId = meta?.eventId

    if (!eventId) {
      return reply.code(400).send({ message: 'Некорректные данные приглашения' })
    }

    // Check event still exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    })

    if (!event) {
      // Mark as read and return error
      await prisma.notification.update({
        where: { id: nid },
        data: { read: true },
      })
      return reply.code(400).send({ message: 'Проект больше не существует' })
    }

    // Check if already a member (edge case)
    const existingMember = await prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId, userId } },
    })

    if (existingMember) {
      await prisma.notification.update({
        where: { id: nid },
        data: { read: true },
      })
      return reply.code(409).send({ message: 'Вы уже являетесь участником этого проекта' })
    }

    // Create membership with viewer role
    await prisma.eventMember.create({
      data: {
        eventId,
        userId,
        role: 'viewer',
      },
    })

    // Mark notification as read
    const updated = await prisma.notification.update({
      where: { id: nid },
      data: { read: true },
    })

    return {
      message: 'Приглашение принято',
      data: { eventId, eventTitle: event.title },
    }
  })

  // POST /api/notifications/:nid/decline — decline invite
  app.post('/api/notifications/:nid/decline', async (request, reply) => {
    const { nid } = request.params as { nid: string }
    const userId = request.userId!

    const notification = await prisma.notification.findUnique({
      where: { id: nid },
    })

    if (!notification || notification.userId !== userId) {
      return reply.code(404).send({ message: 'Уведомление не найдено' })
    }

    if (notification.type !== 'invite') {
      return reply.code(400).send({ message: 'Это уведомление не является приглашением' })
    }

    if (notification.read) {
      return reply.code(400).send({ message: 'Приглашение уже обработано' })
    }

    // Mark notification as read
    const updated = await prisma.notification.update({
      where: { id: nid },
      data: { read: true },
    })

    return { message: 'Приглашение отклонено' }
  })
}
