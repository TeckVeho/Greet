import z from 'zod'

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  occasion: z.string().max(200).optional(),
  result: z.string(),
  restaurantId: z.string().uuid({ message: '有効なレストランIDを指定してください' }),
})

const restaurantIdSchema = z.object({
  restaurantId: z.string().uuid({ message: '有効なレストランIDを指定してください' }),
})

const reviewIdParamSchema = z.object({
  reviewId: z.string().uuid({ message: '有効なレビューIDを指定してください' }),
})

export type createReviewBodySchema = z.infer<typeof createReviewSchema>
export type restaurantIdParamSchema = z.infer<typeof restaurantIdSchema>
export type reviewIdParamSchema = z.infer<typeof reviewIdParamSchema>
