"use client"

import { apiClient } from "./client"
import type { ApiResponse } from "./types"

export interface FavoriteItem {
  id: string
  restaurant: {
    id: string
    name: string
    area: string
    genres: string[]
    priceRange: string
    icon?: string
    reviewCount: number
    averageRating: number | null
  }
  createdAt: string
}

export async function listFavorites(): Promise<FavoriteItem[]> {
  const res = await apiClient.get<ApiResponse<FavoriteItem[]>>(
    "/favorites",
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data
}

export async function addFavorite(
  restaurantId: string,
): Promise<{
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
  >("/favorites", { restaurantId })

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data
}

export async function removeFavorite(
  restaurantId: string,
): Promise<void> {
  const res = await apiClient.delete<
    ApiResponse<{ message: string }>
  >(`/favorites/${restaurantId}`)

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }
}

