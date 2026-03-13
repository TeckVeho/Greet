'use client'

import {
	Button,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui'
import type { SortOption } from '@/lib/utils'
import { Filter, LayoutGrid, Plus, SearchIcon, Table, X } from 'lucide-react'
interface SearchFilterBarProps {
	onSearchChange: (value: string) => void
	onFilterClick: () => void
	onNewClick?: () => void
	viewMode?: 'table' | 'cards'
	onViewModeChange?: (mode: 'table' | 'cards') => void
	activeFilterCount?: number
	searchValue: string
	sortOption?: SortOption
	onSortChange?: (sort: SortOption) => void
}
const sortOptions = [
	{ value: 'createdAt_desc', label: '登録日（新しい順）' },
	{ value: 'createdAt_asc', label: '登録日（古い順）' },
	{ value: 'name_asc', label: '店名（あいうえお順）' },
	{ value: 'name_desc', label: '店名（逆順）' },
	{ value: 'price_asc', label: '価格帯（低い順）' },
	{ value: 'price_desc', label: '価格帯（高い順）' },
	{ value: 'reviews_desc', label: 'レビュー件数（多い順）' },
	{ value: 'rating_desc', label: '平均評価（高い順）' },
]
export function SearchFilterBar({
	onSearchChange,
	onFilterClick,
	onNewClick,
	viewMode = 'table',
	onViewModeChange,
	activeFilterCount = 0,
	sortOption = 'createdAt_desc',
	onSortChange,
	searchValue,
}: SearchFilterBarProps) {
	return (
		<div className='flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3 mb-6'>
			<div className='relative w-full md:flex-1 md:max-w-md'>
				<InputGroup>
					<InputGroupInput
						placeholder='店名、エリア、ジャンルで検索...'
						onChange={e => onSearchChange(e.target.value)}
						value={searchValue}
					/>
					<InputGroupAddon>
						<SearchIcon />
					</InputGroupAddon>

					<InputGroupAddon align='inline-end'>
						{searchValue.length > 0 && (
							<X
								className='cursor-pointer'
								onClick={() => {
									onSearchChange('')
								}}
							/>
						)}
					</InputGroupAddon>
				</InputGroup>
			</div>
			<Button variant='secondary' onClick={onFilterClick} className='relative'>
				<Filter className='size-4' />
				フィルター
				{activeFilterCount > 0 && (
					<span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white'>
						{activeFilterCount}
					</span>
				)}
			</Button>

			{/* 並び替え */}
			{onSortChange && (
				<Select value={sortOption} onValueChange={e => onSortChange(e as SortOption)}>
					<SelectTrigger className='w-45'>
						<SelectValue placeholder='フィルター' aria-label='並び替え' />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{sortOptions.map(option => (
								<SelectItem value={option.value} key={option.label}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			)}

			{/* ビュー切り替えボタン (モバイルでは非表示) */}
			{onViewModeChange && (
				<div className='hidden md:flex items-center border border-zinc-200 rounded-md overflow-hidden'>
					<Button
						onClick={() => onViewModeChange('cards')}
						variant={viewMode === 'cards' ? 'default' : 'secondary'}
						className='rounded-r-none'
						title='テーブル表示'
					>
						<LayoutGrid className={'size-4'} />
					</Button>
					<Button
						onClick={() => onViewModeChange('table')}
						variant={viewMode === 'table' ? 'default' : 'secondary'}
						title='カード表示'
						className='rounded-l-none'
					>
						<Table className={'size-4'} />
					</Button>
				</div>
			)}

			{/* 新規登録ボタン（PCのみここに表示、モバイルは画面下部にCTA） */}
			<Button onClick={onNewClick} className='hidden md:inline-flex'>
				<Plus className={'size-4'} />
				新規登録
			</Button>
		</div>
	)
}
