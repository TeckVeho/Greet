import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import {
  createRestaurantBodySchema,
  updateRestaurantBodySchema,
} from '../validators/restaurant.validator'

export class RestaurantService {
  async findAll() {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        company: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    })
    return { success: true, data: restaurants, statusCode: StatusCodes.OK }
  }

  async findById(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        company: true,
        genres: true,
      },
    })

    if (!restaurant) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'レストランが見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }

    return { success: true, data: restaurant, statusCode: StatusCodes.OK }
  }

  async create(payload: createRestaurantBodySchema) {
    const restaurant = await prisma.restaurant.create({
      data: payload,
    })

    return { success: true, data: restaurant, statusCode: StatusCodes.CREATED }
  }

  async update(id: string, payload: updateRestaurantBodySchema) {
    try {
      const restaurant = await prisma.restaurant.update({
        where: { id },
        data: payload,
      })
      return { success: true, data: restaurant, statusCode: StatusCodes.OK }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'レストランが見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }
  }

  async delete(id: string) {
    await prisma.restaurant.delete({ where: { id } })
    return {
      success: true,
      data: { message: 'レストランを削除しました' },
      statusCode: StatusCodes.OK,
    }
  }
}

export const restaurantService = new RestaurantService()
