import { NextFunction, Request, Response } from 'express'
import z, { ZodSchema } from 'zod'

export const validator =
  (schema: ZodSchema, target: 'body' | 'query' | 'params' | 'headers') =>
  (req: Request, res: Response, next: NextFunction) => {
    const validate = schema.safeParse(req[target])

    if (!validate.success) {
      const details = validate.error.issues.map(issue => ({
        field: issue.path.join('.') || undefined,
        message: issue.message,
      }))

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'バリデーションエラーが発生しました',
          details,
        },
      })
      return
    }

    if (target === 'body') {
      req.body = validate.data
    } else if (target === 'query') {
      Object.assign(req.query, validate.data)
    } else if (target === 'params') {
      Object.assign(req.params, validate.data)
    } else {
      Object.assign(req.headers, validate.data)
    }
    next()
  }
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return validator(schema, 'body')
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return validator(schema, 'query')
}

export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return validator(schema, 'params')
}

export function validateHeaders<T extends z.ZodTypeAny>(schema: T) {
  return validator(schema, 'headers')
}
