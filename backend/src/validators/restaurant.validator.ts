import { Area, Genre, PriceRange } from '@prisma/client'
import z from 'zod'

const phoneRegex = /^[0-9()+\-\s]{8,20}$/

const enumArrayOrSingle = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.preprocess(value => {
    if (value === undefined || value === null || value === '') {
      return undefined
    }
    return Array.isArray(value) ? value : [value]
  }, z.array(itemSchema).optional())

// createdById / companyId are injected server-side from JWT — never accepted from the client body
export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'レストラン名は1文字以上である必要があります' })
    .max(200, { message: 'レストラン名は200文字以内である必要があります' }),
  area: z.nativeEnum(Area),
  hasPrivateRoom: z.boolean().optional().default(false),
  smokingAllowed: z.boolean().optional().default(false),
  priceRange: z.nativeEnum(PriceRange).optional().default(PriceRange.UNKNOWN),
  address: z.string().max(300, { message: '住所は300文字以内である必要があります' }).optional(),
  phone: z
    .string()
    .regex(phoneRegex, { message: '電話番号の形式が正しくありません' })
    .optional(),
  url: z.string().url({ message: '有効なURLを指定してください' }).optional(),
  coverImage: z.string().optional(),
  icon: z.string().optional(),
  genres: z.array(z.nativeEnum(Genre)).min(1, {
    message: 'ジャンルは1件以上選択してください',
  }),
})

// companyId and createdById are never updatable by the client
export const updateRestaurantSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'レストラン名は1文字以上である必要があります' })
    .max(200, { message: 'レストラン名は200文字以内である必要があります' })
    .optional(),
  area: z.nativeEnum(Area).optional(),
  hasPrivateRoom: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  priceRange: z.nativeEnum(PriceRange).optional(),
  address: z.string().max(300, { message: '住所は300文字以内である必要があります' }).optional(),
  phone: z
    .string()
    .regex(phoneRegex, { message: '電話番号の形式が正しくありません' })
    .optional(),
  // Allow clearing the URL by sending null (client uses this to "delete" map link).
  // Also accept empty string and coerce it to null for convenience.
  url: z.preprocess(
    value => (value === '' ? null : value),
    z.string().url({ message: '有効なURLを指定してください' }).nullable().optional(),
  ),
  coverImage: z.string().optional(),
  icon: z.string().optional(),
  genres: z.array(z.nativeEnum(Genre)).min(1, {
    message: 'ジャンルは1件以上選択してください',
  }).optional(),
})

export const listRestaurantsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  // docs keys
  area: enumArrayOrSingle(z.nativeEnum(Area)),
  genre: enumArrayOrSingle(z.nativeEnum(Genre)),
  priceRange: enumArrayOrSingle(z.nativeEnum(PriceRange)),
  sortBy: z.enum(['createdAt', 'name', 'priceRange', 'reviewCount', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  // existing client keys (kept for compatibility)
  areas: enumArrayOrSingle(z.nativeEnum(Area)),
  genres: enumArrayOrSingle(z.nativeEnum(Genre)),
  hasPrivateRoom: z.enum(['true', 'false']).optional(),
  smokingAllowed: z.enum(['true', 'false']).optional(),
  priceRanges: enumArrayOrSingle(z.nativeEnum(PriceRange)),
  sort: z
    .enum([
      'createdAt_desc',
      'createdAt_asc',
      'rating_desc',
      'reviews_desc',
      'price_desc',
      'price_asc',
      'name_desc',
      'name_asc',
    ])
    .optional(),
})

export const restaurantIdSchema = z.object({
  restaurantId: z.string().min(1, { message: '有効なレストランIDを指定してください' }),
})

export type createRestaurantBodySchema = z.infer<typeof createRestaurantSchema>
export type updateRestaurantBodySchema = z.infer<typeof updateRestaurantSchema>
export type restaurantIdBodySchema = z.infer<typeof restaurantIdSchema>
export type listRestaurantsQueryBodySchema = z.infer<typeof listRestaurantsQuerySchema>
