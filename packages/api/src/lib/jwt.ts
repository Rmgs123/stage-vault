import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

interface TokenPayload {
  userId: string
}

interface CodeTokenPayload {
  eventId: string
  codeId: string
  type: 'access_code'
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as SignOptions)
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  } as SignOptions)
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload
}

export function generateCodeToken(eventId: string, codeId: string, ttlSeconds: number): string {
  return jwt.sign(
    { eventId, codeId, type: 'access_code' } satisfies CodeTokenPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: ttlSeconds } as SignOptions,
  )
}

export function verifyCodeToken(token: string): CodeTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as CodeTokenPayload
  if (payload.type !== 'access_code') {
    throw new Error('Invalid token type')
  }
  return payload
}
