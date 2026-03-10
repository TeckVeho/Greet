import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import { ApiError } from '../utils/utils'
import { createUserBody, listUserQuery } from '../validators/user.validator'

export class UserService {
  async findAll(query: listUserQuery) {
    const companyId = query.companyId?.trim()
    const search = query.search?.trim()
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const skip = (page - 1) * limit

    const whereCondition: Prisma.UserWhereInput = {
      AND: [
        companyId ? { companyId: companyId } : {},

        search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { department: { contains: search } },
                { company: { name: { contains: search } } },
              ],
            }
          : {},
      ],
    }
    try {
      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: whereCondition,
          skip: skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            company: true,
          },
        }),
        prisma.user.count({ where: whereCondition }),
      ])

      const safeData = users.map(({ passwordHash, ...user }) => user)

      return {
        success: true,
        data: safeData,
        meta: {
          total: totalCount,
          page,
          limit,
          total_pages: Math.ceil(totalCount / limit),
        },
        statusCode: StatusCodes.OK,
      }
    } catch (err) {
      console.error('Prisma Error:', err)
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Server Error')
    }
  }

  async findById(id: string) {
    try {
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
        throw new ApiError(StatusCodes.NOT_FOUND, 'ユーザーが見つかりません')
      }
      const { passwordHash, ...safeUser } = user
      return { success: true, data: safeUser, statusCode: StatusCodes.OK }
    } catch (err) {
      if (err instanceof ApiError) throw err
      throw new ApiError(StatusCodes.NOT_FOUND, 'ユーザーが見つかりません')
    }
  }

  async create(userData: createUserBody & { companyId: string }) {
    try {
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
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ユーザー作成に失敗しました')
    }
  }

  async update(id: string, userData: Partial<createUserBody>) {
    try {
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
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ユーザー更新に失敗しました')
    }
  }

  async delete(id: string) {
    try {
      await prisma.user.delete({ where: { id } })
      return {
        success: true,
        data: { message: 'ユーザーを削除しました' },
        statusCode: StatusCodes.OK,
      }
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ユーザー削除に失敗しました')
    }
  }
}

export const userService = new UserService()
