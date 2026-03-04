import { prisma } from '../prisma'
import { StatusCodes } from 'http-status-codes'

export class FavoriteService {
  async listForUser(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        restaurant: {
          include: {
            genres: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const data = favorites.map(f => {
      const { restaurant, ...favorite } = f
      const reviewCount = restaurant.reviews.length
      const averageRating =
        reviewCount === 0
          ? null
          : Number(
              (
                restaurant.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
                reviewCount
              ).toFixed(1),
            )

      return {
        id: favorite.id,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          area: restaurant.area,
          genres: restaurant.genres.map(g => g.genre),
          priceRange: restaurant.priceRange,
          icon: restaurant.icon,
          reviewCount,
          averageRating,
        },
        createdAt: favorite.createdAt,
      }
    })

    return {
      success: true,
      data,
      statusCode: StatusCodes.OK,
    }
  }

  async add(userId: string, restaurantId: string) {
    try {
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          restaurantId,
        },
      })

      return {
        success: true,
        data: {
          id: favorite.id,
          userId: favorite.userId,
          restaurantId: favorite.restaurantId,
          createdAt: favorite.createdAt,
        },
        statusCode: StatusCodes.CREATED,
      }
    } catch (err: any) {
      if (err.code === 'P2002') {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'すでにお気に入りに追加されています',
          },
          statusCode: StatusCodes.CONFLICT,
        }
      }

      throw err
    }
  }

  async remove(userId: string, restaurantId: string) {
    await prisma.favorite.deleteMany({
      where: {
        userId,
        restaurantId,
      },
    })

    return {
      success: true,
      data: { message: 'お気に入りを解除しました' },
      statusCode: StatusCodes.OK,
    }
  }
}

export const favoriteService = new FavoriteService()

