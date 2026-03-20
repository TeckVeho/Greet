import z from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを指定してください' }),
  password: z.string().min(1, { message: 'パスワードを入力してください' }),
})

export type loginBodySchema = z.infer<typeof loginSchema>
