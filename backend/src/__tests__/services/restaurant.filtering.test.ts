import { prisma } from '../../prisma'
import { RestaurantService } from '../../services/restaurant.service'

/**
 * restaurant.service.ts - フィルタリング（データ変換・集計ロジック）
 *
 * findAll のレスポンス変換、averageRating 計算、
 * null→undefined 変換、複数ジャンルのマッピング等をテスト。
 */

jest.mock('../../prisma', () => ({
  prisma: {
    restaurant: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    favorite: {
      findFirst: jest.fn(),
    },
  },
}))

const mockCount = prisma.restaurant.count as jest.Mock
const mockFindMany = prisma.restaurant.findMany as jest.Mock
const mockFindFirst = prisma.restaurant.findFirst as jest.Mock
const mockFavoriteFindFirst = prisma.favorite.findFirst as jest.Mock

const companyId = 'company-1'

function makeRestaurant(overrides: Record<string, unknown> = {}) {
  const restaurant = {
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
    createdById: 'user-1',
    companyId,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    genres: [{ genre: 'SUSHI' }],
    reviews: [{ rating: 4 }, { rating: 5 }],
    createdBy: { id: 'user-1', name: 'テストユーザー', icon: '👤' },
    ...overrides,
  }

  return {
    ...restaurant,
    reviews: (restaurant.reviews as Array<Record<string, unknown>>).map((review, index) => ({
      id: (review.id as string | undefined) ?? `review-${index + 1}`,
      occasion: (review.occasion as string | undefined) ?? '接待',
      result: (review.result as string | undefined) ?? '好評',
      rating: review.rating as number | null | undefined,
      createdAt: (review.createdAt as Date | undefined) ?? new Date('2025-02-01'),
      author: (review.author as { id: string; name: string; icon?: string | null } | undefined) ?? {
        id: `author-${index + 1}`,
        name: `著者${index + 1}`,
        icon: null,
      },
    })),
  }
}

