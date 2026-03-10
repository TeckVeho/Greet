export interface Meta {
	total: number
	page: number
	limit: number
	total_pages: number
}
export interface ApiSuccess<T> {
	success: true
	data: T
	meta?: Meta
}

export interface ApiErrorDetail {
	field?: string
	message: string
}

export interface ApiErrorBody {
	code: string
	message: string
	details?: ApiErrorDetail[]
}

export interface ApiErrorResponse {
	success: false
	error: ApiErrorBody
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse
