'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { Review } from '@/lib/types'
import { cn, onError } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star } from 'lucide-react'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui'

interface ReviewFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (review: Omit<Review, 'id' | 'createdAt'>) => void
}
const schema = z.object({
	occasion: z.string().min(1, '利用シーンは必須です'),
	result: z.string().min(1, '結果・感想は必須です'),
	rating: z
		.number()
		.min(1, '評価は1以上でなければなりません')
		.max(5, '評価は5以下でなければなりません'),
})
type FormData = z.infer<typeof schema>
export function DialogCreateReview({
	open,
	onOpenChange,
	onSubmit: submitReview,
}: ReviewFormDialogProps) {
	const { user } = useAuth()
	const form = useForm<FormData>({
		defaultValues: {
			occasion: '',
			result: '',
			rating: 5,
		},
		resolver: zodResolver(schema),
	})
	const onSubmit: SubmitHandler<FormData> = data => {
		if (!user) {
			console.error('User not authenticated')
			return
		}
		const payload = {
			authorId: user.id,
			author: {
				id: user.id,
				name: user.name,
			},
			occasion: data.occasion,
			result: data.result,
			rating: data.rating,
		}
		submitReview(payload)
		onOpenChange(false)
		form.reset()
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>レビューを投稿</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit, onError)}>
						<DialogBody className='space-y-6'>
							{/* 利用シーン */}
							<FormField
								control={form.control}
								name='occasion'
								render={({ field }) => (
									<FormItem>
										<FormLabel required>利用シーン</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder='例: 重要な取引先との接待、社内の役員会食など'
												rows={3}
												className='resize-none'
											/>
										</FormControl>
										<FormDescription>
											誰と、どのような目的で利用したか記載してください
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* 結果 */}
							<FormField
								control={form.control}
								name='result'
								render={({ field }) => (
									<FormItem>
										<FormLabel required>結果・感想</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder='例: 料理の質が高く、個室でゆっくり商談できた。先方も満足していただけた様子。'
												required
												rows={4}
												className='resize-none'
											/>
										</FormControl>
										<FormDescription>
											利用した結果や感想、先方の反応などを記載してください
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* 評価 */}
							<FormField
								control={form.control}
								name='rating'
								render={({ field }) => (
									<FormItem>
										<FormLabel required>総合評価</FormLabel>
										<FormControl>
											<div className='flex items-center gap-3'>
												{[1, 2, 3, 4, 5].map(star => (
													<button
														key={star}
														type='button'
														title={`${star}つ星`}
														aria-label={`${star}つ星`}
														onClick={() => field.onChange(star)}
														className='cursor-pointer transition-transform hover:scale-110'
													>
														<Star
															className={cn(
																star <= field.value
																	? 'fill-yellow-300 stroke-yellow-300'
																	: 'fill-foreground/15 stroke-foreground/15',
															)}
														/>
													</button>
												))}
											</div>
										</FormControl>
										<FormDescription>星をクリックして評価を選択してください</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</DialogBody>
						<DialogFooter className='max-sm:gap-3'>
							<Button
								type='button'
								variant='secondary'
								disabled={form.formState.isSubmitting}
								onClick={() => onOpenChange(false)}
							>
								キャンセル
							</Button>
							<Button type='submit' disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? '投稿中...' : '投稿する'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
