'use client'

import {
	deleteRestaurant,
	getRestaurant,
	listRestaurants,
	RestaurantListResponse,
} from '@/lib/api/restaurants'
import { queryClient } from '@/lib/query-client'
import { SortOption } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

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

export const useRestaurantsById = (id: string) => {
	return useQuery({
		queryKey: ['restaurant', id],
		queryFn: async () => await getRestaurant(id),
	})
}
export const useDeleteRestaurant = (id: string) => {
	const router = useRouter()
	return useMutation({
		mutationKey: ['deleteRestaurant', id],
		mutationFn: async () => await deleteRestaurant(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['restaurants'] })
			router.push('/')
		},
	})
}
