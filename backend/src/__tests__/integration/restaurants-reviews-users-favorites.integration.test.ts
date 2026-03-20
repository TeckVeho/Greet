/**
 * Integration Tests: IT #4 – #13
 *
 * Covers:
 *   IT #4  GET  /restaurants           一覧取得
 *   IT #5  GET  /restaurants?…         フィルタリング
 *   IT #6  POST /restaurants           登録成功
 *   IT #7  POST /restaurants           バリデーションエラー
 *   IT #8  PUT  /restaurants/:id       更新成功
 *   IT #9  DELETE /restaurants/:id     admin のみ
 *   IT #10 POST /restaurants/:id/reviews  投稿成功
 *   IT #11 GET  /users                 admin のみアクセス可
 *   IT #12 POST /users                 ユーザー登録
 *   IT #13 GET/POST/DELETE /favorites  お気に入り追加・削除・一覧
 *
 * Strategy:
 *   - Real Express routers + middleware (auth, admin, validate)
 *   - Service layer is mocked entirely — no DB connection required
 *   - JWT tokens are signed with the fixed test secret set in src/__tests__/setup.ts
 */

import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

import { restaurantRouter } from '../../routes/restaurant'
import { userRouter } from '../../routes/user'
import { favoriteRouter } from '../../routes/favorites'

import { restaurantService } from '../../services/restaurant.service'
import { reviewService } from '../../services/review.service'
import { userService } from '../../services/user.service'
import { favoriteService } from '../../services/favorite.service'

// ---------------------------------------------------------------------------
// Module mocks (hoisted by Jest — must reference only literals / jest.fn())
// ---------------------------------------------------------------------------

