'use client'

import { DataCards, DataTable, RestaurantColumns } from '@/components/restaurants'
import { Section } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { listRestaurants } from '@/lib/api/restaurants'
import { useAuth } from '@/lib/auth-context'
import { areaLabel } from '@/lib/constants'
import type { Area } from '@/lib/types'
import { sortRestaurants, type SortOption } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
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

	const { data: restaurantList, isPending: isRestaurantsPending } = useQuery({
		queryKey: ['restaurants', { scope: 'area' }],
		queryFn: () => listRestaurants().then(res => res.data),
		enabled: !!user,
	})

	const restaurants = React.useMemo(() => restaurantList ?? [], [restaurantList])

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
		return (
			<div className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
				<p className='text-sm text-zinc-500'>エリア別の飲食店を読み込み中です...</p>
			</div>
		)
	}

	return (
		<Section>
			{/* ページヘッダー */}
			<div className='mb-8'>
				<div className='mb-2 flex items-center gap-2'>
					<span className='text-2xl md:text-3xl'>📍</span>
					<h1 className='text-2xl md:text-3xl font-bold text-zinc-900'>エリア別</h1>
				</div>
				<p className='text-sm text-zinc-500'>エリアごとに飲食店を絞り込んで表示</p>
			</div>

			{/* エリアフィルターとビュー切り替え */}
			<div className='mb-6'>
				<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3'>
					<div className='flex flex-wrap gap-2'>
						<button
							onClick={() => setSelectedArea('all')}
							className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
								selectedArea === 'all'
									? 'bg-zinc-900 text-white'
									: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
							}`}
						>
							すべて
						</button>
						{areas.map(area => {
							const count = restaurantsByArea.get(area)?.length || 0
							return (
								<button
									key={area}
									onClick={() => setSelectedArea(area)}
									className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
										selectedArea === area
											? 'bg-zinc-900 text-white'
											: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									{areaLabel(area)}
									<span className='ml-1.5 text-xs opacity-70'>({count})</span>
								</button>
							)
						})}
					</div>
					{/* 並び替え・ビュー切り替え (モバイルでは非表示) */}
					<div className='hidden md:flex items-center gap-2 self-end md:self-auto'>
						<select
							value={sortOption}
							onChange={e => setSortOption(e.target.value as SortOption)}
							className='h-9 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400'
							aria-label='並び替え'
						>
							<option value='createdAt_desc'>登録日（新しい順）</option>
							<option value='createdAt_asc'>登録日（古い順）</option>
							<option value='name_asc'>店名（あいうえお順）</option>
							<option value='name_desc'>店名（逆順）</option>
							<option value='price_asc'>価格帯（低い順）</option>
							<option value='price_desc'>価格帯（高い順）</option>
							<option value='reviews_desc'>レビュー件数（多い順）</option>
							<option value='rating_desc'>平均評価（高い順）</option>
						</select>
						<div className='flex items-center border border-zinc-200 rounded-md overflow-hidden'>
							<button
								onClick={() => setViewMode('table')}
								className={`px-3 py-2 text-sm transition-colors ${
									viewMode === 'table'
										? 'bg-zinc-900 text-white'
										: 'bg-white text-zinc-600 hover:bg-zinc-50'
								}`}
								title='テーブル表示'
							>
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
									<rect width='7' height='7' x='3' y='3' rx='1' />
									<rect width='7' height='7' x='14' y='3' rx='1' />
									<rect width='7' height='7' x='14' y='14' rx='1' />
									<rect width='7' height='7' x='3' y='14' rx='1' />
								</svg>
							</button>
							<button
								onClick={() => setViewMode('cards')}
								className={`px-3 py-2 text-sm transition-colors ${
									viewMode === 'cards'
										? 'bg-zinc-900 text-white'
										: 'bg-white text-zinc-600 hover:bg-zinc-50'
								}`}
								title='カード表示'
							>
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
									<rect width='7' height='9' x='3' y='3' rx='1' />
									<rect width='7' height='5' x='14' y='3' rx='1' />
									<rect width='7' height='9' x='14' y='12' rx='1' />
									<rect width='7' height='5' x='3' y='16' rx='1' />
								</svg>
							</button>
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
									<h2 className='text-xl font-semibold text-zinc-900'>{areaLabel(area)}</h2>
									<Badge variant='default'>{restaurants.length}件</Badge>
								</div>
								{/* モバイルは常にカード表示 */}
								{viewMode === 'cards' ||
								(typeof window !== 'undefined' && window.innerWidth < 768) ? (
									<DataCards data={restaurants} />
								) : (
									<div className='rounded-lg border border-zinc-200 bg-white'>
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
						<div className='rounded-lg border border-zinc-200 bg-white'>
							<DataTable columns={RestaurantColumns} data={displayedRestaurants} />
						</div>
					)}

					{/* 件数表示 */}
					<div className='mt-4 text-sm text-zinc-500'>{displayedRestaurants.length} 件の飲食店</div>
				</>
			)}
		</Section>
	)
}
