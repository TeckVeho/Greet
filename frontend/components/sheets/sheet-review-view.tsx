'use client'

import {
	Callout,
	ScrollArea,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui'
import { Review } from '@/lib/types'
import { MessageSquareText } from 'lucide-react'
import { ReactNode } from 'react'
import { Rating } from '../rating'

export const SheetReviewView: React.FC<{ trigger: ReactNode; reviews: Review[] | null }> = ({
	trigger,
	reviews,
}) => {
	if (!reviews) return null

	return (
		<Sheet>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent className='sm:max-w-lg border-l border-border bg-background flex flex-col h-full p-0'>
				{/* Header qismi - Fiksirlangan */}
				<SheetHeader className='p-6 space-y-2 border-b bg-muted/20'>
					<div className='flex items-center gap-2 text-primary'>
						<div className='p-2 bg-primary/10 rounded-lg'>
							<MessageSquareText className='h-5 w-5' />
						</div>
						<SheetTitle className='text-xl font-bold'>レビュー詳細</SheetTitle>
					</div>
					<SheetDescription className='text-muted-foreground text-xs leading-relaxed'>
						選択されたレビューの詳細を確認できます。
					</SheetDescription>
				</SheetHeader>

				{/* Scroll qilinadigan kontent */}
				<ScrollArea className='flex-1 p-6'>
					<div className='space-y-4'>
						{reviews.map(review => {
							const authorName = review.author?.name ?? '削除済みユーザー'
							const nameIcon = (
								<div className='flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-700'>
									{review.author?.icon ?? authorName.charAt(0)}
								</div>
							)
							return (
								<Callout key={review.id} icon={nameIcon}>
									<div className='space-y-2'>
										<div className='flex items-center justify-between'>
											<div className='flex flex-wrap items-center gap-2'>
												<div className='font-semibold text-zinc-900'>{authorName}</div>
											</div>
											<div className='text-xs text-zinc-500'>
												{new Date(review.createdAt).toLocaleDateString('ja-JP')}
											</div>
										</div>
										<div className='text-sm text-zinc-700'>
											<div className='mb-2'>
												<span className='font-medium text-zinc-900'>利用シーン：</span>
												{review.occasion}
											</div>
											<div>
												<span className='font-medium text-zinc-900'>結果：</span>
												{review.result}
											</div>
										</div>
										{review.rating && review.rating > 0 && <Rating rate={review.rating} />}
									</div>
								</Callout>
							)
						})}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}
