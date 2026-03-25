'use client'

import { Badge, Skeleton } from '@/components/ui'
import type { RestaurantListItem } from '@/lib/api/restaurants'
import { areaLabel, genreLabel, priceRangeLabel } from '@/lib/constants'
import { useFavorites } from '@/lib/favorites-context'
import { PaginationState } from '@tanstack/react-table'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'
import { Pagination } from '../pagination'
import { OutlineStar, Rating } from '../rating'

const getGenreVariant = (genreKey: string): any => {
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

interface RestaurantCardsProps {
	data: RestaurantListItem[]
	total?: number
	pagination?: PaginationState
	setPagination?: Dispatch<SetStateAction<PaginationState>>
	isLoading?: boolean
}

export function DataCards({
	data,
	total,
	pagination,
	setPagination,
	isLoading,
}: RestaurantCardsProps) {
	const { isFavorite, toggleFavorite } = useFavorites()
	const totalPages = total ? Math.ceil(total / (pagination?.pageSize || 0)) : 0

	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{isLoading ? (
					Array.from({ length: pagination?.pageSize || 0 }).map((_, index) => (
						<div
							key={index}
							className='rounded-lg border border-border bg-card overflow-hidden shadow-sm'
						>
							<Skeleton className='h-48 w-full' />
							<div className='p-5 space-y-3'>
								<Skeleton className='h-6 w-3/4' />
								<Skeleton className='h-4 w-1/2' />
								<div className='flex gap-2'>
									<Skeleton className='h-5 w-16' />
									<Skeleton className='h-5 w-16' />
								</div>
								<Skeleton className='h-10 w-full mt-4' />
							</div>
						</div>
					))
				) : data?.length > 0 ? (
					data.map(restaurant => {
						const isFav = isFavorite(restaurant.id)
						return (
							<div key={restaurant.id} className='relative group'>
								<Link
									href={`/restaurants/${restaurant.id}`}
									className='block rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:scale-[1.01]'
								>
									<div className='relative w-full h-48 bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700'>
										{restaurant.coverImage ? (
											<Image
												src={restaurant.coverImage}
												alt={restaurant.name}
												fill
												className='object-cover'
												unoptimized
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center text-6xl'>
												{restaurant.icon || '🍴'}
											</div>
										)}

										<button
											onClick={e => {
												e.preventDefault()
												e.stopPropagation()
												toggleFavorite(restaurant.id)
											}}
											className='absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-card/90 shadow-sm transition-colors hover:bg-card'
										>
											{isFav ? (
												<Rating rate={1} max={1} className='[&_svg]:size-5! [&>div]:size-5!' />
											) : (
												<OutlineStar className='[&_svg]:size-5! [&>div]:size-5!' />
											)}
										</button>
									</div>

									{/* Kontent */}
									<div className='p-5'>
										<div className='flex items-center gap-2 mb-3'>
											<span className='text-2xl'>{restaurant.icon}</span>
											<h3 className='text-lg font-semibold text-foreground line-clamp-1'>
												{restaurant.name}
											</h3>
										</div>

										<div className='mb-3'>
											<Badge variant='area'>{areaLabel(restaurant.area)}</Badge>
										</div>

										<div className='flex flex-wrap gap-1 mb-3'>
											{restaurant.genres?.map((genre, idx) => (
												<Badge key={idx} variant={getGenreVariant(genre)}>
													{genreLabel(genre)}
												</Badge>
											))}
										</div>

										<div className='mb-3 text-sm text-foreground font-medium'>
											<span>価格帯:</span> {priceRangeLabel(restaurant.priceRange)}
										</div>

										<div className='flex items-center gap-4 text-sm'>
											<div className='flex items-center gap-1.5'>
												{restaurant.hasPrivateRoom ? (
													<span className='text-green-600 flex items-center gap-1 italic'>
														✓ 個室あり
													</span>
												) : (
													<span className='text-muted-foreground'>個室なし</span>
												)}
											</div>

											{restaurant.phone ? (
												<div className='text-muted-foreground'>{restaurant.phone}</div>
											) : (
												<Badge variant={'danger'}>電話番号はなし</Badge>
											)}
										</div>

										<div className='mt-3 flex items-center justify-between border-t border-border/70 pt-3 text-xs'>
											<div className='text-muted-foreground'>
												レビュー {restaurant.reviewCount} 件
											</div>
										</div>
									</div>
								</Link>
							</div>
						)
					})
				) : (
					<div className='col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg'>
						データが見つかりませんでした。
					</div>
				)}
			</div>

			{/* Paginatsiya (DataTable kabi) */}
			{typeof pagination?.pageSize === 'number' &&
				typeof pagination?.pageIndex === 'number' &&
				setPagination &&
				typeof total === 'number' && (
					<div className='flex items-center justify-between mt-4'>
						<span className='whitespace-nowrap text-sm font-medium'>{total} 件の飲食店</span>
						<Pagination
							totalPages={totalPages}
							pageIndex={pagination.pageIndex}
							pageSize={pagination.pageSize}
							onPageChange={pageIndex => setPagination(prev => ({ ...prev, pageIndex }))}
							onPageSizeChange={pageSize => setPagination({ pageIndex: 0, pageSize })}
						/>
					</div>
				)}
		</div>
	)
}
