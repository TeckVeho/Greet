'use client'

import { DialogWarning } from '@/components/dialogs'
import { DialogCreateReview } from '@/components/dialogs/dialog-create-review'
import { DialogRestaurantUpdate } from '@/components/dialogs/dialog-restaurant-update'
import { Rating } from '@/components/rating'
import { Section } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Callout } from '@/components/ui/callout'
import { useDeleteRestaurant, useRestaurantsById } from '@/hooks/use-restaurants'
import { createReview } from '@/lib/api/reviews'
import { useAuth } from '@/lib/auth-context'
import { areaLabel, genreLabel, priceRangeLabel } from '@/lib/constants'
import { useFavorites } from '@/lib/favorites-context'
import type { Review } from '@/lib/types'
import { Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import * as React from 'react'

export default function RestaurantDetailPage() {
	const params = useParams()
	const restaurantId = params.id as string
	const router = useRouter()
	const { user, isLoading } = useAuth()
	const {
		data: restaurant,
		isPending: isRestaurantPending,
		refetch,
	} = useRestaurantsById(restaurantId)
	const isValidDelete = user?.role === 'admin' || restaurant?.createdBy?.id === user?.id
	const { mutateAsync: deleteRestaurant, isPending: isDeletePending } =
		useDeleteRestaurant(restaurantId)
	const { isFavorite, toggleFavorite } = useFavorites()
	const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false)

	// 認証チェック
	React.useEffect(() => {
		if (!isLoading && !user) {
			router.push('/login')
		}
	}, [user, isLoading, router])

	// レビュー投稿処理
	const handleReviewSubmit = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
		if (!restaurant) return

		try {
			await createReview(restaurant.id, {
				occasion: reviewData.occasion,
				result: reviewData.result,
				rating: reviewData.rating,
			})
			await refetch()
			setIsReviewDialogOpen(false)
		} catch (e) {
			console.error('Failed to create review', e)
		}
	}

	if (isLoading || !user || isRestaurantPending) {
		return null
	}

	if (!restaurant) {
		return (
			<div className='flex h-[60vh] items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-foreground'>飲食店が見つかりません</h2>
					<Button variant='secondary' className='mt-4' onClick={() => router.push('/')}>
						一覧に戻る
					</Button>
				</div>
			</div>
		)
	}

	const getGenreVariant = (
		genreKey: string,
	): 'sushi' | 'french' | 'italian' | 'yakiniku' | 'japanese' | 'chinese' | 'genre' => {
		switch (genreKey) {
			case 'SUSHI':
				return 'sushi'
			case 'FRENCH':
				return 'french'
			case 'ITALIAN':
				return 'italian'
			case 'YAKINIKU':
				return 'yakiniku'
			case 'WASHOKU':
			case 'TEMPURA':
			case 'KAPPO':
				return 'japanese'
			case 'CHINESE':
				return 'chinese'
			default:
				return 'genre'
		}
	}

	return (
		<>
			{/* カバー画像 */}
			<div className='relative h-40 md:h-60 w-full overflow-hidden bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700'>
				{restaurant.coverImage ? (
					<Image
						src={restaurant.coverImage}
						alt={restaurant.name}
						fill
						className='object-cover'
						priority
						unoptimized
					/>
				) : (
					<div className='h-full w-full flex items-center justify-center text-8xl'>
						{restaurant.icon}
					</div>
				)}
			</div>

			{/* メインコンテンツ */}
			<Section>
				{/* アイコンとタイトル */}
				<div className=' mb-4'>
					<div className='flex items-center justify-between'>
						<div className='mb-4 flex h-16 w-16 md:h-24 md:w-24 items-center justify-center rounded-lg border border-border bg-card text-4xl shadow-md md:text-5xl'>
							{restaurant.icon}
						</div>
						{isValidDelete && (
							<div className='flex items-center gap-3'>
								<DialogWarning
									deleteAction={deleteRestaurant}
									deleting={isDeletePending}
									trigger={
										<Button size={'icon'} variant={'danger'}>
											<Trash2 className='size-4' />
										</Button>
									}
									actionButtonText='削除'
									deletingText=''
									description='本当に削除したいですか？'
									title={`${restaurant.name}を削除`}
								/>
								<DialogRestaurantUpdate
									trigger={
										<Button>
											<Edit className='size-4' />
											変更
										</Button>
									}
									restaurant={restaurant}
									id={restaurantId}
								/>
							</div>
						)}
					</div>
					<div className='mb-2 flex items-center gap-3'>
						<h1 className='text-2xl md:text-4xl font-bold text-foreground'>{restaurant.name}</h1>
						<button
							onClick={() => toggleFavorite(restaurant.id)}
							className='inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-muted'
							title={isFavorite(restaurant.id) ? 'お気に入りから削除' : 'お気に入りに追加'}
						>
							<span className='text-2xl'>{isFavorite(restaurant.id) ? '⭐' : '☆'}</span>
						</button>
					</div>
					<div className='flex items-center gap-2'>
						<Badge variant='area'>{areaLabel(restaurant.area)}</Badge>
						{restaurant.genres.map((genre, idx) => (
							<Badge key={idx} variant={getGenreVariant(genre)}>
								{genreLabel(genre)}
							</Badge>
						))}
					</div>
				</div>

				{/* プロパティセクション */}
				<div className='mb-8 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card/80 p-6 md:grid-cols-2'>
					<div className='flex items-start gap-3'>
						<div className='w-24 shrink-0 text-sm font-medium text-muted-foreground'>住所</div>
						<div className='flex-1 text-sm text-foreground'>{restaurant.address}</div>
					</div>

					<div className='flex items-start gap-3'>
						<div className='w-24 shrink-0 text-sm font-medium text-muted-foreground'>電話番号</div>
						<div className='flex-1 text-sm text-foreground'>{restaurant.phone}</div>
					</div>

					<div className='flex items-start gap-3'>
						<div className='w-24 shrink-0 text-sm font-medium text-muted-foreground'>価格帯</div>
						<div className='flex-1 text-sm text-foreground'>
							{priceRangeLabel(restaurant.priceRange)}
						</div>
					</div>

					<div className='flex items-start gap-3'>
						<div className='w-24 shrink-0 text-sm font-medium text-muted-foreground'>個室</div>
						<div className='flex-1 text-sm text-foreground'>
							{restaurant.hasPrivateRoom ? 'あり' : 'なし'}
						</div>
					</div>

					<div className='flex items-start gap-3'>
						<div className='w-24 shrink-0 text-sm font-medium text-muted-foreground'>喫煙</div>
						<div className='flex-1 text-sm text-foreground'>
							{restaurant.smokingAllowed ? '可' : '不可'}
						</div>
					</div>

					{restaurant.url && (
						<div className='flex items-start gap-3'>
							<div className='w-24 shrink-0 text-sm font-medium text-muted-foreground'>地図</div>
							<div className='flex-1'>
								<a
									href={restaurant.url}
									target='_blank'
									rel='noopener noreferrer'
									className='text-sm text-primary hover:underline'
								>
									Google Mapで見る
								</a>
							</div>
						</div>
					)}
				</div>

				{/* レビューセクション */}
				<div className='mb-12'>
					<div className='mb-4 flex items-center justify-between'>
						<h2 className='text-xl font-semibold text-foreground'>利用レビュー</h2>
						<Button onClick={() => setIsReviewDialogOpen(true)}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='16'
								height='16'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M5 12h14' />
								<path d='M12 5v14' />
							</svg>
							レビューを書く
						</Button>
					</div>

					{restaurant.reviews.length === 0 ? (
						<div className='rounded-lg border border-border bg-card/80 p-8 text-center'>
							<p className='mb-3 text-sm text-muted-foreground'>まだレビューがありません</p>
							<Button variant='secondary' onClick={() => setIsReviewDialogOpen(true)}>
								最初のレビューを投稿する
							</Button>
						</div>
					) : (
						<div className='space-y-4'>
							{restaurant.reviews.map(review => {
								const authorName = review.author?.name ?? '削除済みユーザー'
								return (
									<Callout key={review.id}>
										<div className='space-y-2'>
											<div className='flex items-center justify-between'>
												<div className='flex flex-wrap items-center gap-2'>
													<div className='font-semibold text-foreground'>{authorName}</div>
												</div>
												<div className='text-xs text-muted-foreground'>
													{new Date(review.createdAt).toLocaleDateString('ja-JP')}
												</div>
											</div>
											<div className='text-sm text-muted-foreground'>
												<div className='mb-2'>
													<span className='font-medium text-foreground'>利用シーン：</span>
													{review.occasion}
												</div>
												<div>
													<span className='font-medium text-foreground'>結果：</span>
													{review.result}
												</div>
											</div>
											{review.rating && review.rating > 0 && <Rating rate={review.rating} />}
										</div>
									</Callout>
								)
							})}
						</div>
					)}
				</div>

				{/* アクションボタン */}
				<div className='mb-12 flex gap-3'>
					<Button variant='secondary' onClick={() => router.push('/')}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='m12 19-7-7 7-7' />
							<path d='M19 12H5' />
						</svg>
						一覧に戻る
					</Button>
				</div>
			</Section>

			{/* レビュー投稿ダイアログ */}
			{restaurant && (
				<DialogCreateReview
					open={isReviewDialogOpen}
					onOpenChange={setIsReviewDialogOpen}
					onSubmit={handleReviewSubmit}
				/>
			)}
		</>
	)
}
