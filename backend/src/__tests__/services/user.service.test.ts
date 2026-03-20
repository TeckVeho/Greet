import { UserService } from '../../services/user.service'
import { prisma } from '../../prisma'
import { ApiError } from '../../utils/utils'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcrypt'

jest.mock('../../prisma', () => ({
  prisma: {
    company: {
      findUnique: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$mockedhash'),
}))

const mockUserFindMany = prisma.user.findMany as jest.Mock
const mockUserCount = prisma.user.count as jest.Mock
const mockUserFindUnique = prisma.user.findUnique as jest.Mock
const mockCompanyFindUnique = prisma.company.findUnique as jest.Mock
const mockUserCreate = prisma.user.create as jest.Mock
const mockUserUpdate = prisma.user.update as jest.Mock
const mockUserDelete = prisma.user.delete as jest.Mock

const mockCompany = { id: 'company-1', name: 'テスト会社' }

const mockUserFromDb = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '$2b$12$hashedpassword',
  name: 'テストユーザー',
  role: 'user',
  department: '営業部',
  avatar: null,
  icon: '👤',
  companyId: 'company-1',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  lastLoginAt: null,
  company: mockCompany,
}

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new UserService()
    mockCompanyFindUnique.mockResolvedValue({ id: 'company-1' })
  })

  // ─────────────────────────────────────────
  // findAll
  // ─────────────────────────────────────────
  describe('findAll', () => {
    it('ユーザー一覧を正常に取得する', async () => {
      mockUserFindMany.mockResolvedValue([mockUserFromDb])
      mockUserCount.mockResolvedValue(1)

      const result = await service.findAll({})

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].email).toBe('test@example.com')
    })

    it('ページネーションが正しく動作する', async () => {
      mockUserFindMany.mockResolvedValue([])
      mockUserCount.mockResolvedValue(25)

      const result = await service.findAll({ page: 2, limit: 10 })

      expect(result.meta.total).toBe(25)
      expect(result.meta.page).toBe(2)
      expect(result.meta.limit).toBe(10)
      expect(result.meta.totalPages).toBe(3)
      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      )
    })

    it('デフォルトのページネーション値（page=1, limit=10）', async () => {
      mockUserFindMany.mockResolvedValue([])
      mockUserCount.mockResolvedValue(0)

      const result = await service.findAll({})

      expect(result.meta.page).toBe(1)
      expect(result.meta.limit).toBe(10)
      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      )
    })

    it('companyIdで絞り込みが行われる', async () => {
      mockUserFindMany.mockResolvedValue([])
      mockUserCount.mockResolvedValue(0)

      await service.findAll({ companyId: 'company-1' })

      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { companyId: 'company-1' },
              {},
            ],
          },
        }),
      )
    })

    it('検索クエリで名前・メール・部署・会社名を検索する', async () => {
      mockUserFindMany.mockResolvedValue([])
      mockUserCount.mockResolvedValue(0)

      await service.findAll({ search: 'テスト' })

      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {},
              {
                OR: [
                  { name: { contains: 'テスト' } },
                  { email: { contains: 'テスト' } },
                  { department: { contains: 'テスト' } },
                  { company: { name: { contains: 'テスト' } } },
                ],
              },
            ],
          },
        }),
      )
    })

    it('companyIdと検索クエリを同時に使用できる', async () => {
      mockUserFindMany.mockResolvedValue([])
      mockUserCount.mockResolvedValue(0)

      await service.findAll({ companyId: 'company-1', search: '営業' })

      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { companyId: 'company-1' },
              {
                OR: expect.arrayContaining([
                  { name: { contains: '営業' } },
                ]),
              },
            ],
          },
        }),
      )
    })

    it('Prismaエラー時にApiErrorをスローする', async () => {
      mockUserFindMany.mockRejectedValue(new Error('DB connection failed'))
      mockUserCount.mockRejectedValue(new Error('DB connection failed'))

      await expect(service.findAll({})).rejects.toThrow(ApiError)
    })
  })

  // ─────────────────────────────────────────
  // findById
  // ─────────────────────────────────────────
  describe('findById', () => {
    it('ユーザーを正常に取得する', async () => {
      mockUserFindUnique.mockResolvedValue(mockUserFromDb)

      const result = await service.findById('user-1')

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(result.data).not.toHaveProperty('passwordHash')
      expect(result.data.name).toBe('テストユーザー')
    })

    it('存在しないユーザーでApiErrorをスローする', async () => {
      mockUserFindUnique.mockResolvedValue(null)

      await expect(service.findById('nonexistent')).rejects.toThrow(ApiError)
      await expect(service.findById('nonexistent')).rejects.toThrow('ユーザーが見つかりません')
    })
  })

  // ─────────────────────────────────────────
  // create
  // ─────────────────────────────────────────
  describe('create', () => {
    const createPayload = {
      name: '新規ユーザー',
      email: 'new@example.com',
      password: 'password123',
      role: 'user' as const,
      department: '開発部',
      companyId: 'company-1',
    }

    it('ユーザーを正常に作成する', async () => {
      const createdUser = {
        ...mockUserFromDb,
        id: 'user-new',
        email: createPayload.email,
        name: createPayload.name,
      }
      mockUserCreate.mockResolvedValue(createdUser)

      const result = await service.create(createPayload)

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.CREATED)
      expect(result.data).not.toHaveProperty('passwordHash')
    })

    it('パスワードがbcryptでハッシュ化される', async () => {
      mockUserCreate.mockResolvedValue(mockUserFromDb)

      await service.create(createPayload)

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: '$2b$12$mockedhash',
          }),
        }),
      )
    })

    it('リクエストbodyにpasswordHashではなくpasswordHashが保存される', async () => {
      mockUserCreate.mockResolvedValue(mockUserFromDb)

      await service.create(createPayload)

      const createCall = mockUserCreate.mock.calls[0][0]
      expect(createCall.data).not.toHaveProperty('password')
      expect(createCall.data).toHaveProperty('passwordHash')
    })

    it('作成失敗時にApiErrorをスローする', async () => {
      mockUserCreate.mockRejectedValue(new Error('duplicate email'))

      await expect(service.create(createPayload)).rejects.toThrow(ApiError)
      await expect(service.create(createPayload)).rejects.toThrow('ユーザー作成に失敗しました')
    })
  })

  // ─────────────────────────────────────────
  // update
  // ─────────────────────────────────────────
  describe('update', () => {
    it('ユーザー情報を正常に更新する', async () => {
      const updatedUser = { ...mockUserFromDb, name: '更新ユーザー' }
      mockUserFindUnique.mockResolvedValue({ companyId: 'company-1' })
      mockUserUpdate.mockResolvedValue(updatedUser)

      const result = await service.update('user-1', { name: '更新ユーザー' })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect(result.data).not.toHaveProperty('passwordHash')
    })

    it('パスワード更新時にbcryptでハッシュ化される', async () => {
      mockUserFindUnique.mockResolvedValue({ companyId: 'company-1' })
      mockUserUpdate.mockResolvedValue(mockUserFromDb)

      await service.update('user-1', { password: 'newpassword' })

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 12)
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: '$2b$12$mockedhash',
          }),
        }),
      )
    })

    it('パスワードなしの更新ではbcryptが呼ばれない', async () => {
      mockUserFindUnique.mockResolvedValue({ companyId: 'company-1' })
      mockUserUpdate.mockResolvedValue(mockUserFromDb)

      await service.update('user-1', { name: '名前のみ更新' })

      expect(bcrypt.hash).not.toHaveBeenCalled()
    })

    it('更新失敗時にApiErrorをスローする', async () => {
      mockUserUpdate.mockRejectedValue(new Error('not found'))

      await expect(service.update('nonexistent', { name: 'test' })).rejects.toThrow(ApiError)
    })
  })

  // ─────────────────────────────────────────
  // delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('ユーザーを正常に削除する', async () => {
      mockUserFindUnique.mockResolvedValue({ companyId: 'company-1', role: 'user' })
      mockUserDelete.mockResolvedValue(mockUserFromDb)

      const result = await service.delete('user-1')

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(StatusCodes.OK)
      expect((result.data as { message: string }).message).toBe('ユーザーを削除しました')
      expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    })

    it('削除失敗時にApiErrorをスローする', async () => {
      mockUserDelete.mockRejectedValue(new Error('not found'))

      await expect(service.delete('nonexistent')).rejects.toThrow(ApiError)
      await expect(service.delete('nonexistent')).rejects.toThrow('ユーザー削除に失敗しました')
    })

    it('adminは他社の一般ユーザーを削除できる', async () => {
      mockUserFindUnique.mockResolvedValue({ companyId: 'company-2', role: 'user' })
      mockUserDelete.mockResolvedValue(mockUserFromDb)

      const result = await service.delete('user-2', {
        userId: 'admin-1',
        role: 'admin',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: 'user-2' } })
    })

    it('adminはadminユーザーを削除できない', async () => {
      mockUserFindUnique.mockResolvedValue({ companyId: 'company-2', role: 'admin' })

      await expect(
        service.delete('admin-2', {
          userId: 'admin-1',
          role: 'admin',
          companyId: 'company-1',
        }),
      ).rejects.toThrow('管理者ユーザーは削除できません')
      expect(mockUserDelete).not.toHaveBeenCalled()
    })
  })
})
