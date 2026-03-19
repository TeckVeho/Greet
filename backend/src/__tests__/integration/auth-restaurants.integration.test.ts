import express from 'express'
import request from 'supertest'
import { authRouter } from '../../routes/auth'
import { authMiddleware } from '../../middleware/auth.middleware'

const mockLogin = jest.fn()

jest.mock('../../services', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  getCurrentUser: jest.fn(),
}))

describe('Integration: auth and restaurants access control', () => {
  function createTestApp() {
    const app = express()
    app.use(express.json())

    app.use('/api/auth', authRouter)

    // Keep this endpoint contract aligned with production route behavior:
    // auth middleware runs first and must reject unauthenticated requests.
    app.get('/api/restaurants', authMiddleware, (_req, res) => {
      res.status(200).json({ success: true, data: [] })
    })

    return app
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret'
  })

  it('POST /auth/login - 正常ログイン', async () => {
    const app = createTestApp()

    mockLogin.mockResolvedValue({
      token: 'mock-token',
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        name: '管理者',
        role: 'admin',
        department: '総務',
        avatar: null,
        icon: '👤',
        companyId: 'company-1',
        createdAt: new Date('2026-03-12'),
        updatedAt: new Date('2026-03-12'),
        lastLoginAt: null,
        company: {
          id: 'company-1',
          name: 'Test Company',
          code: 'TEST',
        },
      },
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBe('mock-token')
    expect(res.body.data.user.email).toBe('admin@example.com')
    expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'password123')
  })

  it('POST /auth/login - 誤パスワード', async () => {
    const app = createTestApp()

    mockLogin.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong-password' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
    expect(res.body.error.message).toBe('メールアドレスまたはパスワードが正しくありません')
    expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'wrong-password')
  })

  it('GET /restaurants - 認証なしで 401', async () => {
    const app = createTestApp()

    const res = await request(app).get('/api/restaurants')

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
    expect(res.body.error.message).toBe('認証トークンがありません')
  })
})
