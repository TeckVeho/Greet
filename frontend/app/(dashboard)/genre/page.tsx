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
import { listRestaurants, type RestaurantListItem } from '@/lib/api/restaurants'
import { useAuth } from '@/lib/auth-context'
import { genreLabel, sortOptions } from '@/lib/constants'
import { sortRestaurants, type SortOption } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, Table } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
// ジャンルごとのカラー定義（Prisma enum キーで管理）
const genreColors: Record<string, string> = {
	SUSHI: 'bg-red-100 text-red-700 hover:bg-red-200',
	FRENCH: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
	ITALIAN: 'bg-green-100 text-green-700 hover:bg-green-200',
	WASHOKU: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
	CHINESE: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
	TEPPANYAKI: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
	YAKINIKU: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
	TEMPURA: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
	KAPPO: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
	OTHER: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
}

export default function GenrePage() {
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const [selectedGenre, setSelectedGenre] = React.useState<string>('all')
	const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('cards')
	const [sortOption, setSortOption] = React.useState<SortOption>('createdAt_desc')

	// 認証チェック
	React.useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push('/login')
		}
	}, [user, isAuthLoading, router])

	const { data: restaurantList, isPending: isRestaurantsPending } = useQuery({
		queryKey: ['restaurants', { scope: 'genre' }],
		queryFn: () => listRestaurants().then(res => res.data),
		enabled: !!user,
	})

	const restaurants = React.useMemo<RestaurantListItem[]>(
		() => restaurantList ?? [],
		[restaurantList],
	)

	// ジャンルごとにグループ化（1つのレストランが複数ジャンルに属する可能性あり）
	const restaurantsByGenre = React.useMemo(() => {
		const grouped = new Map<string, typeof restaurants>()
		restaurants.forEach(restaurant => {
			restaurant.genres.forEach(genre => {
				if (!grouped.has(genre)) {
					grouped.set(genre, [])
				}
				grouped.get(genre)?.push(restaurant)
			})
		})
		return grouped
	}, [restaurants])

	// ジャンルの一覧を取得（件数が多い順）
	const genres = React.useMemo(() => {
		return Array.from(restaurantsByGenre.keys()).sort((a, b) => {
			// Always keep "OTHER(その他)" at the end for UI consistency.
			if (a === 'OTHER' && b !== 'OTHER') return 1
			if (b === 'OTHER' && a !== 'OTHER') return -1

			const countA = restaurantsByGenre.get(a)?.length || 0
			const countB = restaurantsByGenre.get(b)?.length || 0
			if (countA !== countB) return countB - countA

			// Stable, deterministic tie-breaker (otherwise Map insertion order leaks through).
			return genreLabel(a).localeCompare(genreLabel(b), 'ja')
		})
	}, [restaurantsByGenre])

	// フィルタリング・並び替えされたレストラン
	const displayedRestaurants = React.useMemo<RestaurantListItem[]>(() => {
		const list =
			selectedGenre === 'all' ? restaurants : (restaurantsByGenre.get(selectedGenre) ?? [])
		return sortRestaurants<RestaurantListItem>(list, sortOption)
	}, [selectedGenre, restaurantsByGenre, sortOption, restaurants])

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
					<span className='text-2xl md:text-3xl'>🍴</span>
					<h1 className='text-2xl md:text-3xl font-bold'>ジャンル別</h1>
				</div>
				<p className='text-sm text-muted-foreground'>料理ジャンルごとに飲食店を絞り込んで表示</p>
			</div>

			{/* ジャンルフィルターとビュー切り替え */}
			<div className='mb-6'>
				<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3'>
					<div className='flex flex-wrap gap-2'>
						<Button
							onClick={() => setSelectedGenre('all')}
							variant={selectedGenre === 'all' ? 'default' : 'secondary'}
						>
							すべて
						</Button>
						{genres.map(genre => {
							const count = restaurantsByGenre.get(genre)?.length || 0
							const colorClass = genreColors[genre] ?? genreColors['OTHER']
							return (
								<Button
									key={genre}
									onClick={() => setSelectedGenre(genre)}
									className={colorClass}
									variant={selectedGenre === genre ? 'default' : 'ghost'}
								>
									{genreLabel(genre)}
									<span className='ml-1.5 text-xs opacity-70'>({count})</span>
								</Button>
							)
						})}
					</div>
					{/* 並び替え・ビュー切り替え (モバイルでは非表示) */}
					<div className='hidden md:flex items-center gap-2 self-end md:self-auto'>
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

			{/* ジャンルごとのセクション表示（すべて選択時のみ） */}
			{selectedGenre === 'all' ? (
				<div className='space-y-8'>
					{genres.map(genre => {
						const genreRestaurants = sortRestaurants<RestaurantListItem>(
							restaurantsByGenre.get(genre) ?? [],
							sortOption,
						)
						return (
							<div key={genre}>
								<div className='mb-4 flex items-center gap-3'>
									<h2 className='text-xl font-semibold'>{genreLabel(genre)}</h2>
									<Badge variant='default'>{genreRestaurants.length}件</Badge>
								</div>
								{/* モバイルは常にカード表示 */}
								{viewMode === 'cards' ||
								(typeof window !== 'undefined' && window.innerWidth < 768) ? (
									<DataCards data={genreRestaurants} total={genreRestaurants.length} />
								) : (
									<DataTable
										columns={RestaurantColumns}
										data={genreRestaurants}
										total={genreRestaurants.length}
									/>
								)}
							</div>
						)
					})}
				</div>
			) : (
				<>
					{/* 特定ジャンルのテーブル/カード表示（モバイルは常にカード） */}
					{viewMode === 'cards' || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
						<DataCards data={displayedRestaurants} total={displayedRestaurants.length} />
					) : (
						<DataTable
							columns={RestaurantColumns}
							data={displayedRestaurants}
							total={displayedRestaurants.length}
						/>
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
