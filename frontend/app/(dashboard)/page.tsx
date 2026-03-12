'use client'

import {
	DialogRestaurantCreate,
	DialogRestaurantFilter,
	type FilterState,
} from '@/components/dialogs'
import { DataCards, DataTable, RestaurantColumns, SearchFilterBar } from '@/components/restaurants'
import { Spinner } from '@/components/ui'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useAuth } from '@/lib/auth-context'
import { type SortOption } from '@/lib/utils'
import { PaginationState } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export default function Home() {
	const router = useRouter()
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})
	const { user, isLoading: isAuthLoading } = useAuth()
	const [searchQuery, setSearchQuery] = React.useState<string>('')
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	const [isFilterOpen, setIsFilterOpen] = React.useState(false)
	// モバイルでは常にカード表示
	const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table')
	const [filterState, setFilterState] = React.useState<FilterState>({
		areas: [],
		genres: [],
		hasPrivateRoom: undefined,
		smokingAllowed: undefined,
		priceRanges: [],
	})
	const [sortOption, setSortOption] = React.useState<SortOption>('createdAt_desc')

	// 認証チェック
	React.useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push('/login')
		}
	}, [user, isAuthLoading, router])

	const {
		data: restaurantss,
		isLoading: isRestaurantsLoading,
		isFetching: isRestaurantsFetching,
	} = useRestaurants({
		limit: pagination.pageSize,
		page: pagination.pageIndex + 1,
		search: searchQuery,
		areas: filterState.areas,
		genres: filterState.genres,
		hasPrivateRoom: filterState.hasPrivateRoom,
		smokingAllowed: filterState.smokingAllowed,
		priceRanges: filterState.priceRanges,
	})

	// アクティブフィルター数の計算
	const activeFilterCount = React.useMemo(() => {
		return (
			filterState.areas.length +
			filterState.genres.length +
			filterState.priceRanges.length +
			(filterState.hasPrivateRoom !== undefined ? 1 : 0) +
			(filterState.smokingAllowed !== undefined ? 1 : 0)
		)
	}, [filterState])

	const handleFilterClick = () => {
		setIsFilterOpen(true)
	}

	const handleNewRestaurant = () => {
		setIsDialogOpen(true)
	}

	if (isAuthLoading || !user) {
		return null
	}

	if (isRestaurantsLoading) {
		return <Spinner type='page-loading' />
	}

	return (
		<>
			<div className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
				{/* ページヘッダー */}
				<div className='mb-8'>
					<div className='mb-2 flex items-center gap-2'>
						<span className='text-2xl md:text-3xl'>🍽️</span>
						<h1 className='text-2xl md:text-3xl font-bold text-foreground'>飲食店データベース</h1>
					</div>
					<p className='text-sm text-muted-foreground'>接待に最適な飲食店の情報を一元管理</p>
				</div>

				{/* 検索・フィルターバー */}
				<div className='mb-6'>
					<SearchFilterBar
						onSearchChange={setSearchQuery}
						searchValue={searchQuery}
						onFilterClick={handleFilterClick}
						onNewClick={handleNewRestaurant}
						activeFilterCount={activeFilterCount}
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						sortOption={sortOption}
						onSortChange={setSortOption}
					/>
				</div>

				{/* テーブル/カード表示（モバイルは常にカード） */}
				{viewMode === 'cards' || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
					<DataCards
						data={restaurantss?.data!}
						pagination={pagination}
						setPagination={setPagination}
						total={restaurantss?.meta?.total}
						isLoading={isRestaurantsFetching}
					/>
				) : (
					<DataTable
						columns={RestaurantColumns}
						data={restaurantss?.data!}
						pagination={pagination}
						setPagination={setPagination}
						total={restaurantss?.meta?.total}
						isLoading={isRestaurantsFetching}
					/>
				)}

				{/* モバイル用CTAボタン（余白を確保） */}
				<div className='h-20 md:hidden' />
			</div>

			{/* モバイル用固定CTAボタン */}
			<button
				onClick={handleNewRestaurant}
				className='md:hidden fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all'
				aria-label='新規登録'
			>
				<Plus />
			</button>

			{/* 新規登録モーダル */}
			<DialogRestaurantCreate open={isDialogOpen} onOpenChange={setIsDialogOpen} />

			{/* フィルターダイアログ */}
			<DialogRestaurantFilter
				open={isFilterOpen}
				onOpenChange={setIsFilterOpen}
				filters={filterState}
				onFiltersChange={setFilterState}
			/>
		</>
	)
}
