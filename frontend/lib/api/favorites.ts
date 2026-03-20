'use client'

import { apiClient } from './client'
import type { RestaurantListItem } from './restaurants'
import type { ApiResponse } from './types'
import { ListMeta } from './users'

export interface FavoriteItem {
	id: string
	restaurant: RestaurantListItem
	createdAt: string
}
export interface favoriteRestaurantListResponse {
	data: FavoriteItem[]
	meta: ListMeta
}
export async function listFavorites({
	limit = 10,
	page = 1,
}: {
	limit?: number
	page?: number
}): Promise<favoriteRestaurantListResponse> {
	const res = await apiClient.get<ApiResponse<FavoriteItem[]>>('/favorites')

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}
	const meta = res.data.meta
	return {
		data: res.data.data,
		meta: {
			total: meta?.total ?? 0,
			page: meta?.page ?? page,
			limit: meta?.limit ?? limit,
			total_pages: meta?.total_pages ?? meta?.totalPages ?? 0,
			totalPages: meta?.totalPages ?? meta?.total_pages ?? 0,
		},
	}
}

export async function addFavorite(restaurantId: string): Promise<{
	id: string
	userId: string
	restaurantId: string
	createdAt: string
}> {
	const res = await apiClient.post<
		ApiResponse<{
			id: string
			userId: string
			restaurantId: string
			createdAt: string
		}>
	>('/favorites', { restaurantId })

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	return res.data.data
}

export async function removeFavorite(restaurantId: string): Promise<void> {
	const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/favorites/${restaurantId}`)

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}
}
