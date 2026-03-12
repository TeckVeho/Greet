"use client"

import * as React from "react"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-context"
import {
  addFavorite as addFavoriteApi,
  listFavorites as listFavoritesApi,
  removeFavorite as removeFavoriteApi,
} from "./api/favorites"

interface FavoritesContextType {
  favorites: string[] // Restaurant IDs
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
}

const FavoritesContext = React.createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const queryClient = useQueryClient()
  const [favorites, setFavorites] = React.useState<string[]>([])

  // ログインユーザーのお気に入り一覧をAPIから取得
  React.useEffect(() => {
    const loadFavorites = async () => {
      if (isLoading) {
        return
      }

      if (!user) {
        setFavorites([])
        return
      }

      const token = typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null

      if (!token) {
        setFavorites([])
        logout()
        return
      }

      try {
        const items = await listFavoritesApi()
        setFavorites(items.map((item) => item.restaurant.id))
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          setFavorites([])
          logout()
          return
        }

        console.error("Failed to load favorites from API", e)
      }
    }

    void loadFavorites()
  }, [isLoading, user, logout])

  const addFavorite = React.useCallback((id: string) => {
    // 楽観的更新
    setFavorites((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })

    void addFavoriteApi(id)
      .then(() => {
        // お気に入りページのクエリキャッシュを無効化して最新データを取得
        void queryClient.invalidateQueries({ queryKey: ["favorites"] })
      })
      .catch((e) => {
        console.error("Failed to add favorite", e)
        // ロールバック
        setFavorites((prev) => prev.filter((fav) => fav !== id))
      })
  }, [queryClient])

  const removeFavorite = React.useCallback((id: string) => {
    // 楽観的更新
    setFavorites((prev) => prev.filter((fav) => fav !== id))

    void removeFavoriteApi(id)
      .then(() => {
        void queryClient.invalidateQueries({ queryKey: ["favorites"] })
      })
      .catch((e) => {
        console.error("Failed to remove favorite", e)
        // ロールバック（IDを戻す）
        setFavorites((prev) => {
          if (prev.includes(id)) return prev
          return [...prev, id]
        })
      })
  }, [queryClient])

  const isFavorite = React.useCallback(
    (id: string) => {
      return favorites.includes(id)
    },
    [favorites],
  )

  const toggleFavorite = React.useCallback(
    (id: string) => {
      if (isFavorite(id)) {
        removeFavorite(id)
      } else {
        addFavorite(id)
      }
    },
    [isFavorite, addFavorite, removeFavorite],
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
