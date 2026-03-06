"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { RestaurantTable } from "@/components/restaurant-table"
import { RestaurantCards } from "@/components/restaurant-cards"
import { mockRestaurants } from "@/lib/mock-data"
import { useFavorites } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import { Callout } from "@/components/ui/callout"

export default function FavoritesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { favorites } = useFavorites()
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("cards")

  // 認証チェック
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // お気に入りのレストランのみをフィルタリング
  const favoriteRestaurants = React.useMemo(() => {
    return mockRestaurants.filter((restaurant) =>
      favorites.includes(restaurant.id)
    )
  }, [favorites])

  if (isLoading || !user) {
    return null
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl">⭐</span>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">
                お気に入り
              </h1>
            </div>
            {favoriteRestaurants.length > 0 && (
              <div className="hidden md:flex items-center border border-zinc-200 rounded-md overflow-hidden self-end md:self-auto">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === "table"
                      ? "bg-zinc-900 text-white"
                      : "bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                  title="テーブル表示"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === "cards"
                      ? "bg-zinc-900 text-white"
                      : "bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                  title="カード表示"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            お気に入りに登録した飲食店を表示
          </p>
        </div>

        {/* お気に入りが空の場合 */}
        {favoriteRestaurants.length === 0 ? (
          <Callout icon="💡">
            <p className="font-medium">お気に入りがありません</p>
            <p className="mt-1 text-sm text-zinc-600">
              飲食店一覧、エリア別、またはジャンル別ページから、お気に入りに追加してください。
            </p>
          </Callout>
        ) : (
          <>
            {/* お気に入りレストランのテーブル/カード表示（モバイルは常にカード） */}
            {viewMode === "cards" || typeof window !== 'undefined' && window.innerWidth < 768 ? (
              <RestaurantCards restaurants={favoriteRestaurants} />
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-white">
                <RestaurantTable restaurants={favoriteRestaurants} />
              </div>
            )}

            {/* 件数表示 */}
            <div className="mt-4 text-sm text-zinc-500">
              {favoriteRestaurants.length} 件のお気に入り
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
