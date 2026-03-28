import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken } from '../lib/jwt.js'

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
  }
}

export async function authGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    reply.code(401).send({ message: 'Необходима авторизация' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyAccessToken(token)
    request.userId = payload.userId
  } catch {
    reply.code(401).send({ message: 'Недействительный токен' })
  }
}
