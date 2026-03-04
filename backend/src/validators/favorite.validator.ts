import z from 'zod'

export const addFavoriteSchema = z.object({
  restaurantId: z.string().uuid({ message: '有効な飲食店IDを指定してください' }),
})
export const favoriteRestaurantIdSchema = z.object({
  restaurantId: z.string().uuid({ message: '有効な飲食店IDを指定してください' }),
})

export type addFavoriteBodySchema = z.infer<typeof addFavoriteSchema>
export type favoriteRestaurantIdParamSchema = z.infer<typeof favoriteRestaurantIdSchema>
