import z from 'zod'

export const companySchema = z.object({
  name: z
    .string()
    .min(1, { message: '会社名を入力してください' })
    .max(100, { message: '会社名は100文字以内で入力してください' }),
  code: z
    .string()
    .min(1, { message: '会社コードを入力してください' })
    .max(20, { message: '会社コードは20文字以内で入力してください' }),
  icon: z.string().max(10, { message: 'アイコンは10文字以内で入力してください' }).optional(),
})

export type companyBodySchema = z.infer<typeof companySchema>
