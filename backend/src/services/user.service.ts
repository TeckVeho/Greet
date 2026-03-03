import { prisma } from '../prisma'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'

export class UserService {
  async findAll() {
    const users = await prisma.user.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    const safeData = users.map(({ passwordHash, ...user }) => user)
    return {
      success: true,
      data: safeData,
      statusCode: StatusCodes.OK,
    }
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'ユーザーが見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }
    const { passwordHash, ...safeUser } = user
    return { success: true, data: safeUser, statusCode: StatusCodes.OK }
  }

  async create(userData: {
    name: string
    email: string
    password: string
    role: 'user' | 'admin'
    department?: string
    avatar?: string
    icon?: string
    companyId: string
  }) {
    const { password, ...rest } = userData
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        ...rest,
        passwordHash: hashedPassword,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    const { passwordHash, ...safeUser } = user
    return { success: true, data: safeUser, statusCode: StatusCodes.CREATED }
  }

  async update(
    id: string,
    userData: Partial<{
      name: string
      email: string
      password: string
      role: 'user' | 'admin'
      department?: string
      avatar?: string
      icon?: string
      companyId: string
    }>,
  ) {
    const { password, ...rest } = userData
    const data: any = { ...rest }
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 12)
    }
    const user = await prisma.user.update({
      where: { id },
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    const { passwordHash, ...safeUser } = user
    return { success: true, data: safeUser, statusCode: StatusCodes.OK }
  }

  async delete(id: string) {
    await prisma.user.delete({ where: { id } })
    return { success: true, data: { message: 'ユーザーを削除しました' }, statusCode: StatusCodes.OK }
  }
}

export const userService = new UserService()
