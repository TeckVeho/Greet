// utils/ApiError.ts
export class ApiError extends Error {
  public statusCode: number
  public status: string

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'

    Error.captureStackTrace(this, this.constructor)
  }
}

export const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}
export const cleanArray = (arr: any) => {
  if (!arr) return []
  const normalized = Array.isArray(arr) ? arr : [arr]
  // "undefined" stringini va bo'sh qiymatlarni olib tashlaymiz
  return normalized.filter(item => item && item !== 'undefined')
}
