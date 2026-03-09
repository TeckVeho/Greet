'use client'

import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { listRestaurants, type RestaurantListItem } from '@/lib/api/restaurants'
import { areaLabel, genreLabel, priceRangeLabel } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface GlobalSearchDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
	const router = useRouter()
	const [searchQuery, setSearchQuery] = React.useState('')

	const { data: restaurants = [], isPending } = useQuery({
		queryKey: ['restaurants', { scope: 'global-search' }],
		queryFn: () => listRestaurants().then(res => res.data),
		enabled: open,
	})

	const filteredResults = React.useMemo<RestaurantListItem[]>(() => {
		if (!searchQuery.trim()) {
			return restaurants
		}

		const query = searchQuery.toLowerCase()
		return restaurants.filter(
			restaurant =>
				restaurant.name.toLowerCase().includes(query) ||
				areaLabel(restaurant.area).toLowerCase().includes(query) ||
				restaurant.genres.some(genre => genreLabel(genre).toLowerCase().includes(query)) ||
				restaurant.address?.toLowerCase().includes(query),
		)
	}, [restaurants, searchQuery])

	// ダイアログが閉じられたら検索クエリをリセット
	React.useEffect(() => {
		if (!open) {
			setSearchQuery('')
		}
	}, [open])

	const handleResultClick = (restaurantId: string) => {
		router.push(`/restaurant/${restaurantId}`)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-[95vw] md:max-w-2xl max-h-[80vh] p-0'>
				<DialogHeader className='px-6 pt-6 pb-4 border-b border-zinc-200'>
					<DialogTitle className='sr-only'>レストラン検索</DialogTitle>
					<div className='relative'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'
						>
							<circle cx='11' cy='11' r='8' />
							<path d='m21 21-4.3-4.3' />
						</svg>
						<Input
							type='text'
							placeholder='店名、エリア、ジャンル、住所で検索...'
							className='pl-10 h-12 text-base border-0 focus-visible:ring-0'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							autoFocus
						/>
					</div>
				</DialogHeader>

				<div className='overflow-y-auto max-h-[calc(80vh-8rem)] px-2 py-2'>
					{isPending ? (
						<div className='text-center py-12 text-zinc-500'>
							<p className='text-sm'>飲食店を読み込み中です...</p>
						</div>
					) : filteredResults.length === 0 ? (
						<div className='text-center py-12 text-zinc-500'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='48'
								height='48'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='mx-auto mb-4 text-zinc-300'
							>
								<circle cx='11' cy='11' r='8' />
								<path d='m21 21-4.3-4.3' />
							</svg>
							<p className='text-sm'>検索結果が見つかりませんでした</p>
						</div>
					) : (
						<div className='space-y-1'>
							{filteredResults.map(restaurant => (
								<button
									key={restaurant.id}
									onClick={() => handleResultClick(restaurant.id)}
									className='w-full text-left px-4 py-3 rounded-lg hover:bg-zinc-50 transition-colors group'
								>
									<div className='flex items-start gap-3'>
										<span className='text-2xl shrink-0'>{restaurant.icon}</span>
										<div className='flex-1 min-w-0'>
											<div className='font-medium text-zinc-900 group-hover:text-blue-600 transition-colors'>
												{restaurant.name}
											</div>
										<div className='flex items-center gap-2 mt-1 text-sm text-zinc-500'>
											<span>{areaLabel(restaurant.area)}</span>
											<span>•</span>
											<span>{priceRangeLabel(restaurant.priceRange)}</span>
										</div>
										<div className='flex items-center gap-1.5 mt-2 flex-wrap'>
											{restaurant.genres.map((genre, index) => (
												<Badge key={index} variant='area' className='text-xs'>
													{genreLabel(genre)}
												</Badge>
											))}
												{restaurant.hasPrivateRoom && (
													<Badge variant='yakiniku' className='text-xs bg-green-100 text-green-700'>
														個室あり
													</Badge>
												)}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>
					)}
				</div>

				{!isPending && filteredResults.length > 0 && (
					<div className='px-6 py-3 border-t border-zinc-200 text-xs text-zinc-500'>
						{filteredResults.length} 件の飲食店が見つかりました
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
