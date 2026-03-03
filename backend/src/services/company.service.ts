import { prisma } from '../prisma'
import { StatusCodes } from 'http-status-codes'

interface CompanyResponse {
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
  }
  statusCode: number
}

export class CompanyService {
  async findAll(): Promise<CompanyResponse> {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        icon: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    const data = companies.map(company => ({
      id: company.id,
      name: company.name,
      code: company.code,
      icon: company.icon,
      userCount: company._count.users,
      createdAt: company.createdAt,
    }))

    return {
      success: true,
      data,
      statusCode: StatusCodes.OK,
    }
  }

  async create(payload: { name: string; code: string; icon?: string }): Promise<CompanyResponse> {
    try {
      const company = await prisma.company.create({
        data: {
          name: payload.name,
          code: payload.code,
          icon: payload.icon,
        },
        select: {
          id: true,
          name: true,
          code: true,
          icon: true,
          createdAt: true,
        },
      })

      return {
        success: true,
        data: company,
        statusCode: StatusCodes.CREATED,
      }
    } catch (err: any) {
      // 重複コードなどのユニーク制約違反は 409 にマッピング
      if (err.code === 'P2002') {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: '同じ会社コードが既に存在します',
          },
          statusCode: StatusCodes.CONFLICT,
        }
      }

      throw err
    }
  }
}

export const companyService = new CompanyService()

