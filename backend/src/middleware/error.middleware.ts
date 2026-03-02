import { NextFunction, Request, Response } from 'express'

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  // Development
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    })
  } else {
    // Production
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message || 'サーバーエラーが発生しました',
    })
  }
}
