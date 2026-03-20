import z from 'zod'

export const schemaCreate = z.object({
	name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内で入力してください'),
	email: z
		.string()
		.min(1, 'メールアドレスは必須です')
		.email('有効なメールアドレスを入力してください'),
	password: z
		.string()
		.min(6, 'パスワードは6文字以上で入力してください')
		.regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'パスワードは英字と数字を含める必要があります'),
	role: z.enum(['admin', 'user'], '権限はadminかuserを選択してください'),
	department: z.string().max(100, '部署名は100文字以内で入力してください').optional(),
	companyId: z.string().min(1, '所属会社は必須です'),
})
export const schemaUpdate = z.object({
	name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内で入力してください'),
	email: z
		.string()
		.min(1, 'メールアドレスは必須です')
		.email('有効なメールアドレスを入力してください'),

	role: z.enum(['admin', 'user'], '権限はadminかuserを選択してください'),
	department: z.string().max(100, '部署名は100文字以内で入力してください').optional(),
	companyId: z.string().min(1, '所属会社は必須です'),
})
