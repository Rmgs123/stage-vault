import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken, verifyCodeToken } from '../lib/jwt.js'

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    codeEventId?: string
    isCodeAccess?: boolean
  }
}

export async function authGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    reply.code(401).send({ message: 'Необходима авторизация' })
    return
  }

  const token = authHeader.slice(7)

  // Try regular user token first
  try {
    const payload = verifyAccessToken(token)
    request.userId = payload.userId
    request.isCodeAccess = false
    return
  } catch {
    // Not a regular token, try code token
  }

  // Try code token
  try {
    const payload = verifyCodeToken(token)
    request.codeEventId = payload.eventId
    request.isCodeAccess = true
  } catch {
    reply.code(401).send({ message: 'Недействительный токен' })
  }
}
