import type { User } from '@prisma/client'
import { prisma } from '../prisma'
import { comparePassword } from '../utils/password'
import { signJwt } from '../utils/jwt'
import { resolveFileUrl } from './file.service'

interface LoginResult {
  token: string
  user: UserWithCompany
}

type UserWithCompany = Omit<User, 'passwordHash'> & {
  company: {
    id: string
    name: string
    code: string
  }
}

export async function login(email: string, password: string): Promise<LoginResult | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) {
    return null
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  })

  const token = signJwt({
    userId: user.id,
    role: user.role,
    companyId: user.companyId,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userWithoutPassword } = user
  userWithoutPassword.avatar = (await resolveFileUrl(userWithoutPassword.avatar)) ?? null

  return {
    token,
    user: userWithoutPassword,
  }
}

export async function getCurrentUser(userId: string): Promise<UserWithCompany | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userWithoutPassword } = user
  userWithoutPassword.avatar = (await resolveFileUrl(userWithoutPassword.avatar)) ?? null
  return userWithoutPassword
}

