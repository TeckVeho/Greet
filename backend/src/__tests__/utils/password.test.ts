import { hashPassword, comparePassword } from '../../utils/password'

describe('password utils', () => {
  describe('hashPassword', () => {
    it('平文パスワードをハッシュ化する', async () => {
      const hash = await hashPassword('password123')

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).not.toBe('password123')
    })

    it('ハッシュがbcrypt形式である（$2b$で始まる）', async () => {
      const hash = await hashPassword('testpass')

      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/)
    })

    it('同じパスワードでも異なるハッシュが生成される（ソルト）', async () => {
      const hash1 = await hashPassword('samepassword')
      const hash2 = await hashPassword('samepassword')

      expect(hash1).not.toBe(hash2)
    })

    it('空文字列もハッシュ化できる', async () => {
      const hash = await hashPassword('')

      expect(hash).toBeDefined()
      expect(hash.length).toBeGreaterThan(0)
    })
  })

  describe('comparePassword', () => {
    it('正しいパスワードでtrueを返す', async () => {
      const hash = await hashPassword('correct-password')
      const result = await comparePassword('correct-password', hash)

      expect(result).toBe(true)
    })

    it('間違ったパスワードでfalseを返す', async () => {
      const hash = await hashPassword('correct-password')
      const result = await comparePassword('wrong-password', hash)

      expect(result).toBe(false)
    })

    it('大文字・小文字を区別する', async () => {
      const hash = await hashPassword('Password')
      const result = await comparePassword('password', hash)

      expect(result).toBe(false)
    })

    it('日本語パスワードも正しく比較できる', async () => {
      const hash = await hashPassword('パスワード123')
      
      const resultCorrect = await comparePassword('パスワード123', hash)
      expect(resultCorrect).toBe(true)

      const resultWrong = await comparePassword('パスワード456', hash)
      expect(resultWrong).toBe(false)
    })

    it('長いパスワードも正しく処理される', async () => {
      const longPassword = 'a'.repeat(72) // bcrypt's max effective length
      const hash = await hashPassword(longPassword)
      const result = await comparePassword(longPassword, hash)

      expect(result).toBe(true)
    })
  })
})
