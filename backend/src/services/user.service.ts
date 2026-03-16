import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import { ApiError } from '../utils/utils'
import { createUserBody, listUserQuery } from '../validators/user.validator'

type Requester = {
  userId: string
  role: 'admin' | 'user'
  companyId: string
}

export class UserService {
  async findAll(query: listUserQuery, requester?: Requester) {
    const requestedCompanyId = query.companyId?.trim()
    // Tenant rule: only admins may access cross-company user data.
    const companyId = !requester
      ? requestedCompanyId
      : requester.role === 'admin'
        ? requestedCompanyId
        : requester.companyId
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

  async findById(id: string, requester?: Requester) {
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
      if (requester && requester.role !== 'admin' && user.companyId !== requester.companyId) {
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

  async update(id: string, userData: Partial<createUserBody>, requester?: Requester) {
    try {
      const existing = await prisma.user.findUnique({ where: { id }, select: { companyId: true } })
      if (!existing) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'ユーザーが見つかりません')
      }
      if (requester && requester.role !== 'admin' && existing.companyId !== requester.companyId) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'ユーザーが見つかりません')
      }

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

  async delete(id: string, requester?: Requester) {
    try {
      const existing = await prisma.user.findUnique({
        where: { id },
        select: { companyId: true, role: true },
      })
      if (!existing) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'ユーザーが見つかりません')
      }
      if (requester && requester.role !== 'admin' && existing.companyId !== requester.companyId) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'ユーザーが見つかりません')
      }
      if (requester?.role === 'admin' && existing.role === 'admin') {
        throw new ApiError(StatusCodes.FORBIDDEN, '管理者ユーザーは削除できません')
      }

      const ownedRestaurantCount = await prisma.restaurant.count({ where: { createdById: id } })
      if (ownedRestaurantCount > 0) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'このユーザーが作成した飲食店が残っているため削除できません。先に飲食店を削除してください',
        )
      }

      // Review.author relation is not cascade, so remove authored reviews first.
      await prisma.review.deleteMany({ where: { authorId: id } })
      // Favorite.user relation is cascade in schema, but explicit cleanup keeps behavior stable.
      await prisma.favorite.deleteMany({ where: { userId: id } })

      await prisma.user.delete({ where: { id } })
      return {
        success: true,
        data: { message: 'ユーザーを削除しました' },
        statusCode: StatusCodes.OK,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ユーザー削除に失敗しました')
    }
  }
}

export const userService = new UserService()
