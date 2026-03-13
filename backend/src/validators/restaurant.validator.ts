import { Area, Genre, PriceRange } from '@prisma/client'
import z from 'zod'

// createdById / companyId are injected server-side from JWT — never accepted from the client body
export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'レストラン名は2文字以上である必要があります' })
    .max(200, { message: 'レストラン名は200文字以内である必要があります' }),
  area: z.nativeEnum(Area),
  hasPrivateRoom: z.boolean(),
  smokingAllowed: z.boolean(),
  priceRange: z.nativeEnum(PriceRange),
  address: z.string().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  coverImage: z.string().optional(),
  icon: z.string().optional(),
  genres: z.array(z.nativeEnum(Genre)).optional(),
})

// companyId and createdById are never updatable by the client
export const updateRestaurantSchema = createRestaurantSchema.partial()

export const listRestaurantsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
  search: z.string().optional(),
  areas: z.array(z.nativeEnum(Area)).optional(),
  genres: z.array(z.nativeEnum(Genre)).optional(),
  hasPrivateRoom: z.enum(['true', 'false']).optional(),
  smokingAllowed: z.enum(['true', 'false']).optional(),
  priceRanges: z.array(z.nativeEnum(PriceRange)).optional(),
})

export const restaurantIdSchema = z.object({
  restaurantId: z.string().min(1, { message: '有効なレストランIDを指定してください' }),
})

export type createRestaurantBodySchema = z.infer<typeof createRestaurantSchema>
export type updateRestaurantBodySchema = z.infer<typeof updateRestaurantSchema>
export type restaurantIdBodySchema = z.infer<typeof restaurantIdSchema>
export type listRestaurantsQueryBodySchema = z.infer<typeof listRestaurantsQuerySchema>
