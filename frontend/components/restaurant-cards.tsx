"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/lib/favorites-context"
import type { RestaurantListItem } from "@/lib/api/restaurants"
import { areaLabel, genreLabel, priceRangeLabel } from "@/lib/constants"

const getGenreVariant = (genreKey: string): "sushi" | "french" | "italian" | "yakiniku" | "japanese" | "chinese" | "genre" => {
  switch (genreKey) {
    case "SUSHI":
      return "sushi"
    case "FRENCH":
      return "french"
    case "ITALIAN":
      return "italian"
    case "YAKINIKU":
      return "yakiniku"
    case "WASHOKU":
    case "TEMPURA":
    case "KAPPO":
      return "japanese"
    case "CHINESE":
      return "chinese"
    default:
      return "genre"
  }
}

interface RestaurantCardsProps {
  restaurants: RestaurantListItem[]
}

export function RestaurantCards({ restaurants }: RestaurantCardsProps) {
  const { isFavorite, toggleFavorite } = useFavorites()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {restaurants.map((restaurant) => {
        const isFav = isFavorite(restaurant.id)
        return (
          <div
            key={restaurant.id}
            className="relative group"
          >
            <Link
              href={`/restaurant/${restaurant.id}`}
              className="block rounded-lg border border-zinc-200 bg-white overflow-hidden transition-all hover:shadow-md hover:scale-[1.02]"
            >
              {/* 画像 */}
              <div className="relative w-full h-48 bg-gradient-to-br from-zinc-50 to-zinc-100">
                {restaurant.coverImage ? (
                  <Image
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {restaurant.icon}
                  </div>
                )}
                
                {/* お気に入りボタン */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleFavorite(restaurant.id)
                  }}
                  className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors z-10"
                  title={isFav ? "お気に入りから削除" : "お気に入りに追加"}
                >
                  <span className="text-lg">
                    {isFav ? "⭐" : "☆"}
                  </span>
                </button>
              </div>

              {/* コンテンツエリア */}
              <div className="p-5">
                {/* 店名とアイコン */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{restaurant.icon}</span>
                  <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1">
                    {restaurant.name}
                  </h3>
                </div>

                {/* エリア */}
                <div className="mb-3">
                  <Badge variant="area">{areaLabel(restaurant.area)}</Badge>
                </div>

                {/* ジャンル */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {restaurant.genres.map((genre, idx) => (
                    <Badge key={idx} variant={getGenreVariant(genre)}>
                      {genreLabel(genre)}
                    </Badge>
                  ))}
                </div>

                {/* 価格帯 */}
                <div className="mb-3 text-sm text-zinc-700">
                  <span className="font-medium">価格帯:</span> {priceRangeLabel(restaurant.priceRange)}
                </div>

                {/* 個室・喫煙情報 */}
                <div className="flex items-center gap-4 text-sm text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    {restaurant.hasPrivateRoom ? (
                      <>
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
                          className="text-green-600"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="text-green-700">個室あり</span>
                      </>
                    ) : (
                      <>
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
                          className="text-zinc-300"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                        <span className="text-zinc-400">個室なし</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {restaurant.smokingAllowed ? (
                      <span className="text-zinc-600">喫煙可</span>
                    ) : (
                      <span className="text-zinc-400">禁煙</span>
                    )}
                  </div>
                </div>

                {/* レビュー情報 */}
                <div className="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                  <span>
                    レビュー {restaurant.reviewCount} 件
                  </span>
                  {restaurant.averageRating != null && (
                    <span className="ml-3">
                      平均評価 {restaurant.averageRating.toFixed(1)} / 5
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
