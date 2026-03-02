import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from '../types/express'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

/**
 * JWT 認証ミドルウェア。
 * Authorization: Bearer <token> を検証し、req.user に { userId, role, companyId } をセットする。
 * トークンなし・無効の場合は 401 Unauthorized を返す。
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '認証トークンがありません',
      },
    })
    return
  }

  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      companyId: decoded.companyId,
    }
    next()
  } catch {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '認証トークンが無効または期限切れです',
      },
    })
  }
}
