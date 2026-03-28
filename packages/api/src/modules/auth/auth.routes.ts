import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../lib/jwt.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../../lib/email.js'
import { env } from '../../config/env.js'

const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
  nickname: z
    .string()
    .min(3, 'Минимум 3 символа')
    .max(30, 'Максимум 30 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только латинские буквы, цифры и _')
    .optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/api/auth/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.errors[0].message })
    }

    const { email, password, nickname } = parsed.data

    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existingEmail) {
      return reply.code(409).send({ message: 'Пользователь с таким email уже существует' })
    }

    if (nickname) {
      const existingNickname = await prisma.user.findFirst({
        where: { nickname: { equals: nickname, mode: 'insensitive' } },
      })
      if (existingNickname) {
        return reply.code(409).send({ message: 'Этот никнейм уже занят' })
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        nickname: nickname || null,
      },
    })

    const verifyToken = jwt.sign(
      { userId: user.id, purpose: 'email-verify' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '24h' },
    )

    await sendVerificationEmail(user.email, verifyToken)

    return reply.code(201).send({
      message: 'Регистрация прошла успешно. Проверьте почту для подтверждения.',
    })
  })

  // Login
  app.post('/api/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Заполните все поля' })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (!user) {
      return reply.code(401).send({ message: 'Неверный email или пароль' })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return reply.code(401).send({ message: 'Неверный email или пароль' })
    }

    if (!user.emailVerified) {
      return reply.code(403).send({ message: 'Подтвердите email перед входом' })
    }

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        theme: user.theme,
      },
    }
  })

  // Verify email
  app.post('/api/auth/verify-email', async (request, reply) => {
    const { token } = request.body as { token?: string }
    if (!token) {
      return reply.code(400).send({ message: 'Токен не предоставлен' })
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string
        purpose: string
      }
      if (payload.purpose !== 'email-verify') {
        return reply.code(400).send({ message: 'Недействительный токен' })
      }

      await prisma.user.update({
        where: { id: payload.userId },
        data: { emailVerified: true },
      })

      return { message: 'Email успешно подтверждён. Теперь вы можете войти.' }
    } catch {
      return reply.code(400).send({ message: 'Токен недействителен или истёк' })
    }
  })

  // Refresh tokens
  app.post('/api/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string }
    if (!refreshToken) {
      return reply.code(400).send({ message: 'Refresh token не предоставлен' })
    }

    try {
      const payload = verifyRefreshToken(refreshToken)

      const user = await prisma.user.findUnique({ where: { id: payload.userId } })
      if (!user) {
        return reply.code(401).send({ message: 'Пользователь не найден' })
      }

      const newAccessToken = generateAccessToken(user.id)
      const newRefreshToken = generateRefreshToken(user.id)

      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    } catch {
      return reply.code(401).send({ message: 'Недействительный refresh token' })
    }
  })

  // Forgot password
  app.post('/api/auth/forgot-password', async (request, reply) => {
    const { email } = request.body as { email?: string }
    if (!email) {
      return reply.code(400).send({ message: 'Укажите email' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (user) {
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password-reset' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '1h' },
      )
      await sendPasswordResetEmail(user.email, resetToken)
    }

    // Always return success to prevent email enumeration
    return { message: 'Если email зарегистрирован, ссылка для сброса отправлена.' }
  })

  // Reset password
  app.post('/api/auth/reset-password', async (request, reply) => {
    const { token, password } = request.body as { token?: string; password?: string }
    if (!token || !password) {
      return reply.code(400).send({ message: 'Заполните все поля' })
    }

    if (password.length < 8) {
      return reply.code(400).send({ message: 'Пароль должен быть не менее 8 символов' })
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string
        purpose: string
      }
      if (payload.purpose !== 'password-reset') {
        return reply.code(400).send({ message: 'Недействительный токен' })
      }

      const passwordHash = await bcrypt.hash(password, 10)

      await prisma.user.update({
        where: { id: payload.userId },
        data: { passwordHash },
      })

      return { message: 'Пароль успешно обновлён.' }
    } catch {
      return reply.code(400).send({ message: 'Токен недействителен или истёк' })
    }
  })
}
