"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { RestaurantTable } from "@/components/restaurant-table"
import { RestaurantCards } from "@/components/restaurant-cards"
import { mockRestaurants } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { sortRestaurants, type SortOption } from "@/lib/utils"
import type { Genre } from "@/lib/types"

// ジャンルごとのカラー定義
const genreColors: Record<Genre, string> = {
  "寿司": "bg-red-100 text-red-700 hover:bg-red-200",
  "フレンチ": "bg-purple-100 text-purple-700 hover:bg-purple-200",
  "イタリアン": "bg-green-100 text-green-700 hover:bg-green-200",
  "和食": "bg-amber-100 text-amber-700 hover:bg-amber-200",
  "中華": "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  "鉄板焼き": "bg-orange-100 text-orange-700 hover:bg-orange-200",
  "焼肉": "bg-rose-100 text-rose-700 hover:bg-rose-200",
  "天ぷら": "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
  "割烹": "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  "その他": "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
}

export default function GenrePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [selectedGenre, setSelectedGenre] = React.useState<Genre | "all">("all")
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("cards")
  const [sortOption, setSortOption] = React.useState<SortOption>("createdAt_desc")

  // 認証チェック
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // ジャンルごとにグループ化（1つのレストランが複数ジャンルに属する可能性あり）
  const restaurantsByGenre = React.useMemo(() => {
    const grouped = new Map<Genre, typeof mockRestaurants>()
    mockRestaurants.forEach((restaurant) => {
      restaurant.genres.forEach((genre) => {
        const g = genre as Genre
        if (!grouped.has(g)) {
          grouped.set(g, [])
        }
        grouped.get(g)?.push(restaurant)
      })
    })
    return grouped
  }, [])

  // ジャンルの一覧を取得（件数が多い順）
  const genres = React.useMemo(() => {
    return Array.from(restaurantsByGenre.keys()).sort((a, b) => {
      const countA = restaurantsByGenre.get(a)?.length || 0
      const countB = restaurantsByGenre.get(b)?.length || 0
      return countB - countA
    })
  }, [restaurantsByGenre])

  // フィルタリング・並び替えされたレストラン
  const displayedRestaurants = React.useMemo(() => {
    const list =
      selectedGenre === "all"
        ? mockRestaurants
        : restaurantsByGenre.get(selectedGenre) || []
    return sortRestaurants(list, sortOption)
  }, [selectedGenre, restaurantsByGenre, sortOption])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl md:text-3xl">🍴</span>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">
              ジャンル別
            </h1>
          </div>
          <p className="text-sm text-zinc-500">
            料理ジャンルごとに飲食店を絞り込んで表示
          </p>
        </div>

        {/* ジャンルフィルターとビュー切り替え */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
            <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre("all")}
              className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedGenre === "all"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              すべて
              <span className="ml-1.5 text-xs opacity-70">
                ({mockRestaurants.length})
              </span>
            </button>
            {genres.map((genre) => {
              const count = restaurantsByGenre.get(genre)?.length || 0
              const colorClass = genreColors[genre] || genreColors["その他"]
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedGenre === genre
                      ? "bg-zinc-900 text-white"
                      : colorClass
                  }`}
                >
                  {genre}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({count})
                  </span>
                </button>
              )
            })}
            </div>
            {/* 並び替え・ビュー切り替え (モバイルでは非表示) */}
            <div className="hidden md:flex items-center gap-2 self-end md:self-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                aria-label="並び替え"
              >
                <option value="createdAt_desc">登録日（新しい順）</option>
                <option value="createdAt_asc">登録日（古い順）</option>
                <option value="name_asc">店名（あいうえお順）</option>
                <option value="name_desc">店名（逆順）</option>
                <option value="price_asc">価格帯（低い順）</option>
                <option value="price_desc">価格帯（高い順）</option>
                <option value="reviews_desc">レビュー件数（多い順）</option>
                <option value="rating_desc">平均評価（高い順）</option>
              </select>
              <div className="flex items-center border border-zinc-200 rounded-md overflow-hidden">
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
            </div>
          </div>
        </div>

        {/* ジャンルごとのセクション表示（すべて選択時のみ） */}
        {selectedGenre === "all" ? (
          <div className="space-y-8">
            {genres.map((genre) => {
              const restaurants = sortRestaurants(
                restaurantsByGenre.get(genre) || [],
                sortOption
              )
              return (
                <div key={genre}>
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-zinc-900">
                      {genre}
                    </h2>
                    <Badge variant="default">
                      {restaurants.length}件
                    </Badge>
                  </div>
                  {/* モバイルは常にカード表示 */}
                  {viewMode === "cards" || typeof window !== 'undefined' && window.innerWidth < 768 ? (
                    <RestaurantCards restaurants={restaurants} />
                  ) : (
                    <div className="rounded-lg border border-zinc-200 bg-white">
                      <RestaurantTable restaurants={restaurants} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <>
            {/* 特定ジャンルのテーブル/カード表示（モバイルは常にカード） */}
            {viewMode === "cards" || typeof window !== 'undefined' && window.innerWidth < 768 ? (
              <RestaurantCards restaurants={displayedRestaurants} />
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-white">
                <RestaurantTable restaurants={displayedRestaurants} />
              </div>
            )}

            {/* 件数表示 */}
            <div className="mt-4 text-sm text-zinc-500">
              {displayedRestaurants.length} 件の飲食店
            </div>
          </>
        )}
      </div>
  )
}
