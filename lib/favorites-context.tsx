"use client"

import * as React from "react"

interface FavoritesContextType {
  favorites: string[] // Restaurant IDs
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
}

const FavoritesContext = React.createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = React.useState<string[]>([])
  const [isInitialized, setIsInitialized] = React.useState(false)

  // LocalStorageから初期値を読み込み
  React.useEffect(() => {
    const stored = localStorage.getItem("favorites")
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e)
      }
    }
    setIsInitialized(true)
  }, [])

  // お気に入りが変更されたらLocalStorageに保存
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }, [favorites, isInitialized])

  const addFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const removeFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav !== id))
  }, [])

  const isFavorite = React.useCallback(
    (id: string) => {
      return favorites.includes(id)
    },
    [favorites]
  )

  const toggleFavorite = React.useCallback(
    (id: string) => {
      if (isFavorite(id)) {
        removeFavorite(id)
      } else {
        addFavorite(id)
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  )

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = React.useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
