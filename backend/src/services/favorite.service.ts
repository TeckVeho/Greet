import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import { listFavoriteRestaurantsQuerySchema } from '../validators/favorite.validator'
import { resolveFileUrl } from './file.service'

function mapUserSummary(user: { id: string; name: string } | null) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
  }
}

export class FavoriteService {
  async listForUser(query: listFavoriteRestaurantsQuerySchema, userId: string) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const skip = (page - 1) * limit
    const [favorites, totalCount] = await Promise.all([
      await prisma.favorite.findMany({
        where: { userId },
        skip: skip,
        take: limit,
        include: {
          restaurant: {
            include: {
              genres: true,
              reviews: {
                select: {
                  rating: true,
                },
              },
              createdBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.favorite.count({ where: { userId } }),
    ])

    const data = await Promise.all(
      favorites.map(async f => {
        const { restaurant, ...favorite } = f
        const reviewCount = restaurant.reviews.length
        const averageRating =
          reviewCount === 0
            ? null
            : Number(
                (
                  restaurant.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewCount
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
            icon: await resolveFileUrl(restaurant.icon),
            hasPrivateRoom: restaurant.hasPrivateRoom,
            address: restaurant.address ?? undefined,
            phone: restaurant.phone ?? undefined,
            url: restaurant.url ?? undefined,
            smokingAllowed: restaurant.smokingAllowed,
            coverImage: await resolveFileUrl(restaurant.coverImage),
            reviewCount,
            averageRating,
            createdBy: mapUserSummary(restaurant.createdBy),
            createdAt: restaurant.createdAt.toISOString(),
            updatedAt: restaurant.updatedAt.toISOString(),
          },
          createdAt: favorite.createdAt,
        }
      }),
    )

    return {
      success: true,
      data,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      statusCode: StatusCodes.OK,
    }
  }

  async add(userId: string, restaurantId: string) {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
    if (!restaurant) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '飲食店が見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }

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
