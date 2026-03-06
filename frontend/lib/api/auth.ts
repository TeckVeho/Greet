'use client'

import type { User } from '../types'
import { apiClient } from './client'

interface LoginRequest {
	email: string
	password: string
}

interface LoginResponse {
	token: string
	user: User
}

interface ApiSuccess<T> {
	success: true
	data: T
}

interface ApiErrorDetail {
	field?: string
	message: string
}

interface ApiErrorBody {
	code: string
	message: string
	details?: ApiErrorDetail[]
}

interface ApiErrorResponse {
	success: false
	error: ApiErrorBody
}

type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
	const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
	console.log('logined res:', res)
	console.log('---------------------------------------------------->')

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	// JWT トークンはここで保存しておく（AuthContext からも利用予定）
	if (typeof window !== 'undefined') {
		localStorage.setItem('token', res.data.data.token)
	}

	return res.data.data
}

export async function logoutApi(): Promise<void> {
	const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout')

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	if (typeof window !== 'undefined') {
		localStorage.removeItem('token')
	}
}

export async function fetchMeApi(): Promise<User> {
	const res = await apiClient.get<ApiResponse<User>>('/auth/me')

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}

	return res.data.data
}
