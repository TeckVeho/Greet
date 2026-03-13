'use client'

import { listRestaurants, RestaurantListResponse } from '@/lib/api/restaurants'
import { SortOption } from '@/lib/utils'
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
	sort = 'createdAt_desc',
}: {
	page?: number
	limit?: number
	search?: string
	areas?: string[]
	genres?: string[]
	hasPrivateRoom?: boolean
	smokingAllowed?: boolean
	priceRanges?: string[]
	sort?: SortOption
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
			sort,
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
				sort,
			}),
		placeholderData: data => data,
	})
}
