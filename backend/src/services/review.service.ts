import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import type { TcreateReviewBodySchema } from '../validators/review.validator'

type CreateReviewInput = TcreateReviewBodySchema

export class ReviewService {
  async create(restaurantId: string, authorId: string, payload: CreateReviewInput) {
    const review = await prisma.review.create({
      data: {
        restaurantId,
        authorId,
        occasion: payload.occasion,
        result: payload.result,
        rating: payload.rating,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    const data = {
      id: review.id,
      restaurantId: review.restaurantId,
      occasion: review.occasion,
      result: review.result,
      rating: review.rating,
      author: {
        id: review.author.id,
        name: review.author.name,
        icon: review.author.icon ?? undefined,
      },
      createdAt: review.createdAt,
    }

    return {
      success: true,
      data,
      statusCode: StatusCodes.CREATED,
    }
  }

  async delete(id: string) {
    await prisma.review.delete({ where: { id } })
    return {
      success: true,
      data: { message: 'レビューを削除しました' },
      statusCode: StatusCodes.OK,
    }
  }
}

export const reviewService = new ReviewService()
