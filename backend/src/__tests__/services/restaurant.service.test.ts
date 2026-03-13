import { RestaurantService } from '../../services/restaurant.service'
import { prisma } from '../../prisma'
import { StatusCodes } from 'http-status-codes'

// Mock dependencies
jest.mock('../../prisma', () => ({
  prisma: {
    restaurant: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    restaurantGenre: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    favorite: {
      findFirst: jest.fn(),
    },
  },
}))

jest.mock('../../services/file.service', () => ({
  deleteFile: jest.fn().mockResolvedValue(undefined),
  resolveFileUrl: jest.fn(async (value?: string | null) => value ?? undefined),
}))

const mockRestaurantCount = prisma.restaurant.count as jest.Mock
const mockRestaurantFindMany = prisma.restaurant.findMany as jest.Mock
const mockRestaurantFindFirst = prisma.restaurant.findFirst as jest.Mock
const mockRestaurantCreate = prisma.restaurant.create as jest.Mock
const mockRestaurantUpdate = prisma.restaurant.update as jest.Mock
const mockRestaurantDeleteMany = prisma.restaurant.deleteMany as jest.Mock
const mockGenreCreateMany = prisma.restaurantGenre.createMany as jest.Mock
const mockGenreDeleteMany = prisma.restaurantGenre.deleteMany as jest.Mock
const mockFavoriteFindFirst = prisma.favorite.findFirst as jest.Mock

// ── Test data ──

const companyId = 'company-1'
const userId = 'user-1'

const mockRestaurantFromDb = {
  id: 'rest-1',
  name: '銀座 鮨処',
  area: 'GINZA',
  hasPrivateRoom: true,
  priceRange: 'RANGE_20000',
  address: '東京都中央区銀座1-1-1',
  phone: '03-1234-5678',
  url: 'https://example.com',
  smokingAllowed: false,
  coverImage: null,
  icon: '🍣',
  createdById: userId,
  companyId,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  genres: [{ genre: 'SUSHI' }],
  reviews: [
    {
      id: 'rev-1',
      occasion: '接待',
      result: '好評',
      rating: 4,
      createdAt: new Date('2025-01-02'),
      author: { id: 'author-1', name: '著者1', icon: '📝' },
    },
    {
      id: 'rev-2',
      occasion: '会食',
      result: '満足',
      rating: 5,
      createdAt: new Date('2025-01-03'),
      author: { id: 'author-2', name: '著者2', icon: null },
    },
  ],
  createdBy: { id: userId, name: 'テストユーザー', icon: '👤' },
}

const mockRestaurantDetailed = {
  ...mockRestaurantFromDb,
  reviews: [
    {
      id: 'rev-1',
      occasion: '接待',
      result: '大変好評でした',
      rating: 5,
      author: { id: 'user-2', name: 'レビュアー', icon: '📝' },
      createdAt: new Date('2025-02-01'),
    },
  ],
}

// ── Tests ──

