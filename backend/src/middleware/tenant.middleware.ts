import { NextFunction, Request, Response } from 'express'

export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void {
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

  const companyId = req.user.companyId

  if (!companyId) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'テナント情報が見つかりません',
      },
    })
    return
  }

  next()
}
