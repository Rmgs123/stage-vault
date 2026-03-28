import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

interface TokenPayload {
  userId: string
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
