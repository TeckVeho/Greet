'use client'

import { useQuery } from '@tanstack/react-query'
import { listUsers, type UsersListResponse } from '@/lib/api/users'

export const useUsers = () => {
	return useQuery<UsersListResponse>({
		queryKey: ['users'],
		queryFn: () => listUsers(),
	})
}
