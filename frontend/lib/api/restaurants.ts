"use client"

import { apiClient } from "./client"
import type { ApiResponse } from "./types"

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
  totalPages: number
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
  sortOrder?: "asc" | "desc"
}

export async function listRestaurants(
  params: ListRestaurantsParams = {},
): Promise<{ data: RestaurantListItem[]; meta: RestaurantListMeta }> {
  const res = await apiClient.get<ApiResponse<RestaurantListItem[]>>(
    "/restaurants",
    { params },
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  // backend 側のページネーション実装が入るまではクライアント側で meta を組み立てる
  const meta: RestaurantListMeta = {
    total: res.data.data.length,
    page: 1,
    limit: res.data.data.length,
    totalPages: 1,
  }

  return {
    data: res.data.data,
    meta,
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
  const res = await apiClient.post<ApiResponse<RestaurantListItem>>(
    "/restaurants",
    payload,
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data
}

export async function getRestaurant(
  id: string,
): Promise<RestaurantDetail> {
  const res = await apiClient.get<ApiResponse<RestaurantDetail>>(
    `/restaurants/${id}`,
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data
}

export async function uploadRestaurantImage(
  file: File,
): Promise<string> {
  const formData = new FormData()
  formData.append("image", file)

  const res = await apiClient.post<ApiResponse<{ url: string }>>(
    "/restaurants/upload-image",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data.url
}

export async function deleteRestaurantImage(url: string): Promise<void> {
  const res = await apiClient.post<ApiResponse<{ message: string }>>(
    "/restaurants/delete-image",
    { url },
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }
}

export async function updateRestaurant(
  id: string,
  payload: Partial<CreateRestaurantPayload>,
): Promise<RestaurantListItem> {
  const res = await apiClient.put<ApiResponse<RestaurantListItem>>(
    `/restaurants/${id}`,
    payload,
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data
}

