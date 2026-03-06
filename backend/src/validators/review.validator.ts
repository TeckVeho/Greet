import z from 'zod'

export const createReviewSchema = z.object({
  occasion: z
    .string()
    .min(1, { message: '利用シーンを入力してください' })
    .max(200, { message: '利用シーンは200文字以内で入力してください' }),
  result: z
    .string()
    .min(1, { message: '結果を入力してください' })
    .max(2000, { message: '結果は2000文字以内で入力してください' }),
  rating: z.number().int().min(1).max(5).optional(),
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
