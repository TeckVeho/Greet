'use client'
import { apiClient } from '@/lib/api/client'
import { User } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'

export const useUsers = () => {
	return useQuery({
		queryKey: ['users'],
		queryFn: async () => {
			const response = (
				await apiClient.get<{ data: User[]; statusCode: number; success: boolean }>('users')
			).data

			return response
		},
	})
}