describe('RestaurantService', () => {
  let service: RestaurantService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new RestaurantService()
  })

  // ─────────────────────────────────────────
  // findAll
  // ─────────────────────────────────────────
  describe('findAll', () => {
    it('飲食店一覧を正常に取得する', async () => {
      mockRestaurantCount.mockResolvedValue(1)
      mockRestaurantFindMany.mockResolvedValue([mockRestaurantFromDb])

      const result = await service.findAll({}, companyId)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('銀座 鮨処')
      expect(result.data[0].genres).toEqual(['SUSHI'])
      expect(result.data[0].reviewCount).toBe(2)
      expect(result.data[0].averageRating).toBe(4.5)
    })

    it('ページネーションが正しく動作する', async () => {
      mockRestaurantCount.mockResolvedValue(50)
      mockRestaurantFindMany.mockResolvedValue([])

      const result = await service.findAll({ page: 2, limit: 10 }, companyId)

      expect(result.meta.total).toBe(50)
      expect(result.meta.page).toBe(2)
      expect(result.meta.limit).toBe(10)
      expect(result.meta.totalPages).toBe(5)

      // Verify skip calculation: (page - 1) * limit = 10
      expect(mockRestaurantFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      )
    })

    it('デフォルトのページネーション値が適用される（page=1, limit=10）', async () => {
      mockRestaurantCount.mockResolvedValue(0)
      mockRestaurantFindMany.mockResolvedValue([])

      const result = await service.findAll({}, companyId)

      expect(result.meta.page).toBe(1)
      expect(result.meta.limit).toBe(10)
      expect(mockRestaurantFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      )
    })

    it('レビューがない場合、averageRatingがnullになる', async () => {
      const restaurantNoReviews = { ...mockRestaurantFromDb, reviews: [] }
      mockRestaurantCount.mockResolvedValue(1)
      mockRestaurantFindMany.mockResolvedValue([restaurantNoReviews])

      const result = await service.findAll({}, companyId)

      expect(result.data[0].reviewCount).toBe(0)
      expect(result.data[0].averageRating).toBeNull()
    })

    it('空のリストを返す場合、totalPagesが1になる', async () => {
      mockRestaurantCount.mockResolvedValue(0)
      mockRestaurantFindMany.mockResolvedValue([])

      const result = await service.findAll({}, companyId)

      expect(result.data).toHaveLength(0)
      expect(result.meta.totalPages).toBe(1)
    })

    it('companyIdで絞り込みが行われる', async () => {
      mockRestaurantCount.mockResolvedValue(0)
      mockRestaurantFindMany.mockResolvedValue([])

      await service.findAll({}, 'specific-company')

      expect(mockRestaurantCount).toHaveBeenCalledWith({
        where: {
          AND: expect.arrayContaining([{ companyId: 'specific-company' }]),
        },
      })
      expect(mockRestaurantFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([{ companyId: 'specific-company' }]),
          },
        }),
      )
    })
  })

  // ─────────────────────────────────────────
  // findById
  // ─────────────────────────────────────────
  describe('findById', () => {
    it('飲食店詳細を正常に取得する', async () => {
      mockRestaurantFindFirst.mockResolvedValue(mockRestaurantDetailed)
      mockFavoriteFindFirst.mockResolvedValue(null)

      const result = await service.findById('rest-1', companyId, userId)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(result.data!.name).toBe('銀座 鮨処')
      expect(result.data!.reviews).toHaveLength(1)
      expect(result.data!.isFavorite).toBe(false)
    })

    it('お気に入り登録済みの場合、isFavoriteがtrueになる', async () => {
      mockRestaurantFindFirst.mockResolvedValue(mockRestaurantDetailed)
      mockFavoriteFindFirst.mockResolvedValue({ id: 'fav-1', userId, restaurantId: 'rest-1' })

      const result = await service.findById('rest-1', companyId, userId)

      expect(result.data!.isFavorite).toBe(true)
    })

    it('存在しない飲食店IDでNOT_FOUNDを返す', async () => {
      mockRestaurantFindFirst.mockResolvedValue(null)

      const result = await service.findById('nonexistent', companyId)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
      expect(result.error!.code).toBe('NOT_FOUND')
    })

    it('userIdがない場合、isFavoriteがfalseになる', async () => {
      mockRestaurantFindFirst.mockResolvedValue(mockRestaurantDetailed)

      const result = await service.findById('rest-1', companyId)

      expect(result.data!.isFavorite).toBe(false)
      expect(mockFavoriteFindFirst).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────
  // create
  // ─────────────────────────────────────────
  describe('create', () => {
    const createPayload = {
      name: '新規レストラン',
      area: 'AKASAKA' as const,
      hasPrivateRoom: false,
      smokingAllowed: false,
      priceRange: 'RANGE_10000' as const,
      companyId,
      createdById: userId,
    }

    it('飲食店を正常に作成する', async () => {
      const created = { id: 'rest-new', ...createPayload, createdAt: new Date(), updatedAt: new Date() }
      mockRestaurantCreate.mockResolvedValue(created)

      const result = await service.create(createPayload)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.CREATED)
      expect(result.data.id).toBe('rest-new')
      expect(mockRestaurantCreate).toHaveBeenCalledWith({
        data: createPayload,
      })
    })

    it('ジャンル付きで飲食店を作成する', async () => {
      const payloadWithGenres = { ...createPayload, genres: ['SUSHI' as const, 'WASHOKU' as const] }
      const created = { id: 'rest-new', ...createPayload, createdAt: new Date(), updatedAt: new Date() }
      mockRestaurantCreate.mockResolvedValue(created)
      mockGenreCreateMany.mockResolvedValue({ count: 2 })

      const result = await service.create(payloadWithGenres)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.CREATED)
      expect(mockGenreCreateMany).toHaveBeenCalledWith({
        data: [
          { restaurantId: 'rest-new', genre: 'SUSHI' },
          { restaurantId: 'rest-new', genre: 'WASHOKU' },
        ],
        skipDuplicates: true,
      })
    })

    it('ジャンルなしの場合、genreのcreateは呼ばれない', async () => {
      const created = { id: 'rest-new', ...createPayload, createdAt: new Date(), updatedAt: new Date() }
      mockRestaurantCreate.mockResolvedValue(created)

      await service.create(createPayload)

      expect(mockGenreCreateMany).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────
  // update
  // ─────────────────────────────────────────
  describe('update', () => {
    const updatePayload = {
      name: '更新後レストラン',
    }

    it('飲食店を正常に更新する', async () => {
      const existing = { ...mockRestaurantFromDb, coverImage: null }
      mockRestaurantFindFirst.mockResolvedValue(existing)
      const updated = { ...existing, name: '更新後レストラン' }
      mockRestaurantUpdate.mockResolvedValue(updated)

      const result = await service.update('rest-1', companyId, updatePayload)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(mockRestaurantUpdate).toHaveBeenCalledWith({
        where: { id: 'rest-1' },
        data: updatePayload,
      })
    })

    it('存在しない飲食店の更新でNOT_FOUNDを返す', async () => {
      mockRestaurantFindFirst.mockResolvedValue(null)

      const result = await service.update('nonexistent', companyId, updatePayload)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
      expect(mockRestaurantUpdate).not.toHaveBeenCalled()
    })

    it('ジャンル付きで更新する場合、既存ジャンルを削除して再作成する', async () => {
      mockRestaurantFindFirst.mockResolvedValue(mockRestaurantFromDb)
      mockRestaurantUpdate.mockResolvedValue(mockRestaurantFromDb)
      mockGenreDeleteMany.mockResolvedValue({ count: 1 })
      mockGenreCreateMany.mockResolvedValue({ count: 2 })

      const result = await service.update('rest-1', companyId, {
        name: '更新',
        genres: ['FRENCH' as const, 'ITALIAN' as const],
      })

      expect(result.success).toBe(true)
      expect(mockGenreDeleteMany).toHaveBeenCalledWith({ where: { restaurantId: 'rest-1' } })
      expect(mockGenreCreateMany).toHaveBeenCalledWith({
        data: [
          { restaurantId: 'rest-1', genre: 'FRENCH' },
          { restaurantId: 'rest-1', genre: 'ITALIAN' },
        ],
        skipDuplicates: true,
      })
    })
  })

  // ─────────────────────────────────────────
  // delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('飲食店を正常に削除する', async () => {
      mockRestaurantFindFirst.mockResolvedValue({ ...mockRestaurantFromDb, coverImage: null })
      mockRestaurantDeleteMany.mockResolvedValue({ count: 1 })

      const result = await service.delete('rest-1', companyId)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect((result.data as { message: string }).message).toBe('飲食店を削除しました')
      expect(mockRestaurantDeleteMany).toHaveBeenCalledWith({
        where: { id: 'rest-1', companyId },
      })
    })

    it('存在しない飲食店の削除でNOT_FOUNDを返す', async () => {
      mockRestaurantFindFirst.mockResolvedValue(null)

      const result = await service.delete('nonexistent', companyId)

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND)
      expect(mockRestaurantDeleteMany).not.toHaveBeenCalled()
    })

    it('カバー画像がある場合、削除時にdeleteFileが呼ばれる', async () => {
      const { deleteFile } = require('../../services/file.service')
      mockRestaurantFindFirst.mockResolvedValue({
        ...mockRestaurantFromDb,
        coverImage: 'https://s3.example.com/image.jpg',
      })
      mockRestaurantDeleteMany.mockResolvedValue({ count: 1 })

      await service.delete('rest-1', companyId)

      expect(deleteFile).toHaveBeenCalledWith('https://s3.example.com/image.jpg')
    })
  })
})
