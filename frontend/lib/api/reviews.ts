"use client"

import { apiClient } from "./client"
import type { ApiResponse } from "./types"
import type { UserSummary } from "../types"

export interface CreateReviewPayload {
  occasion: string
  result: string
  rating?: number
}

export interface ReviewResponse {
  id: string
  restaurantId: string
  occasion: string
  result: string
  rating: number | null
  authorId?: string | null
  author: UserSummary | null
  createdAt: string
}

export async function createReview(
  restaurantId: string,
  payload: CreateReviewPayload,
): Promise<ReviewResponse> {
  const res = await apiClient.post<ApiResponse<ReviewResponse>>(
    `/restaurants/${restaurantId}/reviews`,
    payload,
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data
}

export async function deleteReview(id: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/reviews/${id}`,
  )

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }
}

