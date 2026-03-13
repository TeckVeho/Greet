'use client'

import { Review } from '../types'
import { SortOption } from '../utils'
import { apiClient } from './client'
import type { ApiResponse } from './types'

export interface RestaurantListItem {
	id: string
	name: string
	area: string
	genres: string[]
	hasPrivateRoom: boolean
	priceRange: string
	address: string
	phone: string
	url?: string
	smokingAllowed: boolean
	coverImage?: string
	icon: string
	reviewCount: number
	averageRating: number | null
	reviews: Review[]
	createdBy: {
		id: string
		name: string
		icon?: string
	}
	createdAt: Date
	updatedAt: Date
}

export interface RestaurantListMeta {
	total: number
	page: number
	limit: number
	total_pages: number
}
export interface RestaurantListResponse {
	data: RestaurantListItem[]
	meta: RestaurantListMeta
}

export interface ListRestaurantsParams {
	page?: number
	limit?: number
	search?: string
	areas?: string[]
	genres?: string[]
	hasPrivateRoom?: boolean
	smokingAllowed?: boolean
	priceRanges?: string[]
	sort?: SortOption
}

export async function listRestaurants(
	params: ListRestaurantsParams = {},
): Promise<RestaurantListResponse> {
	const res = await apiClient.get<ApiResponse<RestaurantListItem[]>>('/restaurants', {
		params,
		paramsSerializer: params => {
			const searchParams = new URLSearchParams()
			for (const [key, value] of Object.entries(params)) {
				if (Array.isArray(value)) {
					value.forEach(v => searchParams.append(key, v))
				} else {
					searchParams.set(key, value)
				}
			}
			return searchParams.toString()
		},
	})

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}
	const restaurants = res.data.data
	const meta = res.data.meta

	return {
		data: restaurants,
		meta: {
			total: meta?.total ?? 0,
			page: meta?.page ?? params.page ?? 1,
			limit: meta?.limit ?? params.limit ?? 10,
			total_pages: meta?.total_pages ?? 0,
		},
	}
}

export interface CreateRestaurantPayload {
	name: string
	area: string
	hasPrivateRoom: boolean
	smokingAllowed: boolean
	priceRange: string
	address?: string
	phone?: string
	url?: string
	coverImage?: string
	icon?: string
	genres?: string[]
}

export async function createRestaurant(
	payload: CreateRestaurantPayload,
): Promise<RestaurantListItem> {
	const res = await apiClient.post<ApiResponse<RestaurantListItem>>('/restaurants', payload)

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	return res.data.data
}

export async function getRestaurant(id: string): Promise<RestaurantListItem> {
	const res = await apiClient.get<ApiResponse<RestaurantListItem>>(`/restaurants/${id}`)

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	return res.data.data
}

export async function uploadRestaurantImage(file: File): Promise<string> {
	const formData = new FormData()
	formData.append('image', file)

	const res = await apiClient.post<ApiResponse<{ url: string }>>(
		'/restaurants/upload-image',
		formData,
		{ headers: { 'Content-Type': 'multipart/form-data' } },
	)

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	return res.data.data.url
}

export async function deleteRestaurantImage(url: string): Promise<void> {
	const res = await apiClient.post<ApiResponse<{ message: string }>>('/restaurants/delete-image', {
		url,
	})

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}
}

export async function updateRestaurant(
	id: string,
	payload: Partial<CreateRestaurantPayload>,
): Promise<RestaurantListItem> {
	const res = await apiClient.put<ApiResponse<RestaurantListItem>>(`/restaurants/${id}`, payload)

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	return res.data.data
}
