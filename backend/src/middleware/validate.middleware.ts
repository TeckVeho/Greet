import { NextFunction, Request, Response } from 'express'
import z, { ZodSchema } from 'zod'

export const validator =
  (schema: ZodSchema, target: 'body' | 'query' | 'params' | 'headers') =>
  (req: Request, res: Response, next: NextFunction) => {
    const validate = schema.safeParse(req[target])

    if (!validate.success) {
      return res.status(400).send({
        errors: validate.error.issues.map(issue => issue.message),
        status: 400,
        message: 'バリデーションエラー',
      })
    } else {
      ;(req as any)[target] = validate.data
      next()
    }
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
