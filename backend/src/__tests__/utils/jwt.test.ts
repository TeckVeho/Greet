import jwt from 'jsonwebtoken'

// Set env before importing the module under test
const TEST_SECRET = 'test-jwt-secret-key-for-unit-tests'
const TEST_EXPIRES_IN = '1h'
process.env.JWT_SECRET = TEST_SECRET
process.env.JWT_EXPIRES_IN = TEST_EXPIRES_IN

// Import AFTER setting env vars
import { signJwt, type JwtPayloadInput } from '../../utils/jwt'

describe('jwt utils', () => {
  const payload: JwtPayloadInput = {
    userId: 'user-123',
    role: 'admin' as const,
    companyId: 'company-456',
  }

  describe('signJwt', () => {
    it('有効なJWTトークンを生成する', () => {
      const token = signJwt(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      // JWT has 3 parts separated by dots
      expect(token.split('.')).toHaveLength(3)
    })

    it('生成されたトークンに正しいペイロードが含まれる', () => {
      const token = signJwt(payload)
      const decoded = jwt.verify(token, TEST_SECRET) as jwt.JwtPayload

      expect(decoded.userId).toBe('user-123')
      expect(decoded.role).toBe('admin')
      expect(decoded.companyId).toBe('company-456')
    })

    it('トークンにiat（発行時刻）が含まれる', () => {
      const token = signJwt(payload)
      const decoded = jwt.verify(token, TEST_SECRET) as jwt.JwtPayload

      expect(decoded.iat).toBeDefined()
      expect(typeof decoded.iat).toBe('number')
    })

    it('トークンにexp（有効期限）が含まれる', () => {
      const token = signJwt(payload)
      const decoded = jwt.verify(token, TEST_SECRET) as jwt.JwtPayload

      expect(decoded.exp).toBeDefined()
      expect(typeof decoded.exp).toBe('number')
      // exp should be in the future
      expect(decoded.exp!).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })

    it('不正なシークレットでトークン検証が失敗する', () => {
      const token = signJwt(payload)

      expect(() => {
        jwt.verify(token, 'wrong-secret')
      }).toThrow()
    })

    it('異なるペイロードで異なるトークンを生成する', () => {
      const token1 = signJwt(payload)
      const token2 = signJwt({
        userId: 'user-999',
        role: 'user' as const,
        companyId: 'company-789',
      })

      expect(token1).not.toBe(token2)
    })

    it('期限切れトークンの検証が失敗する', () => {
      // Create a token that's already expired using jwt.sign directly
      const expiredToken = jwt.sign(
        { ...payload, iat: Math.floor(Date.now() / 1000) - 7200 },
        TEST_SECRET,
        { expiresIn: '0s' },
      )

      expect(() => {
        jwt.verify(expiredToken, TEST_SECRET)
      }).toThrow(jwt.TokenExpiredError)
    })
  })
})
