import { login, getCurrentUser } from '../../services/auth.service'
import { prisma } from '../../prisma'
import * as passwordUtils from '../../utils/password'
import * as jwtUtils from '../../utils/jwt'

// Mock dependencies
jest.mock('../../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('../../utils/password', () => ({
  comparePassword: jest.fn(),
}))

jest.mock('../../utils/jwt', () => ({
  signJwt: jest.fn(),
}))

const mockPrismaUserFindUnique = prisma.user.findUnique as jest.Mock
const mockPrismaUserUpdate = prisma.user.update as jest.Mock
const mockComparePassword = passwordUtils.comparePassword as jest.Mock
const mockSignJwt = jwtUtils.signJwt as jest.Mock

// ── Test data ──

const mockCompany = {
  id: 'company-1',
  name: 'テスト会社',
  code: 'TEST',
}

const mockUserFromDb = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '$2b$12$hashedpassword',
  name: 'テストユーザー',
  role: 'user' as const,
  department: '営業部',
  avatar: null,
  icon: '👤',
  companyId: 'company-1',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  lastLoginAt: null,
  company: mockCompany,
}

const mockUserWithoutPassword = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'テストユーザー',
  role: 'user' as const,
  department: '営業部',
  avatar: null,
  icon: '👤',
  companyId: 'company-1',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  lastLoginAt: null,
  company: mockCompany,
}

// ── Tests ──

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────
  // login() - success / failure
  // ─────────────────────────────────────────
  describe('login', () => {
    it('ログイン成功: 正しいメール・パスワードでトークンとユーザー情報を返す', async () => {
      mockPrismaUserFindUnique.mockResolvedValue(mockUserFromDb)
      mockComparePassword.mockResolvedValue(true)
      mockPrismaUserUpdate.mockResolvedValue(mockUserFromDb)
      mockSignJwt.mockReturnValue('mock-jwt-token')

      const result = await login('test@example.com', 'correct-password')

      expect(result).not.toBeNull()
      expect(result!.token).toBe('mock-jwt-token')
      expect(result!.user).toEqual(mockUserWithoutPassword)
      expect(result!.user).not.toHaveProperty('passwordHash')

      // Verify the correct calls
      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          company: {
            select: { id: true, name: true, code: true },
          },
        },
      })
      expect(mockComparePassword).toHaveBeenCalledWith('correct-password', mockUserFromDb.passwordHash)
      expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { lastLoginAt: expect.any(Date) },
      })
      expect(mockSignJwt).toHaveBeenCalledWith({
        userId: 'user-1',
        role: 'user',
        companyId: 'company-1',
      })
    })

    it('ログイン失敗: 存在しないメールアドレスでnullを返す', async () => {
      mockPrismaUserFindUnique.mockResolvedValue(null)

      const result = await login('nonexistent@example.com', 'password')

      expect(result).toBeNull()
      expect(mockComparePassword).not.toHaveBeenCalled()
      expect(mockSignJwt).not.toHaveBeenCalled()
      expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
    })

    it('ログイン失敗: パスワード不一致でnullを返す', async () => {
      mockPrismaUserFindUnique.mockResolvedValue(mockUserFromDb)
      mockComparePassword.mockResolvedValue(false)

      const result = await login('test@example.com', 'wrong-password')

      expect(result).toBeNull()
      expect(mockComparePassword).toHaveBeenCalledWith('wrong-password', mockUserFromDb.passwordHash)
      expect(mockSignJwt).not.toHaveBeenCalled()
      expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
    })

    it('ログイン成功時にlastLoginAtが更新される', async () => {
      mockPrismaUserFindUnique.mockResolvedValue(mockUserFromDb)
      mockComparePassword.mockResolvedValue(true)
      mockPrismaUserUpdate.mockResolvedValue(mockUserFromDb)
      mockSignJwt.mockReturnValue('token')

      await login('test@example.com', 'correct-password')

      expect(mockPrismaUserUpdate).toHaveBeenCalledTimes(1)
      const updateCall = mockPrismaUserUpdate.mock.calls[0][0]
      expect(updateCall.data.lastLoginAt).toBeInstanceOf(Date)
    })

    it('ログイン成功時にJWTペイロードにuserId, role, companyIdが含まれる', async () => {
      mockPrismaUserFindUnique.mockResolvedValue(mockUserFromDb)
      mockComparePassword.mockResolvedValue(true)
      mockPrismaUserUpdate.mockResolvedValue(mockUserFromDb)
      mockSignJwt.mockReturnValue('token')

      await login('test@example.com', 'password')

      expect(mockSignJwt).toHaveBeenCalledWith({
        userId: mockUserFromDb.id,
        role: mockUserFromDb.role,
        companyId: mockUserFromDb.companyId,
      })
    })
  })

  // ─────────────────────────────────────────
  // getCurrentUser()
  // ─────────────────────────────────────────
  describe('getCurrentUser', () => {
    it('ユーザーが存在する場合、passwordHashを除外して返す', async () => {
      mockPrismaUserFindUnique.mockResolvedValue(mockUserFromDb)

      const result = await getCurrentUser('user-1')

      expect(result).toEqual(mockUserWithoutPassword)
      expect(result).not.toHaveProperty('passwordHash')
      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          company: {
            select: { id: true, name: true, code: true },
          },
        },
      })
    })

    it('ユーザーが存在しない場合、nullを返す', async () => {
      mockPrismaUserFindUnique.mockResolvedValue(null)

      const result = await getCurrentUser('nonexistent-id')

      expect(result).toBeNull()
    })
  })
})
