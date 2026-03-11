import { ReviewService } from '../../services/review.service'
import { prisma } from '../../prisma'
import { StatusCodes } from 'http-status-codes'

jest.mock('../../prisma', () => ({
  prisma: {
    restaurant: {
      findFirst: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockRestaurantFindFirst = prisma.restaurant.findFirst as jest.Mock
const mockReviewCreate = prisma.review.create as jest.Mock
const mockReviewFindUnique = prisma.review.findUnique as jest.Mock
const mockReviewDelete = prisma.review.delete as jest.Mock

const companyId = 'company-1'
const authorId = 'user-1'

describe('ReviewService', () => {
  let service: ReviewService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ReviewService()
  })

  // ─────────────────────────────────────────
  // create
  // ─────────────────────────────────────────
  describe('create', () => {
    const payload = {
      occasion: '取引先との接待',
      result: '大変好評でした。個室も広く雰囲気が良い。',
      rating: 5,
    }

    it('レビューを正常に投稿する', async () => {
      mockRestaurantFindFirst.mockResolvedValue({ id: 'rest-1', companyId })
      mockReviewCreate.mockResolvedValue({
        id: 'rev-1',
        restaurantId: 'rest-1',
        authorId,
        occasion: payload.occasion,
        result: payload.result,
        rating: payload.rating,
        createdAt: new Date('2025-03-01'),
        author: { id: authorId, name: 'テストユーザー', icon: '👤' },
      })

      const result = await service.create('rest-1', authorId, companyId, payload)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.CREATED)
      expect(result.data).toEqual({
        id: 'rev-1',
        restaurantId: 'rest-1',
        occasion: '取引先との接待',
        result: '大変好評でした。個室も広く雰囲気が良い。',
        rating: 5,
        author: { id: authorId, name: 'テストユーザー', icon: '👤' },
        createdAt: new Date('2025-03-01'),
      })
    })

    it('レストランが存在しない場合NOT_FOUNDを返す', async () => {
      mockRestaurantFindFirst.mockResolvedValue(null)

      const result = await service.create('nonexistent', authorId, companyId, payload)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
      expect(result.error!.code).toBe('NOT_FOUND')
      expect(mockReviewCreate).not.toHaveBeenCalled()
    })

    it('他社の飲食店にはレビューを投稿できない', async () => {
      // findFirst returns null because companyId doesn't match
      mockRestaurantFindFirst.mockResolvedValue(null)

      const result = await service.create('rest-1', authorId, 'other-company', payload)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
    })

    it('ratingなしでレビューを投稿できる', async () => {
      mockRestaurantFindFirst.mockResolvedValue({ id: 'rest-1', companyId })
      mockReviewCreate.mockResolvedValue({
        id: 'rev-2',
        restaurantId: 'rest-1',
        authorId,
        occasion: '会食',
        result: 'よかった',
        rating: undefined,
        createdAt: new Date('2025-03-01'),
        author: { id: authorId, name: 'テストユーザー', icon: null },
      })

      const result = await service.create('rest-1', authorId, companyId, {
        occasion: '会食',
        result: 'よかった',
      })

      expect(result.success).toBe(true)
      expect((result.data as any).rating).toBeUndefined()
      expect((result.data as any).author.icon).toBeUndefined()
    })

    it('レストラン検証でcompanyIdが使われる', async () => {
      mockRestaurantFindFirst.mockResolvedValue({ id: 'rest-1', companyId })
      mockReviewCreate.mockResolvedValue({
        id: 'rev-1',
        restaurantId: 'rest-1',
        authorId,
        ...payload,
        createdAt: new Date(),
        author: { id: authorId, name: 'テスト', icon: null },
      })

      await service.create('rest-1', authorId, companyId, payload)

      expect(mockRestaurantFindFirst).toHaveBeenCalledWith({
        where: { id: 'rest-1', companyId },
      })
    })
  })

  // ─────────────────────────────────────────
  // delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    const mockReview = {
      id: 'rev-1',
      authorId: 'user-1',
      restaurant: { companyId },
    }

    it('レビュー投稿者が自分のレビューを削除できる', async () => {
      mockReviewFindUnique.mockResolvedValue(mockReview)
      mockReviewDelete.mockResolvedValue(mockReview)

      const result = await service.delete('rev-1', 'user-1', 'user', companyId)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(result.data).toEqual({ message: 'レビューを削除しました' })
      expect(mockReviewDelete).toHaveBeenCalledWith({ where: { id: 'rev-1' } })
    })

    it('管理者は他人のレビューを削除できる', async () => {
      mockReviewFindUnique.mockResolvedValue(mockReview)
      mockReviewDelete.mockResolvedValue(mockReview)

      const result = await service.delete('rev-1', 'admin-user', 'admin', companyId)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(mockReviewDelete).toHaveBeenCalledWith({ where: { id: 'rev-1' } })
    })

    it('一般ユーザーは他人のレビューを削除できない', async () => {
      mockReviewFindUnique.mockResolvedValue(mockReview)

      const result = await service.delete('rev-1', 'other-user', 'user', companyId)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.FORBIDDEN)
      expect(result.error!.code).toBe('FORBIDDEN')
      expect(mockReviewDelete).not.toHaveBeenCalled()
    })

    it('存在しないレビューの削除でNOT_FOUNDを返す', async () => {
      mockReviewFindUnique.mockResolvedValue(null)

      const result = await service.delete('nonexistent', 'user-1', 'user', companyId)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
      expect(mockReviewDelete).not.toHaveBeenCalled()
    })

    it('他社のレビューは削除できない（テナント分離）', async () => {
      mockReviewFindUnique.mockResolvedValue({
        id: 'rev-1',
        authorId: 'user-1',
        restaurant: { companyId: 'other-company' },
      })

      const result = await service.delete('rev-1', 'user-1', 'user', companyId)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
      expect(mockReviewDelete).not.toHaveBeenCalled()
    })
  })
})
