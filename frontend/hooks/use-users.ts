'use client'

import { listUsers, type UsersListResponse } from '@/lib/api/users'
import { useQuery } from '@tanstack/react-query'

export const useUsers = ({
	page,
	limit,
	search,
}: {
	page: number
	limit: number
	search: string
}) => {
	return useQuery<UsersListResponse>({
		queryKey: ['users', page, limit, search],
		queryFn: () => listUsers({ page, limit, search }),
		placeholderData: data => data,
	})
}
