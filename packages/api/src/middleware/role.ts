import { FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../lib/prisma.js'

type EventRole = 'owner' | 'editor' | 'viewer'

/**
 * Factory that returns a Fastify preHandler checking the caller's role
 * on the event identified by `request.params.id`.
 *
 * Usage:
 *   { preHandler: [authGuard, roleGuard(['owner', 'editor'])] }
 *
 * The guard resolves the caller's role:
 *  - 'owner'  if they own the event
 *  - 'editor' / 'viewer' from the EventMember row
 *
 * It attaches `request.eventRole` for downstream handlers.
 */
declare module 'fastify' {
  interface FastifyRequest {
    eventRole?: EventRole
  }
}

export function roleGuard(allowedRoles: EventRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId
    if (!userId) {
      reply.code(401).send({ message: 'Необходима авторизация' })
      return
    }

    const { id } = request.params as { id?: string }
    if (!id) {
      reply.code(400).send({ message: 'Не указан ID проекта' })
      return
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: { ownerId: true },
    })

    if (!event) {
      reply.code(404).send({ message: 'Проект не найден' })
      return
    }

    let role: EventRole

    if (event.ownerId === userId) {
      role = 'owner'
    } else {
      const membership = await prisma.eventMember.findUnique({
        where: { eventId_userId: { eventId: id, userId } },
      })

      if (!membership) {
        reply.code(403).send({ message: 'Нет доступа к проекту' })
        return
      }

      role = membership.role as EventRole
    }

    if (!allowedRoles.includes(role)) {
      reply.code(403).send({ message: 'Недостаточно прав для этого действия' })
      return
    }

    request.eventRole = role
  }
}
