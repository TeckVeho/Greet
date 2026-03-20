import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import { ApiError } from '../utils/utils'
import { createUserBody, listUserQuery } from '../validators/user.validator'
import { uploadFile } from './file.service'

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
          totalPages: Math.ceil(totalCount / limit),
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

  async create(userData: createUserBody & { companyId: string }, file?: Express.Multer.File) {
    try {
      const [existingUser, company] = await Promise.all([
        prisma.user.findUnique({
          where: { email: userData.email },
          select: { id: true },
        }),
        prisma.company.findUnique({
          where: { id: userData.companyId },
          select: { id: true },
        }),
      ])

      if (existingUser) {
        throw new ApiError(StatusCodes.CONFLICT, '同じメールアドレスのユーザーが既に存在します')
      }

      if (!company) {
        throw new ApiError(StatusCodes.BAD_REQUEST, '有効な会社IDを指定してください')
      }

      const { password, ...rest } = userData
      const hashedPassword = await bcrypt.hash(password, 12)
      let avatarUrl = undefined
      if (file) {
        avatarUrl = await uploadFile(file)
      }
      const user = await prisma.user.create({
        data: {
          ...rest,
          passwordHash: hashedPassword,
          avatar: avatarUrl,
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
      if (error instanceof ApiError) {
        throw error
      }

      const prismaError = error as { code?: string }
      if (prismaError.code === 'P2002') {
        throw new ApiError(StatusCodes.CONFLICT, '同じメールアドレスのユーザーが既に存在します')
      }

      throw new ApiError(StatusCodes.BAD_REQUEST, 'ユーザー作成に失敗しました')
    }
  }

  async update(
    id: string,
    userData: Partial<createUserBody>,
    requester?: Requester,
    file?: Express.Multer.File,
  ) {
    try {
      const existing = await prisma.user.findUnique({ where: { id }, select: { companyId: true } })
      if (!existing) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'ユーザーが見つかりません')
      }
      if (requester && requester.role !== 'admin' && existing.companyId !== requester.companyId) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'ユーザーが見つかりません')
      }

      if (userData.email) {
        const existingEmailUser = await prisma.user.findUnique({
          where: { email: userData.email },
          select: { id: true },
        })
        if (existingEmailUser && existingEmailUser.id !== id) {
          throw new ApiError(StatusCodes.CONFLICT, '同じメールアドレスのユーザーが既に存在します')
        }
      }

      if (userData.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: userData.companyId },
          select: { id: true },
        })
        if (!company) {
          throw new ApiError(StatusCodes.BAD_REQUEST, '有効な会社IDを指定してください')
        }
      }

      const { password, ...rest } = userData
      const data: any = { ...rest }
      if (password) {
        data.passwordHash = await bcrypt.hash(password, 12)
      }
      if (file) {
        data.avatar = await uploadFile(file)
      } else if (userData.avatar === 'null' || userData.avatar === null) {
        data.avatar = null
      } else {
        delete data.avatar
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
      if (error instanceof ApiError) {
        throw error
      }

      const prismaError = error as { code?: string }
      if (prismaError.code === 'P2002') {
        throw new ApiError(StatusCodes.CONFLICT, '同じメールアドレスのユーザーが既に存在します')
      }

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
