import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '../../lib/prisma.js'
import { authGuard } from '../../middleware/auth.js'
const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(3, 'Nickname must be at least 3 characters')
    .max(30, 'Nickname must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nickname can only contain letters, numbers, and underscores'),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

const themeSchema = z.object({
  theme: z.enum(['light', 'dark']),
})

export default async function usersRoutes(app: FastifyInstance) {
  // GET /api/users/search?q= — search users by nickname or email (for invite)
  app.get('/api/users/search', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = request.userId!
    const { q } = request.query as { q?: string }

    if (!q || q.trim().length < 2) {
      return reply.code(400).send({ message: 'Введите минимум 2 символа для поиска' })
    }

    const query = q.trim()

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { emailVerified: true },
          {
            OR: [
              { nickname: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        nickname: true,
      },
      take: 10,
      orderBy: { nickname: 'asc' },
    })

    return users
  })

  // GET /api/users/me — get current user profile
  app.get('/api/users/me', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = request.userId!

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        theme: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return reply.status(404).send({ message: 'Пользователь не найден' })
    }

    return user
  })

  // PATCH /api/users/me/nickname — update nickname
  app.patch('/api/users/me/nickname', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId

    const parsed = nicknameSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: parsed.error.errors[0].message })
    }

    const { nickname } = parsed.data

    // Check if nickname is already taken (case insensitive), excluding current user
    const existing = await prisma.user.findFirst({
      where: {
        nickname: { equals: nickname, mode: 'insensitive' },
        NOT: { id: userId },
      },
    })

    if (existing) {
      return reply.status(409).send({ message: 'Этот никнейм уже занят' })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        theme: true,
      },
      data: { nickname },
    })

    return updated
  })

  // PATCH /api/users/me/password — change password
  app.patch('/api/users/me/password', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId

    const parsed = changePasswordSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: parsed.error.errors[0].message })
    }

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return reply.status(404).send({ message: 'Пользователь не найден' })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) {
      return reply.status(401).send({ message: 'Неверный текущий пароль' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return { message: 'Пароль обновлён' }
  })

  // PATCH /api/users/me/theme — update theme preference
  app.patch('/api/users/me/theme', { preHandler: [authGuard] }, async (request, reply) => {
    const userId = (request as any).userId

    const parsed = themeSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Недопустимая тема' })
    }

    const { theme } = parsed.data

    await prisma.user.update({
      where: { id: userId },
      data: { theme },
    })

    return { theme }
  })
}
