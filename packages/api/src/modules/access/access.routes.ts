import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto from 'crypto'
import prisma from '../../lib/prisma.js'
import { authGuard } from '../../middleware/auth.js'
import { roleGuard } from '../../middleware/role.js'
import { generateCodeToken, verifyCodeToken } from '../../lib/jwt.js'

const generateCodeSchema = z.object({
  ttlHours: z
    .number({ invalid_type_error: 'TTL должен быть числом' })
    .int('TTL должен быть целым числом')
    .min(1, 'Минимальный TTL — 1 час')
    .max(168, 'Максимальный TTL — 168 часов (7 дней)')
    .default(24),
})

const verifyCodeSchema = z.object({
  code: z
    .string({ required_error: 'Код доступа обязателен' })
    .length(6, 'Код должен содержать 6 символов')
    .regex(/^[A-Z0-9]+$/i, 'Код может содержать только латинские буквы и цифры'),
})

function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // excluded I, O, 0, 1 for readability
  let code = ''
  const bytes = crypto.randomBytes(6)
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

export default async function accessRoutes(app: FastifyInstance) {
  // POST /api/events/:id/access-codes — generate access code (owner/editor only)
  app.post(
    '/api/events/:id/access-codes',
    { preHandler: [authGuard, roleGuard(['owner', 'editor'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string }

      const parsed = generateCodeSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ message: parsed.error.errors[0].message })
      }

      const { ttlHours } = parsed.data

      // Revoke any existing active codes for this event
      await prisma.accessCode.updateMany({
        where: { eventId: id, revoked: false },
        data: { revoked: true },
      })

      // Generate a unique code
      let code = generateRandomCode()
      let attempts = 0
      while (attempts < 10) {
        const existing = await prisma.accessCode.findUnique({ where: { code } })
        if (!existing) break
        code = generateRandomCode()
        attempts++
      }

      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000)

      const accessCode = await prisma.accessCode.create({
        data: {
          eventId: id,
          code,
          expiresAt,
        },
      })

      return reply.code(201).send({
        data: {
          id: accessCode.id,
          code: accessCode.code,
          expiresAt: accessCode.expiresAt.toISOString(),
          ttlHours,
        },
        message: 'Код доступа сгенерирован',
      })
    },
  )

  // GET /api/events/:id/access-codes — get active code for event
  app.get(
    '/api/events/:id/access-codes',
    { preHandler: [authGuard, roleGuard(['owner', 'editor'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string }

      const activeCode = await prisma.accessCode.findFirst({
        where: {
          eventId: id,
          revoked: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      })

      return reply.send({
        data: activeCode
          ? {
              id: activeCode.id,
              code: activeCode.code,
              expiresAt: activeCode.expiresAt.toISOString(),
              createdAt: activeCode.createdAt.toISOString(),
            }
          : null,
      })
    },
  )

  // DELETE /api/events/:id/access-codes/:cid — revoke access code
  app.delete(
    '/api/events/:id/access-codes/:cid',
    { preHandler: [authGuard, roleGuard(['owner', 'editor'])] },
    async (request, reply) => {
      const { id, cid } = request.params as { id: string; cid: string }

      const accessCode = await prisma.accessCode.findUnique({
        where: { id: cid },
      })

      if (!accessCode || accessCode.eventId !== id) {
        return reply.code(404).send({ message: 'Код доступа не найден' })
      }

      if (accessCode.revoked) {
        return reply.code(400).send({ message: 'Код уже отозван' })
      }

      await prisma.accessCode.update({
        where: { id: cid },
        data: { revoked: true },
      })

      return reply.send({ message: 'Код доступа отозван' })
    },
  )

  // POST /api/access/verify — public endpoint, verify code and return temp JWT
  app.post('/api/access/verify', async (request, reply) => {
    const parsed = verifyCodeSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { code } = parsed.data

    const accessCode = await prisma.accessCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        event: {
          select: { id: true, title: true },
        },
      },
    })

    if (!accessCode) {
      return reply.code(404).send({ message: 'Неверный код доступа' })
    }

    if (accessCode.revoked) {
      return reply.code(410).send({ message: 'Код доступа был отозван' })
    }

    if (accessCode.expiresAt < new Date()) {
      return reply.code(410).send({ message: 'Срок действия кода истёк' })
    }

    // Calculate remaining TTL in seconds
    const ttlSeconds = Math.floor((accessCode.expiresAt.getTime() - Date.now()) / 1000)

    const token = generateCodeToken(accessCode.eventId, accessCode.id, ttlSeconds)

    return reply.send({
      data: {
        token,
        eventId: accessCode.eventId,
        eventTitle: accessCode.event.title,
        expiresAt: accessCode.expiresAt.toISOString(),
      },
      message: 'Код подтверждён',
    })
  })
}
