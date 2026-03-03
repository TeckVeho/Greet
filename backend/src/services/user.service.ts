import { prisma } from '@/prisma'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'

export class UserService {
  async findAll() {
    const users = await prisma.user.findMany({
      include: { company: true },
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
    })
    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }
    const { passwordHash, ...safeUser } = user
    return { success: true, data: safeUser, statusCode: StatusCodes.OK }
  }

  async create(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    })
    return { success: true, data: user, statusCode: StatusCodes.CREATED }
  }

  async update(id: string, userData: any) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12)
    }
    const user = await prisma.user.update({
      where: { id },
      data: userData,
    })
    return { success: true, data: user, statusCode: StatusCodes.OK }
  }

  async delete(id: string) {
    await prisma.user.delete({ where: { id } })
    return { success: true, data: null, statusCode: StatusCodes.OK }
  }
}

export const userService = new UserService()
