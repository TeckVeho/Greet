import { Area, Genre, Prisma } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import { cleanArray, parseBoolean } from '../utils/utils'
import type {
  createRestaurantBodySchema,
  listRestaurantsQueryBodySchema,
  updateRestaurantBodySchema,
} from '../validators/restaurant.validator'
import { deleteFile } from './file.service'
import { resolveFileUrl } from './file.service'

type CreateRestaurantInput = createRestaurantBodySchema & { companyId: string; createdById: string }
type UpdateRestaurantInput = updateRestaurantBodySchema
type ListQuery = listRestaurantsQueryBodySchema

export class RestaurantService {
  async findAll(query: ListQuery, companyId: string) {
    const smokingAllowed = parseBoolean(query.smokingAllowed)
    const hasPrivateRoom = parseBoolean(query.hasPrivateRoom)
    let genres = cleanArray(query.genres)
    let areas = cleanArray(query.areas)
    let priceRanges = cleanArray(query.priceRanges)
    const search = query.search?.trim()
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const skip = (page - 1) * limit

    if (genres && !Array.isArray(genres)) {
      genres = [genres]
    }
    if (areas && !Array.isArray(areas)) {
      areas = [areas]
    }
    if (priceRanges && !Array.isArray(priceRanges)) {
      priceRanges = [priceRanges]
    }
    const matchedAreas = search
      ? Object.values(Area).filter(area => area.toLowerCase().includes(search.toLowerCase()))
      : []

    const matchedGenres = search
      ? Object.values(Genre).filter(genre => genre.toLowerCase().includes(search.toLowerCase()))
      : []

    const where: Prisma.RestaurantWhereInput = {
      AND: [
        companyId ? { companyId: companyId } : {},
        smokingAllowed !== undefined ? { smokingAllowed } : {},
        hasPrivateRoom !== undefined ? { hasPrivateRoom } : {},
        genres && genres.length > 0
          ? { genres: { some: { genre: { in: genres as Genre[] } } } }
          : {},
        areas && areas.length > 0 ? { area: { in: areas as Area[] } } : {},
        priceRanges && priceRanges.length > 0 ? { priceRange: { in: priceRanges } } : {},

        search
          ? {
              OR: [
                { name: { contains: search } },
                { area: { in: matchedAreas as Area[] } },
                {
                  genres: {
                    some: {
                      genre: { in: matchedGenres as Genre[] },
                    },
                  },
                },
              ],
            }
          : {},
      ],
    }

    const [total, restaurants] = await Promise.all([
      prisma.restaurant.count({ where }),
      prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          genres: true,
          reviews: {
            include: {
              author: true,
            },
          },

          createdBy: {
            select: { id: true, name: true, icon: true },
          },
        },
      }),
    ])

    const data = await Promise.all(
      restaurants.map(async r => {
      const reviewCount = r.reviews.length
      const averageRating =
        reviewCount === 0
          ? null
          : Number(
              (
                r.reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / reviewCount
              ).toFixed(1),
            )

      return {
        id: r.id,
        name: r.name,
        area: r.area,
        genres: r.genres.map(g => g.genre),
        hasPrivateRoom: r.hasPrivateRoom,
        priceRange: r.priceRange,
        address: r.address ?? undefined,
        phone: r.phone ?? undefined,
        url: r.url ?? undefined,
        smokingAllowed: r.smokingAllowed,
        coverImage: await resolveFileUrl(r.coverImage),
        icon: await resolveFileUrl(r.icon),
        reviewCount,
        reviews: r.reviews.map(review => ({
          id: review.id,
          occasion: review.occasion,
          author: {
            id: review.author.id,
            name: review.author.name,
            icon: review.author.icon ?? undefined,
          },
          result: review.result,
          rating: review.rating,
          createdAt: review.createdAt,
        })),
        averageRating,
        createdBy: {
          id: r.createdBy.id,
          name: r.createdBy.name,
          icon: r.createdBy.icon ?? undefined,
        },
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }
    }),
    )

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
      statusCode: StatusCodes.OK,
    }
  }

  async findById(id: string, companyId: string, userId?: string) {
    const restaurant = await prisma.restaurant.findFirst({
      where: { id, companyId },
      include: {
        genres: true,
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    if (!restaurant) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '飲食店が見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }

    const reviewCount = restaurant.reviews.length
    const averageRating =
      reviewCount === 0
        ? null
        : Number(
            (
              restaurant.reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) /
              reviewCount
            ).toFixed(1),
          )

    let isFavorite = false
    if (userId) {
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId,
          restaurantId: restaurant.id,
        },
      })
      isFavorite = !!favorite
    }

    const data = {
      id: restaurant.id,
      name: restaurant.name,
      area: restaurant.area,
      genres: restaurant.genres.map(g => g.genre),
      hasPrivateRoom: restaurant.hasPrivateRoom,
      priceRange: restaurant.priceRange,
      address: restaurant.address ?? undefined,
      phone: restaurant.phone ?? undefined,
      url: restaurant.url ?? undefined,
      smokingAllowed: restaurant.smokingAllowed,
      coverImage: await resolveFileUrl(restaurant.coverImage),
      icon: await resolveFileUrl(restaurant.icon),
      createdBy: {
        id: restaurant.createdBy.id,
        name: restaurant.createdBy.name,
        icon: restaurant.createdBy.icon ?? undefined,
      },
      reviews: restaurant.reviews.map(r => ({
        id: r.id,
        occasion: r.occasion,
        result: r.result,
        rating: r.rating,
        author: {
          id: r.author.id,
          name: r.author.name,
          icon: r.author.icon ?? undefined,
        },
        createdAt: r.createdAt,
      })),
      isFavorite,
      reviewCount,
      averageRating,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    }

    return { success: true, data, statusCode: StatusCodes.OK }
  }

  async create(payload: CreateRestaurantInput & { genres?: Genre[] }) {
    const { genres, ...restaurantData } = payload
    const restaurant = await prisma.restaurant.create({
      data: restaurantData,
    })

    if (genres && genres.length > 0) {
      await prisma.restaurantGenre.createMany({
        data: genres.map(genre => ({ restaurantId: restaurant.id, genre })),
        skipDuplicates: true,
      })
    }

    return { success: true, data: restaurant, statusCode: StatusCodes.CREATED }
  }

  async update(
    id: string,
    companyId: string,
    payload: UpdateRestaurantInput & { genres?: Genre[] },
  ) {
    // Verify the restaurant belongs to the caller's company before updating
    const existing = await prisma.restaurant.findFirst({ where: { id, companyId } })
    if (!existing) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '飲食店が見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }

    try {
      const { genres, ...restaurantData } = payload

      // If coverImage is being changed, delete the old one from S3
      if (
        restaurantData.coverImage !== undefined &&
        existing.coverImage &&
        existing.coverImage !== restaurantData.coverImage
      ) {
        await deleteFile(existing.coverImage).catch(() => {})
      }

      const restaurant = await prisma.restaurant.update({
        where: { id },
        data: restaurantData,
      })

      if (genres && genres.length > 0) {
        await prisma.restaurantGenre.deleteMany({ where: { restaurantId: id } })
        await prisma.restaurantGenre.createMany({
          data: genres.map(genre => ({ restaurantId: id, genre })),
          skipDuplicates: true,
        })
      }
      return { success: true, data: restaurant, statusCode: StatusCodes.OK }
    } catch (error) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '飲食店が見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }
  }

  async delete(id: string, companyId: string) {
    // Fetch the restaurant first to get the cover image URL
    const existing = await prisma.restaurant.findFirst({ where: { id, companyId } })
    if (!existing) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '飲食店が見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }

    await prisma.restaurant.deleteMany({ where: { id, companyId } })

    // Delete cover image from S3 if it exists
    if (existing.coverImage) {
      await deleteFile(existing.coverImage).catch(() => {})
    }

    return {
      success: true,
      data: { message: '飲食店を削除しました' },
      statusCode: StatusCodes.OK,
    }
  }
}

export const restaurantService = new RestaurantService()
