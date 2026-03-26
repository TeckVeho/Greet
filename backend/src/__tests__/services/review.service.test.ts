import { ReviewService } from '../../services/review.service'
import { prisma } from '../../prisma'
import { StatusCodes } from 'http-status-codes'

jest.mock('../../prisma', () => ({
  prisma: {
    restaurant: {
      findUnique: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockRestaurantFindUnique = prisma.restaurant.findUnique as jest.Mock
const mockReviewCreate = prisma.review.create as jest.Mock
const mockReviewFindUnique = prisma.review.findUnique as jest.Mock
const mockReviewDelete = prisma.review.delete as jest.Mock

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
      mockRestaurantFindUnique.mockResolvedValue({ id: 'rest-1', companyId: 'company-1' })
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

      const result = await service.create('rest-1', authorId, payload)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.CREATED)
      expect(result.data).toEqual({
        id: 'rev-1',
        restaurantId: 'rest-1',
        occasion: '取引先との接待',
        result: '大変好評でした。個室も広く雰囲気が良い。',
        rating: 5,
        authorId,
        author: { id: authorId, name: 'テストユーザー' },
        createdAt: new Date('2025-03-01'),
      })
    })

    it('レストランが存在しない場合NOT_FOUNDを返す', async () => {
      mockRestaurantFindUnique.mockResolvedValue(null)

      const result = await service.create('nonexistent', authorId, payload)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
      expect(result.error!.code).toBe('NOT_FOUND')
      expect(mockReviewCreate).not.toHaveBeenCalled()
    })

    it('ratingなしでレビューを投稿できる', async () => {
      mockRestaurantFindUnique.mockResolvedValue({ id: 'rest-1', companyId: 'company-1' })
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

      const result = await service.create('rest-1', authorId, {
        occasion: '会食',
        result: 'よかった',
      })

      expect(result.success).toBe(true)
      expect((result.data as any).rating).toBeUndefined()
      expect((result.data as any).author.icon).toBeUndefined()
    })

    it('レストラン検証でrestaurantIdが使われる', async () => {
      mockRestaurantFindUnique.mockResolvedValue({ id: 'rest-1', companyId: 'company-1' })
      mockReviewCreate.mockResolvedValue({
        id: 'rev-1',
        restaurantId: 'rest-1',
        authorId,
        ...payload,
        createdAt: new Date(),
        author: { id: authorId, name: 'テスト', icon: null },
      })

      await service.create('rest-1', authorId, payload)

      expect(mockRestaurantFindUnique).toHaveBeenCalledWith({
        where: { id: 'rest-1' },
      })
    })
  })

  // ─────────────────────────────────────────
  // delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    const mockReview = { id: 'rev-1', authorId: 'user-1' }

    it('レビュー投稿者が自分のレビューを削除できる', async () => {
      mockReviewFindUnique.mockResolvedValue(mockReview)
      mockReviewDelete.mockResolvedValue(mockReview)

      const result = await service.delete('rev-1', 'user-1', 'user')

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(result.data).toEqual({ message: 'レビューを削除しました' })
      expect(mockReviewDelete).toHaveBeenCalledWith({ where: { id: 'rev-1' } })
    })

    it('管理者は他人のレビューを削除できる', async () => {
      mockReviewFindUnique.mockResolvedValue(mockReview)
      mockReviewDelete.mockResolvedValue(mockReview)

      const result = await service.delete('rev-1', 'admin-user', 'admin')

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(mockReviewDelete).toHaveBeenCalledWith({ where: { id: 'rev-1' } })
    })

    it('authorIdがnullのレビューはadminのみ削除できる', async () => {
      mockReviewFindUnique.mockResolvedValue({ id: 'rev-3', authorId: null })
      mockReviewDelete.mockResolvedValue({ id: 'rev-3' })

      const result = await service.delete('rev-3', 'admin-user', 'admin')

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
    })

    it('一般ユーザーは他人のレビューを削除できない', async () => {
      mockReviewFindUnique.mockResolvedValue(mockReview)

      const result = await service.delete('rev-1', 'other-user', 'user')

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.FORBIDDEN)
      expect(result.error!.code).toBe('FORBIDDEN')
      expect(mockReviewDelete).not.toHaveBeenCalled()
    })

    it('存在しないレビューの削除でNOT_FOUNDを返す', async () => {
      mockReviewFindUnique.mockResolvedValue(null)

      const result = await service.delete('nonexistent', 'user-1', 'user')

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
      expect(mockReviewDelete).not.toHaveBeenCalled()
    })

    it('レビューがあれば投稿者は削除できる（会社に依存しない）', async () => {
      mockReviewFindUnique.mockResolvedValue({ id: 'rev-2', authorId: 'user-1' })
      mockReviewDelete.mockResolvedValue({ id: 'rev-2' })

      const result = await service.delete('rev-2', 'user-1', 'user')

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
    })
  })
})
