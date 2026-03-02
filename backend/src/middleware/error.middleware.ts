import { NextFunction, Request, Response } from 'express'

export const errorMiddleware = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode ?? 500

  let code: string
  switch (statusCode) {
    case 400:
      code = 'VALIDATION_ERROR'
      break
    case 401:
      code = 'UNAUTHORIZED'
      break
    case 403:
      code = 'FORBIDDEN'
      break
    case 404:
      code = 'NOT_FOUND'
      break
    case 409:
      code = 'CONFLICT'
      break
    default:
      code = 'INTERNAL_ERROR'
      break
  }

  const message =
    err.message ||
    (code === 'VALIDATION_ERROR'
      ? 'バリデーションエラーが発生しました'
      : 'サーバーエラーが発生しました')

  const details =
    process.env.NODE_ENV === 'development'
      ? [{ field: 'stack', message: err.stack ?? 'No stack trace available' }]
      : undefined

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  })
}
