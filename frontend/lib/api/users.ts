'use client'

import { toast } from 'sonner'
import { queryClient } from '../query-client'
import type { User } from '../types'
import { apiClient } from './client'
import type { ApiResponse } from './types'

export interface ListMeta {
	total: number
	page: number
	limit: number
	total_pages: number
	totalPages?: number
}

export interface UsersListResponse {
	users: User[]
	meta: ListMeta
}

export async function listUsers({
	limit,
	page,
	search,
	companyId,
}: {
	limit: number
	page: number
	search: string
	companyId?: string
}): Promise<UsersListResponse> {
	const res = await apiClient.get<ApiResponse<User[]>>('/users', {
		params: { page, limit, search: search.trim(), companyId },
	})

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	const users = res.data.data
	const meta = res.data.meta

	return {
		users,
		meta: {
			total: meta?.total ?? 0,
			page: meta?.page ?? page,
			limit: meta?.limit ?? limit,
			total_pages: meta?.total_pages ?? meta?.totalPages ?? 0,
			totalPages: meta?.totalPages ?? meta?.total_pages ?? 0,
		},
	}
}

export interface CreateUserPayload {
	email: string
	password: string
	name: string
	companyId: string
	role?: 'admin' | 'user'
	department?: string
	icon?: string
}

export type UpdateUserPayload = Partial<CreateUserPayload>

export async function createUser(payload: CreateUserPayload): Promise<User> {
	const res = await apiClient.post<ApiResponse<User>>('/users', payload)

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
	toast.success('ユーザー情報を更新しました。')
	document.getElementById('dialog-update-user-close-button')?.click()
	queryClient.invalidateQueries({ queryKey: ['users'] })
	return res.data.data
}

export async function deleteUser(id: string): Promise<void> {
	const res = await apiClient.delete<ApiResponse<{ message: string; success: boolean }>>(
		`/users/${id}`,
	)

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}
	toast.success('ユーザーを削除しました。')
	document.getElementById('dialog-warning-close-button')?.click()
	queryClient.invalidateQueries({ queryKey: ['users'] })
}
