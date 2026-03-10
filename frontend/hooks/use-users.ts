'use client'

import { listUsers, type UsersListResponse } from '@/lib/api/users'
import { useQuery } from '@tanstack/react-query'

export const useUsers = ({
	page,
	limit,
	search,
	companyId = undefined,
}: {
	page: number
	limit: number
	search: string
	companyId: string | undefined
}) => {
	return useQuery<UsersListResponse>({
		queryKey: ['users', page, limit, search, companyId],
		queryFn: () => listUsers({ page, limit, search, companyId }),
		placeholderData: data => data,
	})
}
