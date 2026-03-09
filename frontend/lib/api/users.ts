"use client"

import { apiClient } from "./client"
import type { ApiResponse } from "./types"
import type { User } from "../types"

export interface UsersListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UsersListResponse {
  users: User[]
  meta: UsersListMeta
}

export async function listUsers(): Promise<UsersListResponse> {
  const res = await apiClient.get<ApiResponse<User[]>>("/users")

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  const users = res.data.data

  return {
    users,
    meta: {
      total: users.length,
      page: 1,
      limit: users.length,
      totalPages: 1,
    },
  }
}

export interface CreateUserPayload {
  email: string
  password: string
  name: string
  role?: "admin" | "user"
  department?: string
  icon?: string
}

export type UpdateUserPayload = Partial<CreateUserPayload>

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const res = await apiClient.post<ApiResponse<User>>("/users", payload)

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload)

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }

  return res.data.data
}

export async function deleteUser(id: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/${id}`)

  if (!res.data.success) {
    throw new Error(res.data.error.message)
  }
}

