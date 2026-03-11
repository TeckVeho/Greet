'use client'

import { listRestaurants, RestaurantListResponse } from '@/lib/api/restaurants'
import { useQuery } from '@tanstack/react-query'

export const useRestaurants = ({
	page,
	limit,
	search,
}: {
	page: number
	limit: number
	search: string
}) => {
	return useQuery<RestaurantListResponse>({
		queryKey: ['restaurants', page, limit, search],
		queryFn: async () => await listRestaurants({ search, page, limit }),
		placeholderData: data => data,
	})
}
