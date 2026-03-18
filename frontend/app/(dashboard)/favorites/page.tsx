'use client'

import { DataCards, DataTable, favoriteRestaurantsColumns } from '@/components/favorite-restaurants'
import { Rating } from '@/components/rating'
import { Button, Section, Spinner } from '@/components/ui'
import { Callout } from '@/components/ui/callout'
import { useFavoriteRestaurants } from '@/hooks/use-favorite-restaurants'
import type { RestaurantListItem } from '@/lib/api/restaurants'
import { useAuth } from '@/lib/auth-context'
import { PaginationState } from '@tanstack/react-table'
import { LayoutGrid, Table } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export default function FavoritesPage() {
	const router = useRouter()
	const { user, isLoading: isAuthLoading } = useAuth()
	const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('cards')
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})
	// 認証チェック
	React.useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push('/login')
		}
	}, [user, isAuthLoading, router])

	const {
		data: favoriteItems,
		isFetching: isFetchingFavoriteRestaurants,
		isLoading: isLoadingFavoriteRestaurants,
	} = useFavoriteRestaurants({
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
	})

	if (isAuthLoading || !user) {
		return null
	}

	if (isFetchingFavoriteRestaurants) {
		return <Spinner type='page-loading' />
	}

	return (
		<Section>
			{/* ページヘッダー */}
			<div className='mb-8'>
				<div className='mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
					<div className='flex items-center gap-2'>
						<Rating rate={1} max={1} className='[&_svg]:size-10! [&>div]:size-10!' />
						<h1
							className='text-2xl md:text-3xl font-bold text-zinc-900'
							onClick={() => {
								console.log(favoriteItems)
							}}
						>
							お気に入り
						</h1>
					</div>
					{favoriteItems?.data?.length && favoriteItems?.data?.length > 0 && (
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
			{favoriteItems?.data?.length === 0 ? (
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
							data={favoriteItems?.data?.map(item => item.restaurant as RestaurantListItem)!}
							total={favoriteItems?.meta?.total}
							isLoading={isLoadingFavoriteRestaurants}
							pagination={pagination}
							setPagination={setPagination}
						/>
					) : (
						<DataTable
							columns={favoriteRestaurantsColumns}
							data={favoriteItems?.data?.map(item => item.restaurant as RestaurantListItem)!}
							isLoading={isLoadingFavoriteRestaurants}
							pagination={pagination}
							setPagination={setPagination}
							total={favoriteItems?.meta?.total}
						/>
					)}
				</>
			)}
		</Section>
	)
}
