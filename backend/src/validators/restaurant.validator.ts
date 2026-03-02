import z from 'zod'

const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'レストラン名は2文字以上である必要があります' })
    .max(200, { message: 'レストラン名は200文字以内である必要があります' }),
  area: z.string().min(2, { message: 'エリア名は2文字以上である必要があります' }),
  hasPrivateRoom: z.boolean(),
  smokingAllowed: z.boolean(),
  priceRange: z.enum(priceRangeValues, { message: '有効な価格帯を選択してください' }),
  address: z.string().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  coverImage: z.string().optional(),
  icon: z.string().optional(),
})
const updateRestaurantSchema = createRestaurantSchema.partial()

const listRestaurantsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
})

const restaurantIdSchema = z.object({
  restaurantId: z.string().uuid({ message: '有効なレストランIDを指定してください' }),
})

export type createRestaurantBodySchema = z.infer<typeof createRestaurantSchema>
export type updateRestaurantBodySchema = z.infer<typeof updateRestaurantSchema>
export type restaurantIdBodySchema = z.infer<typeof restaurantIdSchema>
export type listRestaurantsQueryBodySchema = z.infer<typeof listRestaurantsQuerySchema>
