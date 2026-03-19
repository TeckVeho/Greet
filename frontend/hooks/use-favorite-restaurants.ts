import { FavoriteItem, listFavorites } from '@/lib/api/favorites'
import { ListMeta } from '@/lib/api/users'
import { useQuery } from '@tanstack/react-query'

export const useFavoriteRestaurants = ({ page, limit }: { page?: number; limit?: number }) => {
	return useQuery<{ meta: ListMeta; data: FavoriteItem[] }>({
		queryKey: ['favorites', page, limit],
		queryFn: async () => await listFavorites({ limit, page }),
		placeholderData: data => data,
	})
}
