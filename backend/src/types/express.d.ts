import type { Role } from '@prisma/client'

export interface JwtPayload {
  userId: string
  role: Role
  companyId: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export {}
