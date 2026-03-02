import jwt, { type SignOptions, type Secret } from 'jsonwebtoken'
import type { Role } from '@prisma/client'

const rawSecret = process.env.JWT_SECRET
const rawExpiresIn = process.env.JWT_EXPIRES_IN || '24h'

if (!rawSecret) {
  throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SECRET: Secret = rawSecret
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = rawExpiresIn as SignOptions['expiresIn']

export interface JwtPayloadInput {
  userId: string
  role: Role
  companyId: string
}

export function signJwt(payload: JwtPayloadInput): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  }

  return jwt.sign(payload, JWT_SECRET, options)
}