describe('RestaurantService - フィルタリング', () => {
  let service: RestaurantService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new RestaurantService()
  })

  // ─────────────────────────────────────────
  // averageRating 計算ロジック
  // ─────────────────────────────────────────
  describe('averageRating計算', () => {
    it('複数レビューの平均値を小数点1桁で返す', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([
        makeRestaurant({ reviews: [{ rating: 3 }, { rating: 4 }, { rating: 5 }] }),
      ])

      const result = await service.findAll({})
      // (3 + 4 + 5) / 3 = 4.0
      expect(result.data[0].averageRating).toBe(4)
      expect(result.data[0].reviewCount).toBe(3)
    })

    it('小数点が出る平均値を正しく1桁に丸める', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([makeRestaurant({ reviews: [{ rating: 3 }, { rating: 5 }] })])

      const result = await service.findAll({})
      // (3 + 5) / 2 = 4.0
      expect(result.data[0].averageRating).toBe(4)
    })

    it('rating: 1と2のレビューで平均1.5を返す', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([makeRestaurant({ reviews: [{ rating: 1 }, { rating: 2 }] })])

      const result = await service.findAll({})
      expect(result.data[0].averageRating).toBe(1.5)
    })

    it('ratingがnullのレビューは0として計算される', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([
        makeRestaurant({ reviews: [{ rating: null }, { rating: 4 }] }),
      ])

      const result = await service.findAll({})
      // (0 + 4) / 2 = 2.0
      expect(result.data[0].averageRating).toBe(2)
      expect(result.data[0].reviewCount).toBe(2)
    })

    it('レビューが0件の場合、averageRatingがnullになる', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([makeRestaurant({ reviews: [] })])

      const result = await service.findAll({})
      expect(result.data[0].averageRating).toBeNull()
      expect(result.data[0].reviewCount).toBe(0)
    })
  })

  // ─────────────────────────────────────────
  // null → undefined 変換
  // ─────────────────────────────────────────
  describe('null→undefined変換', () => {
    it('nullフィールドがundefinedに変換される', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([
        makeRestaurant({
          address: null,
          phone: null,
          url: null,
          coverImage: null,
          icon: null,
        }),
      ])

      const result = await service.findAll({})
      const item = result.data[0]

      expect(item.address).toBeUndefined()
      expect(item.phone).toBeUndefined()
      expect(item.url).toBeUndefined()
      expect(item.coverImage).toBeUndefined()
      expect(item.icon).toBeUndefined()
    })

    it('値が存在するフィールドはそのまま返す', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([
        makeRestaurant({
          address: '東京都中央区',
          phone: '03-0000-0000',
          url: 'https://test.com',
          coverImage: 'https://img.example.com/photo.jpg',
          icon: '🍜',
        }),
      ])

      const result = await service.findAll({})
      const item = result.data[0]

      expect(item.address).toBe('東京都中央区')
      expect(item.phone).toBe('03-0000-0000')
      expect(item.url).toBe('https://test.com')
      expect(item.coverImage).toBe('https://img.example.com/photo.jpg')
      expect(item.icon).toBe('🍜')
    })
  })

  // ─────────────────────────────────────────
  // ジャンルマッピング
  // ─────────────────────────────────────────
  describe('ジャンルマッピング', () => {
    it('複数ジャンルが正しくマッピングされる', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([
        makeRestaurant({
          genres: [{ genre: 'SUSHI' }, { genre: 'WASHOKU' }, { genre: 'KAPPO' }],
        }),
      ])

      const result = await service.findAll({})
      expect(result.data[0].genres).toEqual(['SUSHI', 'WASHOKU', 'KAPPO'])
    })

    it('ジャンルが空配列の場合、空配列を返す', async () => {
      mockCount.mockResolvedValue(1)
      mockFindMany.mockResolvedValue([makeRestaurant({ genres: [] })])

      const result = await service.findAll({})
      expect(result.data[0].genres).toEqual([])
    })
  })

  // ─────────────────────────────────────────
  // 複数レストランの一覧ソート・構造
  // ─────────────────────────────────────────
  describe('複数レストランの変換', () => {
    it('複数レストランがそれぞれ正しく変換される', async () => {
      const rest1 = makeRestaurant({
        id: 'rest-1',
        name: '寿司A',
        reviews: [{ rating: 5 }],
        genres: [{ genre: 'SUSHI' }],
      })
      const rest2 = makeRestaurant({
        id: 'rest-2',
        name: 'フレンチB',
        reviews: [{ rating: 3 }, { rating: 4 }],
        genres: [{ genre: 'FRENCH' }],
      })

      mockCount.mockResolvedValue(2)
      mockFindMany.mockResolvedValue([rest1, rest2])

      const result = await service.findAll({})

      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('寿司A')
      expect(result.data[0].averageRating).toBe(5)
      expect(result.data[1].name).toBe('フレンチB')
      expect(result.data[1].averageRating).toBe(3.5)
    })

    it('createdAtでの降順ソートがPrismaに渡される', async () => {
      mockCount.mockResolvedValue(0)
      mockFindMany.mockResolvedValue([])

      await service.findAll({})

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      )
    })
  })

  // ─────────────────────────────────────────
  // findById のレスポンス変換
  // ─────────────────────────────────────────
  describe('findById レスポンス変換', () => {
    const detailedRestaurant = {
      ...makeRestaurant(),
      reviews: [
        {
          id: 'rev-1',
          occasion: '取引先接待',
          result: '大変好評',
          rating: 5,
          author: { id: 'user-2', name: 'レビュアー', icon: null },
          createdAt: new Date('2025-02-01'),
        },
        {
          id: 'rev-2',
          occasion: '社内会食',
          result: '普通',
          rating: 3,
          author: { id: 'user-3', name: '別のレビュアー', icon: '📝' },
          createdAt: new Date('2025-03-01'),
        },
      ],
    }

    it('レビュー情報が正しい形式で返される', async () => {
      mockFindFirst.mockResolvedValue(detailedRestaurant)
      mockFavoriteFindFirst.mockResolvedValue(null)

      const result = await service.findById('rest-1')

      expect(result.data!.reviews).toHaveLength(2)
      expect(result.data!.reviews[0]).toEqual({
        id: 'rev-1',
        occasion: '取引先接待',
        result: '大変好評',
        rating: 5,
        author: { id: 'user-2', name: 'レビュアー', icon: undefined },
        createdAt: new Date('2025-02-01'),
      })
    })

    it('findByIdのaverageRatingが正しく計算される', async () => {
      mockFindFirst.mockResolvedValue(detailedRestaurant)
      mockFavoriteFindFirst.mockResolvedValue(null)

      const result = await service.findById('rest-1')

      // (5 + 3) / 2 = 4.0
      expect(result.data!.averageRating).toBe(4)
      expect(result.data!.reviewCount).toBe(2)
    })
  })
})
