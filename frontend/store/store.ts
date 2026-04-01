import { create } from 'zustand'
type Store = {
	restaurantsViewFormat: 'table' | 'cards'
	setRestaurantsViewFormat: (format: 'table' | 'cards') => void
	favoriteRestaurantsViewFormat: 'table' | 'cards'
	setFavoriteRestaurantsViewFormat: (format: 'table' | 'cards') => void
	genreViewFormat: 'table' | 'cards'
	setGenreViewFormat: (format: 'table' | 'cards') => void
	areaViewFormat: 'table' | 'cards'
	setAreaViewFormat: (format: 'table' | 'cards') => void
}
export const useStore = create<Store>(set => ({
	restaurantsViewFormat: 'table',
	setRestaurantsViewFormat: format => set(() => ({ restaurantsViewFormat: format })),
	favoriteRestaurantsViewFormat: 'table',
	setFavoriteRestaurantsViewFormat: format =>
		set(() => ({ favoriteRestaurantsViewFormat: format })),
	genreViewFormat: 'table',
	setGenreViewFormat: format => set(() => ({ genreViewFormat: format })),
	areaViewFormat: 'table',
	setAreaViewFormat: format => set(() => ({ areaViewFormat: format })),
}))
