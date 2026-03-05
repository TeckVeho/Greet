import z from 'zod'

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  occasion: z.string().max(200).optional(),
  result: z.string(),
  restaurantId: z.string().uuid({ message: '有効なレストランIDを指定してください' }),
})

export const restaurantIdSchema = z.object({
  restaurantId: z.string().uuid({ message: '有効なレストランIDを指定してください' }),
})

export const reviewIdParamSchema = z.object({
  reviewId: z.string().uuid({ message: '有効なレビューIDを指定してください' }),
})

export type TcreateReviewBodySchema = z.infer<typeof createReviewSchema>
export type TrestaurantIdParamSchema = z.infer<typeof restaurantIdSchema>
export type TreviewIdParamSchema = z.infer<typeof reviewIdParamSchema>
