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
import { AREA_OPTIONS, GENRE_OPTIONS, PRICE_RANGE_OPTIONS } from '@/lib/constants'
import * as React from 'react'

export interface FilterState {
	areas: string[]
	genres: string[]
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

export function FilterDialog({ open, onOpenChange, filters, onFiltersChange }: FilterDialogProps) {
	const [localFilters, setLocalFilters] = React.useState<FilterState>(filters)

	React.useEffect(() => {
		setLocalFilters(filters)
	}, [filters])

	const handleAreaToggle = (value: string) => {
		setLocalFilters(prev => ({
			...prev,
			areas: prev.areas.includes(value) ? prev.areas.filter(a => a !== value) : [...prev.areas, value],
		}))
	}

	const handleGenreToggle = (value: string) => {
		setLocalFilters(prev => ({
			...prev,
			genres: prev.genres.includes(value)
				? prev.genres.filter(g => g !== value)
				: [...prev.genres, value],
		}))
	}

	const handlePriceRangeToggle = (value: string) => {
		setLocalFilters(prev => ({
			...prev,
			priceRanges: prev.priceRanges.includes(value)
				? prev.priceRanges.filter(r => r !== value)
				: [...prev.priceRanges, value],
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
						{AREA_OPTIONS.map(opt => (
							<button
								key={opt.value}
								onClick={() => handleAreaToggle(opt.value)}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									localFilters.areas.includes(opt.value)
										? 'bg-zinc-900 text-white'
										: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>

				{/* ジャンル */}
				<div>
					<Label className='text-sm font-semibold text-zinc-900 mb-3 block'>ジャンル</Label>
					<div className='flex flex-wrap gap-2'>
						{GENRE_OPTIONS.map(opt => (
							<button
								key={opt.value}
								onClick={() => handleGenreToggle(opt.value)}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									localFilters.genres.includes(opt.value)
										? 'bg-zinc-900 text-white'
										: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>

				{/* 価格帯 */}
				<div>
					<Label className='text-sm font-semibold text-zinc-900 mb-3 block'>価格帯</Label>
					<div className='flex flex-wrap gap-2'>
						{PRICE_RANGE_OPTIONS.map(opt => (
							<button
								key={opt.value}
								onClick={() => handlePriceRangeToggle(opt.value)}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									localFilters.priceRanges.includes(opt.value)
										? 'bg-zinc-900 text-white'
										: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
								}`}
							>
								{opt.label}
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
