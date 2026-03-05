import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'

export class ReviewService {
  async findAll() {
    const reviews = await prisma.review.findMany()
    return {
      success: true,
      data: reviews,
      statusCode: StatusCodes.OK,
    }
  }

  async findById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
    })
    if (!review) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'レビューが見つかりません' },
        statusCode: StatusCodes.NOT_FOUND,
      }
    }
    return { success: true, data: review, statusCode: StatusCodes.OK }
  }

  async create(reviewData: any) {
    const review = await prisma.review.create({
      data: reviewData,
    })
    return { success: true, data: review, statusCode: StatusCodes.CREATED }
  }

  async update(id: string, reviewData: Partial<any>) {
    const review = await prisma.review.update({
      where: { id },
      data: reviewData,
    })
    return { success: true, data: review, statusCode: StatusCodes.OK }
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
