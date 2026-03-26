'use client'

import { DataCards, DataTable, RestaurantColumns } from '@/components/restaurants'
import {
	Button,
	Section,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
} from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { useRestaurants } from '@/hooks/use-restaurants'
import { useAuth } from '@/lib/auth-context'
import { areaLabel, sortOptions } from '@/lib/constants'
import type { Area } from '@/lib/types'
import { sortRestaurants, type SortOption } from '@/lib/utils'
import { LayoutGrid, Table } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export default function AreaPage() {
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const [selectedArea, setSelectedArea] = React.useState<Area | 'all'>('all')
	const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('cards')
	const [sortOption, setSortOption] = React.useState<SortOption>('createdAt_desc')

	// 認証チェック
	React.useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push('/login')
		}
	}, [user, isAuthLoading, router])
	const { data: restaurantList, isPending: isRestaurantsPending } = useRestaurants({
		limit: 100, // 大量に取得してクライアント側で絞り込む
		page: 1,
	})

	const restaurants = React.useMemo(() => restaurantList?.data ?? [], [restaurantList])

	// エリアごとにグループ化
	const restaurantsByArea = React.useMemo(() => {
		const grouped = new Map<Area, typeof restaurants>()
		restaurants.forEach(restaurant => {
			const area = restaurant.area as Area
			if (!grouped.has(area)) {
				grouped.set(area, [])
			}
			grouped.get(area)?.push(restaurant)
		})
		return grouped
	}, [restaurants])

	// エリアの一覧を取得（件数が多い順）
	const areas = React.useMemo(() => {
		return Array.from(restaurantsByArea.keys()).sort((a, b) => {
			const countA = restaurantsByArea.get(a)?.length || 0
			const countB = restaurantsByArea.get(b)?.length || 0
			return countB - countA
		})
	}, [restaurantsByArea])

	// フィルタリング・並び替えされたレストラン
	const displayedRestaurants = React.useMemo(() => {
		const list = selectedArea === 'all' ? restaurants : restaurantsByArea.get(selectedArea) || []
		return sortRestaurants(list, sortOption)
	}, [selectedArea, restaurantsByArea, sortOption, restaurants])

	if (isAuthLoading || !user) {
		return null
	}

	if (isRestaurantsPending) {
		return <Spinner type='page-loading' />
	}

	return (
		<Section>
			{/* ページヘッダー */}
			<div className='mb-8'>
				<div className='mb-2 flex items-center gap-2'>
					<span className='text-2xl md:text-3xl'>📍</span>
					<h1 className='text-2xl md:text-3xl font-bold text-foreground'>エリア別</h1>
				</div>
				<p className='text-sm text-muted-foreground'>エリアごとに飲食店を絞り込んで表示</p>
			</div>

			{/* エリアフィルターとビュー切り替え */}
			<div className='mb-6'>
				<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3'>
					<div className='flex flex-wrap gap-2'>
						<Button
							onClick={() => setSelectedArea('all')}
							variant={selectedArea === 'all' ? 'default' : 'secondary'}
						>
							すべて
							<span className='ml-1.5 text-xs opacity-70'>({restaurants.length})</span>
						</Button>
						{areas.map(area => {
							const count = restaurantsByArea.get(area)?.length || 0
							return (
								<Button
									key={area}
									onClick={() => setSelectedArea(area)}
									variant={selectedArea === area ? 'default' : 'secondary'}
								>
									{areaLabel(area)}
									<span className='ml-1.5 text-xs opacity-70'>({count})</span>
								</Button>
							)
						})}
					</div>
					{/* 並び替え・ビュー切り替え (モバイルでは非表示) */}
					<div className='md:flex items-center gap-2 self-end md:self-auto'>
						<Select value={sortOption} onValueChange={e => setSortOption(e as SortOption)}>
							<SelectTrigger className='w-45'>
								<SelectValue placeholder='Theme' />
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
						<div className='hidden md:flex items-center rounded-md overflow-hidden'>
							<Button
								onClick={() => setViewMode('table')}
								variant={viewMode === 'table' ? 'default' : 'secondary'}
								className='rounded-r-none'
								title='テーブル表示'
							>
								<LayoutGrid className={'size-4'} />
							</Button>
							<Button
								onClick={() => setViewMode('cards')}
								variant={viewMode === 'cards' ? 'default' : 'secondary'}
								title='テーブル表示'
								className='rounded-l-none'
							>
								<Table className={'size-4'} />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* エリアごとのセクション表示（すべて選択時のみ） */}
			{selectedArea === 'all' ? (
				<div className='space-y-8'>
					{areas.map(area => {
						const restaurants = sortRestaurants(restaurantsByArea.get(area) || [], sortOption)
						return (
							<div key={area}>
								<div className='mb-4 flex items-center gap-3'>
									<h2 className='text-xl font-semibold text-foreground'>{areaLabel(area)}</h2>
									<Badge variant='default'>{restaurants.length}件</Badge>
								</div>
								{/* モバイルは常にカード表示 */}
								{viewMode === 'cards' ||
								(typeof window !== 'undefined' && window.innerWidth < 768) ? (
									<DataCards data={restaurants} />
								) : (
									<div className='rounded-lg border border-border bg-card'>
										<DataTable columns={RestaurantColumns} data={restaurants} />
									</div>
								)}
							</div>
						)
					})}
				</div>
			) : (
				<>
					{/* 特定エリアのテーブル/カード表示（モバイルは常にカード） */}
					{viewMode === 'cards' || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
						<DataCards data={displayedRestaurants} />
					) : (
						<div className='rounded-lg border border-border bg-card'>
							<DataTable columns={RestaurantColumns} data={displayedRestaurants} />
						</div>
					)}

					{/* 件数表示 */}
					<div className='mt-4 text-sm text-muted-foreground'>
						{displayedRestaurants.length} 件の飲食店
					</div>
				</>
			)}
		</Section>
	)
}
