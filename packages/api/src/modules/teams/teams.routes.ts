import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { authGuard } from '../../middleware/auth.js'

const inviteSchema = z.object({
  userId: z.string().uuid('Некорректный ID пользователя'),
})

const changeRoleSchema = z.object({
  role: z.enum(['editor', 'viewer'], {
    errorMap: () => ({ message: 'Роль должна быть «editor» или «viewer»' }),
  }),
})

async function getEventWithAccess(
  eventId: string,
  userId: string,
): Promise<{
  event: { id: string; ownerId: string; title: string } | null
  role: string | null
}> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, ownerId: true, title: true },
  })

  if (!event) return { event: null, role: null }

  if (event.ownerId === userId) return { event, role: 'owner' }

  const membership = await prisma.eventMember.findUnique({
    where: { eventId_userId: { eventId, userId } },
  })

  return { event, role: membership?.role || null }
}

export default async function teamsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authGuard)

  // GET /api/events/:id/members — list members (including owner)
  app.get('/api/events/:id/members', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const { event, role } = await getEventWithAccess(id, userId)

    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден' })
    }

    if (!role) {
      return reply.code(403).send({ message: 'Нет доступа к проекту' })
    }

    // Get owner
    const owner = await prisma.user.findUnique({
      where: { id: event.ownerId },
      select: { id: true, email: true, nickname: true },
    })

    // Get members
    const members = await prisma.eventMember.findMany({
      where: { eventId: id },
      include: {
        user: { select: { id: true, email: true, nickname: true } },
      },
      orderBy: { id: 'asc' },
    })

    const result = [
      // Owner first
      {
        id: 'owner',
        userId: owner!.id,
        email: owner!.email,
        nickname: owner!.nickname,
        role: 'owner' as const,
        joinedAt: null,
      },
      // Then members
      ...members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        email: m.user.email,
        nickname: m.user.nickname,
        role: m.role,
        joinedAt: m.id, // Using member id as a proxy, since EventMember doesn't have createdAt
      })),
    ]

    return result
  })

  // POST /api/events/:id/members/invite — invite a user
  app.post('/api/events/:id/members/invite', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.userId!

    const { event, role } = await getEventWithAccess(id, userId)

    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден' })
    }

    if (role !== 'owner') {
      return reply.code(403).send({ message: 'Только владелец может приглашать участников' })
    }

    const parsed = inviteSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { userId: targetUserId } = parsed.data

    // Can't invite yourself
    if (targetUserId === userId) {
      return reply.code(400).send({ message: 'Нельзя пригласить самого себя' })
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, nickname: true },
    })

    if (!targetUser) {
      return reply.code(404).send({ message: 'Пользователь не найден' })
    }

    // Check if already a member
    const existingMember = await prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId: id, userId: targetUserId } },
    })

    if (existingMember) {
      return reply.code(409).send({ message: 'Пользователь уже является участником проекта' })
    }

    // Check if there's already a pending invite notification
    const existingInvite = await prisma.notification.findFirst({
      where: {
        userId: targetUserId,
        type: 'invite',
        read: false,
        meta: {
          path: ['eventId'],
          equals: id,
        },
      },
    })

    if (existingInvite) {
      return reply.code(409).send({ message: 'Приглашение уже отправлено этому пользователю' })
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true, email: true },
    })

    const fromName = inviter?.nickname || inviter?.email || 'Пользователь'

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'invite',
        title: 'Приглашение в проект',
        body: `${fromName} пригласил вас в проект «${event.title}»`,
        meta: {
          eventId: id,
          eventTitle: event.title,
          fromUserId: userId,
          fromUserName: fromName,
        },
      },
    })

    return reply.code(201).send({
      message: 'Приглашение отправлено',
      data: { notificationId: notification.id },
    })
  })

  // PATCH /api/events/:id/members/:mid — change member role (owner only)
  app.patch('/api/events/:id/members/:mid', async (request, reply) => {
    const { id, mid } = request.params as { id: string; mid: string }
    const userId = request.userId!

    const { event, role } = await getEventWithAccess(id, userId)

    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден' })
    }

    if (role !== 'owner') {
      return reply.code(403).send({ message: 'Только владелец может изменять роли' })
    }

    const parsed = changeRoleSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { role: newRole } = parsed.data

    const member = await prisma.eventMember.findUnique({
      where: { id: mid },
      include: { user: { select: { id: true, nickname: true, email: true } } },
    })

    if (!member || member.eventId !== id) {
      return reply.code(404).send({ message: 'Участник не найден' })
    }

    const updated = await prisma.eventMember.update({
      where: { id: mid },
      data: { role: newRole },
      include: { user: { select: { id: true, email: true, nickname: true } } },
    })

    // Get owner name for notification
    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true, email: true },
    })
    const ownerName = owner?.nickname || owner?.email || 'Владелец'

    const roleLabel = newRole === 'editor' ? 'Редактор' : 'Зритель'

    // Notify the member about role change
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: 'role_change',
        title: 'Изменение роли',
        body: `${ownerName} изменил вашу роль в проекте «${event.title}» на «${roleLabel}»`,
        meta: {
          eventId: id,
          eventTitle: event.title,
          fromUserId: userId,
          fromUserName: ownerName,
          newRole,
        },
      },
    })

    return {
      id: updated.id,
      userId: updated.user.id,
      email: updated.user.email,
      nickname: updated.user.nickname,
      role: updated.role,
    }
  })

  // DELETE /api/events/:id/members/:mid — remove member (owner only)
  app.delete('/api/events/:id/members/:mid', async (request, reply) => {
    const { id, mid } = request.params as { id: string; mid: string }
    const userId = request.userId!

    const { event, role } = await getEventWithAccess(id, userId)

    if (!event) {
      return reply.code(404).send({ message: 'Проект не найден' })
    }

    if (role !== 'owner') {
      return reply.code(403).send({ message: 'Только владелец может удалять участников' })
    }

    const member = await prisma.eventMember.findUnique({
      where: { id: mid },
      include: { user: { select: { id: true, nickname: true, email: true } } },
    })

    if (!member || member.eventId !== id) {
      return reply.code(404).send({ message: 'Участник не найден' })
    }

    await prisma.eventMember.delete({ where: { id: mid } })

    // Get owner name
    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true, email: true },
    })
    const ownerName = owner?.nickname || owner?.email || 'Владелец'

    // Notify removed member
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: 'removed',
        title: 'Удаление из проекта',
        body: `${ownerName} удалил вас из проекта «${event.title}»`,
        meta: {
          eventId: id,
          eventTitle: event.title,
          fromUserId: userId,
          fromUserName: ownerName,
        },
      },
    })

    return { message: 'Участник удалён из проекта' }
  })
}
