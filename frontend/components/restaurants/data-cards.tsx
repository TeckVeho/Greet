'use client'

import { Badge, Skeleton } from '@/components/ui'
import { areaLabel, genreLabel, priceRangeLabel } from '@/lib/constants'
import { useFavorites } from '@/lib/favorites-context'
import type { RestaurantListItem } from '@/lib/api/restaurants'
import { PaginationState } from '@tanstack/react-table'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'
import { Pagination } from '../pagination'

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
	pagination: PaginationState
	setPagination: Dispatch<SetStateAction<PaginationState>>
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

	// Sahifalar sonini hisoblash
	const totalPages = total ? Math.ceil(total / pagination.pageSize) : 0

	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{isLoading ? (
					// Yuklanayotgan holat (Skeleton)
					Array.from({ length: pagination.pageSize }).map((_, index) => (
						<div
							key={index}
							className='rounded-lg border border-zinc-200 bg-white overflow-hidden shadow-sm'
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
									className='block rounded-lg border border-zinc-200 bg-white overflow-hidden transition-all hover:shadow-md hover:scale-[1.01]'
								>
									{/* Rasm qismi */}
									<div className='relative w-full h-48 bg-linear-to-br from-zinc-50 to-zinc-100'>
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

										{/* Sevimlilar tugmasi */}
										<button
											onClick={e => {
												e.preventDefault()
												e.stopPropagation()
												toggleFavorite(restaurant.id)
											}}
											className='absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors z-10'
										>
											<span className='text-lg'>{isFav ? '⭐' : '☆'}</span>
										</button>
									</div>

									{/* Kontent */}
									<div className='p-5'>
										<div className='flex items-center gap-2 mb-3'>
											<span className='text-2xl'>{restaurant.icon}</span>
											<h3 className='text-lg font-semibold text-zinc-900 line-clamp-1'>
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

										<div className='mb-3 text-sm text-zinc-700 font-medium'>
											<span>予算:</span> {priceRangeLabel(restaurant.priceRange)}
										</div>

										{/* Statuslar */}
										<div className='flex items-center gap-4 text-sm'>
											<div className='flex items-center gap-1.5'>
												{restaurant.hasPrivateRoom ? (
													<span className='text-green-600 flex items-center gap-1 italic'>
														✓ 個室あり
													</span>
												) : (
													<span className='text-zinc-400'>個室なし</span>
												)}
											</div>
											<div className='text-zinc-500'>{restaurant.phone || '電話番号はなし'}</div>
										</div>

										{/* Review mantiqi (DataTable'dagi kabi) */}
										<div className='mt-3 border-t border-zinc-100 pt-3 text-xs flex justify-between items-center'>
											<div className='text-zinc-500'>
												レビュー {restaurant.reviewCount} 件
												{/* {restaurant.reviews.length > 0 ? (
													<SheetReviewView
														reviews={restaurant.reviews}
														trigger={
															<span className='underline text-blue-500 cursor-pointer'>
																レビュー {restaurant.reviews.length} 件
															</span>
														}
													/>
												) : (
													<span>レビュー 0 件</span>
												)} */}
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
			<div className='flex items-center justify-between mt-4'>
				<span className='whitespace-nowrap text-sm font-medium'>飲食店数: {total}</span>
				<Pagination
					totalPages={totalPages}
					pageIndex={pagination.pageIndex}
					pageSize={pagination.pageSize}
					onPageChange={pageIndex => setPagination(prev => ({ ...prev, pageIndex }))}
					onPageSizeChange={pageSize => setPagination({ pageIndex: 0, pageSize })}
				/>
			</div>
		</div>
	)
}
