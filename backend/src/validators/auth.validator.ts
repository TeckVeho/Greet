import z from 'zod'

const loginSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを指定してください' }),
  password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください' }),
})

export type loginBodySchema = z.infer<typeof loginSchema>
