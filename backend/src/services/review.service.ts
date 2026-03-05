import { StatusCodes } from 'http-status-codes'
import { prisma } from '../prisma'
import { ApiError } from '../utils/utils'

export class ReviewService {
  async findAll() {
    try {
      const reviews = await prisma.review.findMany()
      return {
        success: true,
        data: reviews,
        statusCode: StatusCodes.OK,
      }
    } catch (err) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'レビューが見つかりません')
    }
  }

  async findById(id: string) {
    try {
      const review = await prisma.review.findUnique({
        where: { id },
      })
      if (!review) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'レビューが見つかりません')
      }
      return { success: true, data: review, statusCode: StatusCodes.OK }
    } catch (err) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'レビューが見つかりません')
    }
  }

  async create(reviewData: any) {
    try {
      const review = await prisma.review.create({
        data: reviewData,
      })
      return { success: true, data: review, statusCode: StatusCodes.CREATED }
    } catch (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'レビューの作成に失敗しました')
    }
  }

  async update(id: string, reviewData: Partial<any>) {
    try {
      const review = await prisma.review.update({
        where: { id },
        data: reviewData,
      })
      return { success: true, data: review, statusCode: StatusCodes.OK }
    } catch (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'レビューの更新に失敗しました')
    }
  }

  async delete(id: string) {
    try {
      await prisma.review.delete({ where: { id } })
      return {
        success: true,
        data: { message: 'レビューを削除しました' },
        statusCode: StatusCodes.OK,
      }
    } catch (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'レビューの削除に失敗しました')
    }
  }
}

export const reviewService = new ReviewService()
