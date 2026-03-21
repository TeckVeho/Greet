'use client'

import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Kbd,
} from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { useRestaurants } from '@/hooks/use-restaurants'
import { areaLabel, genreLabel, priceRangeLabel } from '@/lib/constants'
import { Search, SearchIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export function DialogGlobalSearch() {
	const [open, setOpen] = React.useState(false)
	const router = useRouter()
	const [searchQuery, setSearchQuery] = React.useState('')

	const { data: restaurants, isPending } = useRestaurants({ search: searchQuery })

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault()
				setOpen(true)
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [])

	// ダイアログが閉じられたら検索クエリをリセット
	React.useEffect(() => {
		if (!open) {
			setSearchQuery('')
		}
	}, [open])

	const handleResultClick = (restaurantId: string) => {
		router.push(`/restaurants/${restaurantId}`)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant={'secondary'} className=' text-zinc-600 hover:bg-zinc-100'>
					<Search className='size-4' />
					<span className='text-muted-foreground'>検索...</span>
					<Kbd>⌘ K</Kbd>
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-[95vw] md:max-w-2xl p-0' showClose={false}>
				<DialogHeader className='px-6 pt-5 pb-4 border-b border-zinc-300'>
					<DialogTitle className='sr-only'>レストラン検索</DialogTitle>
					<InputGroup className='h-13'>
						<InputGroupInput
							placeholder='店名、エリア、ジャンルで検索...'
							onChange={e => setSearchQuery(e.target.value)}
							value={searchQuery}
						/>
						<InputGroupAddon>
							<SearchIcon />
						</InputGroupAddon>

						<InputGroupAddon align='inline-end'>
							{searchQuery ? (
								<X
									className='cursor-pointer'
									onClick={() => {
										setSearchQuery('')
									}}
								/>
							) : (
								''
							)}
						</InputGroupAddon>
					</InputGroup>
				</DialogHeader>

				<div className='overflow-y-auto max-h-[calc(80vh-8rem)] px-2 py-2'>
					{isPending ? (
						<div className='text-center py-12 '>
							<p className='text-sm'>飲食店を読み込み中です...</p>
						</div>
					) : restaurants?.data.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-12 text-zinc-500 gap-6'>
							<Search className='size-15' />
							<p className='text-sm'>検索結果が見つかりませんでした</p>
						</div>
					) : (
						<div className='space-y-1'>
							{restaurants?.data.map(restaurant => (
								<button
									key={restaurant.id}
									onClick={() => handleResultClick(restaurant.id)}
									className='w-full text-left px-4 py-3 rounded-lg  transition-colors group'
								>
									<div className='flex items-start gap-3'>
										<span className='text-2xl shrink-0'>{restaurant.icon}</span>
										<div className='flex-1 min-w-0'>
											<div className='font-medium group-hover:text-blue-600 transition-colors'>
												{restaurant.name}
											</div>
											<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap'>
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
				<DialogFooter>
					{restaurants && restaurants?.data.length > 0 && (
						<div className='px-6 py-3 border-t border-zinc-200 text-xs text-muted-foreground w-full'>
							{restaurants?.data.length} 件の飲食店が見つかりました
						</div>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
