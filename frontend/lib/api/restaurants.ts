'use client'

import { Restaurant } from '../types'
import { apiClient } from './client'
import type { ApiResponse } from './types'

export interface RestaurantListItem {
	id: string
	name: string
	area: string
	genres: string[]
	hasPrivateRoom: boolean
	priceRange: string
	address?: string
	phone?: string
	url?: string
	smokingAllowed: boolean
	coverImage?: string
	icon?: string
	reviewCount: number
	averageRating: number | null
	createdBy: {
		id: string
		name: string
		icon?: string
	}
	createdAt: string
	updatedAt: string
}

export interface RestaurantListMeta {
	total: number
	page: number
	limit: number
	total_pages: number
}
export interface RestaurantListResponse {
	data: Restaurant[]
	meta: RestaurantListMeta
}

export interface RestaurantDetail extends RestaurantListItem {
	reviews: Array<{
		id: string
		occasion: string
		result: string
		rating: number | null
		author: {
			id: string
			name: string
			icon?: string
		}
		createdAt: string
	}>
	isFavorite: boolean
}

export interface ListRestaurantsParams {
	page?: number
	limit?: number
	search?: string
	area?: string[]
	genre?: string[]
	hasPrivateRoom?: boolean
	smokingAllowed?: boolean
	priceRange?: string[]
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}

export async function listRestaurants(
	params: ListRestaurantsParams = {},
): Promise<RestaurantListResponse> {
	const res = await apiClient.get<ApiResponse<Restaurant[]>>('/restaurants', { params })

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

export async function getRestaurant(id: string): Promise<RestaurantDetail> {
	const res = await apiClient.get<ApiResponse<RestaurantDetail>>(`/restaurants/${id}`)

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
