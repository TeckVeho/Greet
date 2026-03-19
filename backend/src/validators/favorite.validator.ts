import z from 'zod'

export const addFavoriteSchema = z.object({
  restaurantId: z.string().min(1, { message: '飲食店IDを指定してください' }),
})
export const favoriteRestaurantIdSchema = z.object({
  restaurantId: z.string().min(1, { message: '飲食店IDを指定してください' }),
})
export const listFavoriteRestaurantsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
})
export type addFavoriteBodySchema = z.infer<typeof addFavoriteSchema>
export type favoriteRestaurantIdParamSchema = z.infer<typeof favoriteRestaurantIdSchema>
export type listFavoriteRestaurantsQuerySchema = z.infer<typeof listFavoriteRestaurantsQuerySchema>
