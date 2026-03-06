'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Area, Genre } from '@/lib/types'
import * as React from 'react'

export interface FilterState {
	areas: Area[]
	genres: Genre[]
	hasPrivateRoom?: boolean
	smokingAllowed?: boolean
	priceRanges: string[]
}

interface FilterDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	filters: FilterState
	onFiltersChange: (filters: FilterState) => void
}

const AREAS: Area[] = ['銀座', '赤坂', '六本木', '新橋', '麻布', '恵比寿', '表参道', 'その他']
const GENRES: Genre[] = [
	'寿司',
	'フレンチ',
	'イタリアン',
	'和食',
	'中華',
	'鉄板焼き',
	'焼肉',
	'天ぷら',
	'割烹',
	'その他',
]
const PRICE_RANGES = [
	'¥5,000~¥10,000',
	'¥10,000~¥20,000',
	'¥15,000~¥30,000',
	'¥20,000~¥35,000',
	'¥25,000~¥40,000',
	'¥30,000~¥50,000',
]

export function FilterDialog({ open, onOpenChange, filters, onFiltersChange }: FilterDialogProps) {
	const [localFilters, setLocalFilters] = React.useState<FilterState>(filters)

	React.useEffect(() => {
		setLocalFilters(filters)
	}, [filters])

	const handleAreaToggle = (area: Area) => {
		setLocalFilters(prev => ({
			...prev,
			areas: prev.areas.includes(area) ? prev.areas.filter(a => a !== area) : [...prev.areas, area],
		}))
	}

	const handleGenreToggle = (genre: Genre) => {
		setLocalFilters(prev => ({
			...prev,
			genres: prev.genres.includes(genre)
				? prev.genres.filter(g => g !== genre)
				: [...prev.genres, genre],
		}))
	}

	const handlePriceRangeToggle = (range: string) => {
		setLocalFilters(prev => ({
			...prev,
			priceRanges: prev.priceRanges.includes(range)
				? prev.priceRanges.filter(r => r !== range)
				: [...prev.priceRanges, range],
		}))
	}

	const handleApply = () => {
		onFiltersChange(localFilters)
		onOpenChange(false)
	}

	const handleReset = () => {
		const resetFilters: FilterState = {
			areas: [],
			genres: [],
			hasPrivateRoom: undefined,
			smokingAllowed: undefined,
			priceRanges: [],
		}
		setLocalFilters(resetFilters)
		onFiltersChange(resetFilters)
	}

	const activeFilterCount =
		localFilters.areas.length +
		localFilters.genres.length +
		localFilters.priceRanges.length +
		(localFilters.hasPrivateRoom !== undefined ? 1 : 0) +
		(localFilters.smokingAllowed !== undefined ? 1 : 0)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-[95vw] md:max-w-3xl max-h-[85vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>フィルター</DialogTitle>
					{activeFilterCount > 0 && (
						<p className='text-sm text-zinc-500 mt-1'>
							{activeFilterCount} 件のフィルターが適用されています
						</p>
					)}
				</DialogHeader>

				<div className='space-y-6'>
					{/* エリア */}
					<div>
						<Label className='text-sm font-semibold text-zinc-900 mb-3 block'>エリア</Label>
						<div className='flex flex-wrap gap-2'>
							{AREAS.map(area => (
								<button
									key={area}
									onClick={() => handleAreaToggle(area)}
									className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
										localFilters.areas.includes(area)
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									{area}
								</button>
							))}
						</div>
					</div>

					{/* ジャンル */}
					<div>
						<Label className='text-sm font-semibold text-zinc-900 mb-3 block'>ジャンル</Label>
						<div className='flex flex-wrap gap-2'>
							{GENRES.map(genre => (
								<button
									key={genre}
									onClick={() => handleGenreToggle(genre)}
									className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
										localFilters.genres.includes(genre)
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									{genre}
								</button>
							))}
						</div>
					</div>

					{/* 価格帯 */}
					<div>
						<Label className='text-sm font-semibold text-zinc-900 mb-3 block'>価格帯</Label>
						<div className='flex flex-wrap gap-2'>
							{PRICE_RANGES.map(range => (
								<button
									key={range}
									onClick={() => handlePriceRangeToggle(range)}
									className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
										localFilters.priceRanges.includes(range)
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									{range}
								</button>
							))}
						</div>
					</div>

					{/* 個室・喫煙 */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<Label className='text-sm font-semibold text-zinc-900 mb-3 block'>個室</Label>
							<div className='flex gap-2'>
								<button
									onClick={() =>
										setLocalFilters(prev => ({
											...prev,
											hasPrivateRoom: true,
										}))
									}
									className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										localFilters.hasPrivateRoom === true
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									あり
								</button>
								<button
									onClick={() =>
										setLocalFilters(prev => ({
											...prev,
											hasPrivateRoom: false,
										}))
									}
									className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										localFilters.hasPrivateRoom === false
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									なし
								</button>
								<button
									onClick={() =>
										setLocalFilters(prev => ({
											...prev,
											hasPrivateRoom: undefined,
										}))
									}
									className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										localFilters.hasPrivateRoom === undefined
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									すべて
								</button>
							</div>
						</div>

						<div>
							<Label className='text-sm font-semibold text-zinc-900 mb-3 block'>喫煙</Label>
							<div className='flex gap-2'>
								<button
									onClick={() =>
										setLocalFilters(prev => ({
											...prev,
											smokingAllowed: true,
										}))
									}
									className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										localFilters.smokingAllowed === true
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									可
								</button>
								<button
									onClick={() =>
										setLocalFilters(prev => ({
											...prev,
											smokingAllowed: false,
										}))
									}
									className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										localFilters.smokingAllowed === false
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									不可
								</button>
								<button
									onClick={() =>
										setLocalFilters(prev => ({
											...prev,
											smokingAllowed: undefined,
										}))
									}
									className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										localFilters.smokingAllowed === undefined
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									すべて
								</button>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant='secondary' onClick={handleReset}>
						リセット
					</Button>
					<Button onClick={handleApply}>適用</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