jest.mock('../../services/restaurant.service', () => ({
  restaurantService: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('../../services/review.service', () => ({
  reviewService: {
    create: jest.fn(),
  },
}))

jest.mock('../../services/user.service', () => ({
  userService: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('../../services/favorite.service', () => ({
  favoriteService: {
    listForUser: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Typed references to mock functions
// ---------------------------------------------------------------------------

const mockRsFindAll = restaurantService.findAll as jest.Mock
const mockRsCreate = restaurantService.create as jest.Mock
const mockRsUpdate = restaurantService.update as jest.Mock
const mockRsDelete = restaurantService.delete as jest.Mock

const mockRvCreate = reviewService.create as jest.Mock

const mockUsFindAll = userService.findAll as jest.Mock
const mockUsCreate = userService.create as jest.Mock

const mockFavList = favoriteService.listForUser as jest.Mock
const mockFavAdd = favoriteService.add as jest.Mock
const mockFavRemove = favoriteService.remove as jest.Mock

// ---------------------------------------------------------------------------
// Shared constants & helpers
// ---------------------------------------------------------------------------

const TEST_SECRET = 'test-jwt-secret'
const VALID_UUID = '11111111-1111-4111-8111-111111111111'

function makeToken(role: 'user' | 'admin' = 'user') {
  return jwt.sign(
    { userId: 'user-1', role, companyId: 'company-1' },
    TEST_SECRET,
    { expiresIn: '1h' },
  )
}

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/restaurants', restaurantRouter)
  app.use('/api/users', userRouter)
  app.use('/api/favorites', favoriteRouter)
  return app
}

/** Minimal restaurant DTO returned by the (mocked) service */
const mockRestaurant = {
  id: VALID_UUID,
  name: 'テストレストラン',
  area: 'GINZA',
  genres: ['SUSHI'],
  hasPrivateRoom: false,
  smokingAllowed: false,
  priceRange: 'RANGE_10000',
  reviewCount: 0,
  reviews: [],
  averageRating: null,
  createdBy: { id: 'user-1', name: '管理者', icon: '👤' },
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
}

// ---------------------------------------------------------------------------
// IT #4 – #9  Restaurant CRUD
// ---------------------------------------------------------------------------

describe('Integration: restaurants CRUD (IT #4-9)', () => {
  let app: ReturnType<typeof createTestApp>

  beforeEach(() => {
    app = createTestApp()
  })

  // IT #4 ─────────────────────────────────────────────────────────────────
  it('IT #4 GET /restaurants - 一覧取得', async () => {
    mockRsFindAll.mockResolvedValue({
      success: true,
      data: [mockRestaurant],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      statusCode: 200,
    })

    const res = await request(app)
      .get('/api/restaurants')
      .set('Authorization', `Bearer ${makeToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.meta.total).toBe(1)
    expect(mockRsFindAll).toHaveBeenCalledWith(expect.any(Object))
  })

  // IT #5 ─────────────────────────────────────────────────────────────────
  it('IT #5 GET /restaurants - フィルタリング', async () => {
    mockRsFindAll.mockResolvedValue({
      success: true,
      data: [mockRestaurant],
      meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
      statusCode: 200,
    })

    const res = await request(app)
      .get('/api/restaurants?search=%E3%83%86%E3%82%B9%E3%83%88&limit=5')
      .set('Authorization', `Bearer ${makeToken()}`)

    expect(res.status).toBe(200)
    expect(mockRsFindAll).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'テスト', limit: '5' }),
    )
  })

  // IT #6 ─────────────────────────────────────────────────────────────────
  it('IT #6 POST /restaurants - 登録成功', async () => {
    mockRsCreate.mockResolvedValue({
      success: true,
      data: { ...mockRestaurant, id: 'new-rest-1' },
      statusCode: 201,
    })

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        name: 'New Restaurant',
        area: 'GINZA',
        genres: ['SUSHI'],
        hasPrivateRoom: false,
        smokingAllowed: false,
        priceRange: 'RANGE_10000',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe('new-rest-1')
    expect(mockRsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Restaurant',
        companyId: 'company-1',
        createdById: 'user-1',
      }),
    )
  })

  // IT #7 ─────────────────────────────────────────────────────────────────
  it('IT #7 POST /restaurants - バリデーションエラー', async () => {
    // name is too short (1 char), area/priceRange/booleans missing
    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'X' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockRsCreate).not.toHaveBeenCalled()
  })

  // IT #8 ─────────────────────────────────────────────────────────────────
  it('IT #8 PUT /restaurants/:id - 更新成功', async () => {
    mockRsUpdate.mockResolvedValue({
      success: true,
      data: { ...mockRestaurant, name: 'Updated Name' },
      statusCode: 200,
    })

    const res = await request(app)
      .put(`/api/restaurants/${VALID_UUID}`)
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Updated Name' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Updated Name')
    expect(mockRsUpdate).toHaveBeenCalledWith(
      VALID_UUID,
      expect.objectContaining({ name: 'Updated Name' }),
      'user-1',
      'user',
    )
  })

  // IT #9a ─────────────────────────────────────────────────────────────────
  it('IT #9 DELETE /restaurants/:id - admin は成功', async () => {
    mockRsDelete.mockResolvedValue({
      success: true,
      data: { message: '飲食店を削除しました' },
      statusCode: 200,
    })

    const res = await request(app)
      .delete(`/api/restaurants/${VALID_UUID}`)
      .set('Authorization', `Bearer ${makeToken('admin')}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockRsDelete).toHaveBeenCalledWith(VALID_UUID)
  })

  // IT #9b ─────────────────────────────────────────────────────────────────
  it('IT #9 DELETE /restaurants/:id - 非admin は 403', async () => {
    const res = await request(app)
      .delete(`/api/restaurants/${VALID_UUID}`)
      .set('Authorization', `Bearer ${makeToken('user')}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockRsDelete).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// IT #10  Restaurant reviews
// ---------------------------------------------------------------------------

describe('Integration: restaurant reviews (IT #10)', () => {
  let app: ReturnType<typeof createTestApp>

  beforeEach(() => {
    app = createTestApp()
  })

  it('IT #10 POST /restaurants/:id/reviews - 投稿成功', async () => {
    mockRvCreate.mockResolvedValue({
      success: true,
      data: {
        id: 'review-1',
        restaurantId: VALID_UUID,
        occasion: '接待',
        result: '美味しかった',
        rating: 5,
        author: { id: 'user-1', name: '管理者', icon: '👤' },
        createdAt: new Date().toISOString(),
      },
      statusCode: 201,
    })

    const res = await request(app)
      .post(`/api/restaurants/${VALID_UUID}/reviews`)
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ occasion: '接待', result: '美味しかった', rating: 5 })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe('review-1')
    expect(mockRvCreate).toHaveBeenCalledWith(
      VALID_UUID,
      'user-1',
      expect.objectContaining({ occasion: '接待', result: '美味しかった', rating: 5 }),
    )
  })
})

// ---------------------------------------------------------------------------
// IT #11 – #12  Users
// ---------------------------------------------------------------------------

describe('Integration: users (IT #11-12)', () => {
  let app: ReturnType<typeof createTestApp>

  beforeEach(() => {
    app = createTestApp()
  })

  // IT #11a ─────────────────────────────────────────────────────────────
  it('IT #11 GET /users - admin はアクセス可 (200)', async () => {
    mockUsFindAll.mockResolvedValue({
      success: true,
      data: [],
      meta: { total: 0, page: 1, limit: 10, total_pages: 0 },
      statusCode: 200,
    })

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockUsFindAll).toHaveBeenCalled()
  })

  // IT #11b ─────────────────────────────────────────────────────────────
  it('IT #11 GET /users - 非admin は 403', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${makeToken('user')}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockUsFindAll).not.toHaveBeenCalled()
  })

  // IT #12 ─────────────────────────────────────────────────────────────
  it('IT #12 POST /users - admin がユーザー登録 (201)', async () => {
    mockUsCreate.mockResolvedValue({
      success: true,
      data: {
        id: 'new-user-1',
        name: '新規ユーザー',
        email: 'newuser@example.com',
        role: 'user',
        department: '営業部',
        avatar: null,
        icon: '👤',
        companyId: 'company-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null,
        company: { id: 'company-1', name: 'Test Company' },
      },
      statusCode: 201,
    })

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({
        name: '新規ユーザー',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user',
        companyId: '22222222-2222-4222-8222-222222222222',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(mockUsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '新規ユーザー',
        email: 'newuser@example.com',
        companyId: '22222222-2222-4222-8222-222222222222',
      }),
    )
  })
})

// ---------------------------------------------------------------------------
// IT #13  Favorites
// ---------------------------------------------------------------------------

describe('Integration: favorites (IT #13)', () => {
  let app: ReturnType<typeof createTestApp>

  beforeEach(() => {
    app = createTestApp()
  })

  it('IT #13 GET /favorites - 一覧取得', async () => {
    mockFavList.mockResolvedValue({
      success: true,
      data: [],
      statusCode: 200,
    })

    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${makeToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockFavList).toHaveBeenCalledWith(expect.any(Object), 'user-1')
  })

  it('IT #13 POST /favorites - お気に入り追加 (201)', async () => {
    mockFavAdd.mockResolvedValue({
      success: true,
      data: { id: 'fav-1', restaurantId: VALID_UUID, userId: 'user-1' },
      statusCode: 201,
    })

    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ restaurantId: VALID_UUID })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(mockFavAdd).toHaveBeenCalledWith('user-1', VALID_UUID)
  })

  it('IT #13 DELETE /favorites/:restaurantId - お気に入り削除 (200)', async () => {
    mockFavRemove.mockResolvedValue({
      success: true,
      data: { message: 'お気に入りを削除しました' },
      statusCode: 200,
    })

    const res = await request(app)
      .delete(`/api/favorites/${VALID_UUID}`)
      .set('Authorization', `Bearer ${makeToken()}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockFavRemove).toHaveBeenCalledWith('user-1', VALID_UUID)
  })
})
