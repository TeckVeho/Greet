'use client'

import { listRestaurants, RestaurantListResponse } from '@/lib/api/restaurants'
import { useQuery } from '@tanstack/react-query'

export const useRestaurants = ({
	page,
	limit,
	search,
	areas,
	genres,
	hasPrivateRoom,
	smokingAllowed,
	priceRanges = undefined,
}: {
	page?: number
	limit?: number
	search?: string
	areas?: string[]
	genres?: string[]
	hasPrivateRoom?: boolean
	smokingAllowed?: boolean
	priceRanges?: string[]
}) => {
	return useQuery<RestaurantListResponse>({
		queryKey: [
			'restaurants',
			page,
			limit,
			search,
			areas,
			genres,
			hasPrivateRoom,
			smokingAllowed,
			priceRanges,
		],
		queryFn: async () =>
			await listRestaurants({
				search,
				page,
				limit,
				areas,
				genres,
				hasPrivateRoom,
				smokingAllowed,
				priceRanges,
			}),
		placeholderData: data => data,
	})
}
