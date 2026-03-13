'use client'

import { DataCards, DataTable, RestaurantColumns } from '@/components/restaurants'
import { Button } from '@/components/ui'
import { Callout } from '@/components/ui/callout'
import { listFavorites } from '@/lib/api/favorites'
import type { RestaurantListItem } from '@/lib/api/restaurants'
import { useAuth } from '@/lib/auth-context'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, Table } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export default function FavoritesPage() {
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('cards')

	// 認証チェック
	React.useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push('/login')
		}
	}, [user, isAuthLoading, router])

	const { data: favoriteItems, isPending: isFavoritesPending } = useQuery({
		queryKey: ['favorites'],
		queryFn: listFavorites,
		enabled: !!user,
	})
	const favoriteRestaurants = React.useMemo<RestaurantListItem[]>(
		() => favoriteItems?.map(item => item.restaurant as RestaurantListItem) ?? [],
		[favoriteItems],
	)

	if (isAuthLoading || !user) {
		return null
	}

	if (isFavoritesPending) {
		return (
			<div className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
				<p className='text-sm text-zinc-500'>お気に入りを読み込み中です...</p>
			</div>
		)
	}

	return (
		<div className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
			{/* ページヘッダー */}
			<div className='mb-8'>
				<div className='mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
					<div className='flex items-center gap-2'>
						<span className='text-2xl md:text-3xl'>⭐</span>
						<h1 className='text-2xl md:text-3xl font-bold text-zinc-900'>お気に入り</h1>
					</div>
					{favoriteRestaurants.length > 0 && (
						<div className='hidden md:flex items-center border border-zinc-200 rounded-md overflow-hidden self-end md:self-auto'>
							<Button
								onClick={() => setViewMode('cards')}
								variant={viewMode === 'table' ? 'secondary' : 'default'}
								className='rounded-r-none'
								title='カード表示'
							>
								<LayoutGrid className={'size-4'} />
							</Button>
							<Button
								onClick={() => setViewMode('table')}
								variant={viewMode === 'table' ? 'default' : 'secondary'}
								title='テーブル表示'
								className='rounded-l-none'
							>
								<Table className={'size-4'} />
							</Button>
						</div>
					)}
				</div>
				<p className='text-sm text-zinc-500'>お気に入りに登録した飲食店を表示</p>
			</div>

			{/* お気に入りが空の場合 */}
			{favoriteRestaurants.length === 0 ? (
				<Callout icon='💡'>
					<p className='font-medium'>お気に入りがありません</p>
					<p className='mt-1 text-sm text-zinc-600'>
						飲食店一覧、エリア別、またはジャンル別ページから、お気に入りに追加してください。
					</p>
				</Callout>
			) : (
				<>
					{/* お気に入りレストランのテーブル/カード表示（モバイルは常にカード） */}
					{viewMode === 'cards' || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
						<DataCards
							data={favoriteItems?.map(item => item.restaurant as RestaurantListItem)!}
							total={favoriteItems?.length}
							isLoading={false}
							totlaHidden={false}
						/>
					) : (
						<div className='rounded-lg border border-zinc-200 bg-white'>
							<DataTable
								columns={RestaurantColumns}
								data={favoriteItems?.map(item => item.restaurant as RestaurantListItem)!}
								total={favoriteItems?.length}
								isLoading={false}
								totlaHidden={false}
							/>
						</div>
					)}

					{/* 件数表示 */}
					<div className='mt-4 text-sm text-zinc-500'>
						{favoriteRestaurants.length} 件のお気に入り
					</div>
				</>
			)}
		</div>
	)
}
