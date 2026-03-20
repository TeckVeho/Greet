import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import type { TcreateReviewBodySchema } from '../validators/review.validator'

type CreateReviewInput = TcreateReviewBodySchema

export class ReviewService {
  async create(restaurantId: string, authorId: string, payload: CreateReviewInput) {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
    if (!restaurant) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '飲食店が見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }

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
      authorId: review.authorId,
      author: review.author
        ? {
            id: review.author.id,
            name: review.author.name,
          }
        : null,
      createdAt: review.createdAt,
    }

    return {
      success: true,
      data,
      statusCode: StatusCodes.CREATED,
    }
  }

  async delete(id: string, callerId: string, callerRole: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!review) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'レビューが見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }

    // Only the review author or an admin may delete
    if (review.authorId !== callerId && callerRole !== 'admin') {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'このレビューを削除する権限がありません' },
        statusCode: StatusCodes.FORBIDDEN,
      }
    }

    await prisma.review.delete({ where: { id } })
    return {
      success: true,
      data: { message: 'レビューを削除しました' },
      statusCode: StatusCodes.OK,
    }
  }
}

export const reviewService = new ReviewService()
