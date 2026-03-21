import z from 'zod'
const isSingleEmojiOrChar = (val?: string) => {
	if (!val) return true // optional bo'lgani uchun
	// Intl.Segmenter matnni "vizual" bo'laklarga (graphemes) bo'ladi
	const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
	const segments = Array.from(segmenter.segment(val))
	return segments.length <= 1
}
export const schemaCreate = z.object({
	avatar: z.any().optional(),
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
	icon: z.string().optional().refine(isSingleEmojiOrChar, {
		message: 'アイコンは1文字以内で入力してください',
	}),
})
export const schemaUpdate = z.object({
	avatar: z.any().optional(),
	name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内で入力してください'),
	email: z
		.string()
		.min(1, 'メールアドレスは必須です')
		.email('有効なメールアドレスを入力してください'),

	role: z.enum(['admin', 'user'], '権限はadminかuserを選択してください'),
	department: z.string().max(100, '部署名は100文字以内で入力してください').optional(),
	companyId: z.string().min(1, '所属会社は必須です'),
	icon: z.string().optional().refine(isSingleEmojiOrChar, {
		message: 'アイコンは1文字以内で入力してください',
	}),
})
