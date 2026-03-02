import type { Request, Response, NextFunction } from 'express'

/**
 * 管理者チェックミドルウェア。
 * authMiddleware の後に配置し、req.user.role が 'admin' でない場合は 403 Forbidden を返す。
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '認証が必要です',
      },
    })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'この操作を行う権限がありません',
      },
    })
    return
  }

  next()
}
