import z from 'zod'

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'ユーザー名は2文字以上である必要があります' })
    .max(100, { message: 'ユーザー名は100文字以内である必要があります' }),
  email: z.string().email({ message: '有効なメールアドレスを指定してください' }),
  passwordHash: z.string().min(6, { message: 'パスワードは6文字以上である必要があります' }),
  role: z.enum(['user', 'admin'], { message: '役割は"user"または"admin"である必要があります' }),
  department: z
    .string()
    .max(100, { message: '部署名は100文字以内である必要があります' })
    .optional(),
  avatar: z.string().optional(),
  icon: z.string().max(10, { message: 'アイコンは10文字以内である必要があります' }).optional(),
  companyId: z.string().uuid({ message: '有効な会社IDを指定してください' }),
})
const updateUserSchema = createUserSchema.partial()

export const listUserQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
})

export const userIdSchema = z.object({
  userId: z.string().uuid({ message: '有効なユーザーIDを指定してください' }),
})

export type createUserBody = z.infer<typeof createUserSchema>
export type updateUserBody = z.infer<typeof updateUserSchema>
export type listUserQuery = z.infer<typeof listUserQuerySchema>
export type userIdParams = z.infer<typeof userIdSchema>
