'use client'

import { apiClient } from './client'
import type { ApiResponse } from './types'

export interface CompanyListItem {
	id: string
	name: string
	code: string
	icon?: string
	userCount: number
	createdAt: string
}

export interface CompaniesListMeta {
	total: number
	page: number
	limit: number
	totalPages: number
}

export interface CompaniesListResponse {
	companies: CompanyListItem[]
	meta: CompaniesListMeta
}

export async function listCompanies(): Promise<CompaniesListResponse> {
	const res = await apiClient.get<ApiResponse<CompanyListItem[]>>('/companies')

	if (!res.data.success) {
		throw new Error(res.data.error.message)
	}
	console.log(res)

	const companies = res.data.data

	return {
		companies,
		meta: {
			total: companies.length,
			page: 1,
			limit: companies.length,
			totalPages: 1,
		},
	}
}
