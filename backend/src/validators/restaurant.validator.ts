import { Area, PriceRange } from '@prisma/client'
import z from 'zod'

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
  createdById: z.string().uuid({ message: '有効なユーザーIDを指定してください' }),
  companyId: z.string().uuid({ message: '有効な会社IDを指定してください' }),
})
export const updateRestaurantSchema = createRestaurantSchema.partial()

export const listRestaurantsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
})

export const restaurantIdSchema = z.object({
  restaurantId: z.string().uuid({ message: '有効なレストランIDを指定してください' }),
})

export type createRestaurantBodySchema = z.infer<typeof createRestaurantSchema>
export type updateRestaurantBodySchema = z.infer<typeof updateRestaurantSchema>
export type restaurantIdBodySchema = z.infer<typeof restaurantIdSchema>
export type listRestaurantsQueryBodySchema = z.infer<typeof listRestaurantsQuerySchema>
