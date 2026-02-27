"use client"

import * as React from "react"
import Link from "next/link"
import { Restaurant } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/lib/favorites-context"
import { mockUsers } from "@/lib/mock-users"

interface RestaurantTableProps {
  restaurants: Restaurant[]
}

const getGenreVariant = (genre: string): "sushi" | "french" | "italian" | "yakiniku" | "japanese" | "chinese" | "genre" => {
  switch (genre) {
    case "寿司":
      return "sushi"
    case "フレンチ":
      return "french"
    case "イタリアン":
      return "italian"
    case "焼肉":
      return "yakiniku"
    case "和食":
    case "天ぷら":
    case "割烹":
      return "japanese"
    case "中華":
      return "chinese"
    default:
      return "genre"
  }
}

export function RestaurantTable({ restaurants }: RestaurantTableProps) {
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null)
  const { isFavorite, toggleFavorite } = useFavorites()

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 w-12">
              
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
              店名
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
              エリア
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
              ジャンル
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500">
              個室
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
              価格帯
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500">
              喫煙
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
              利用者
            </th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => {
            const isFav = isFavorite(restaurant.id)
            return (
              <tr
                key={restaurant.id}
                onMouseEnter={() => setHoveredRow(restaurant.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={cn(
                  "border-b border-zinc-100 transition-colors",
                  hoveredRow === restaurant.id ? "bg-zinc-50" : "bg-white"
                )}
              >
                <td className="px-2 py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleFavorite(restaurant.id)
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100 transition-colors"
                    title={isFav ? "お気に入りから削除" : "お気に入りに追加"}
                  >
                    <span className="text-base">
                      {isFav ? "⭐" : "☆"}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/restaurant/${restaurant.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-blue-600"
                  >
                    <span className="text-lg">{restaurant.icon}</span>
                    <span>{restaurant.name}</span>
                  </Link>
                </td>
              <td className="px-4 py-3">
                <Badge variant="area">{restaurant.area}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {restaurant.genres.map((genre, idx) => (
                    <Badge key={idx} variant={getGenreVariant(genre)}>
                      {genre}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center">
                  {restaurant.hasPrivateRoom ? (
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
                  ) : (
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
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-700">
                {restaurant.priceRange}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center">
                  {restaurant.smokingAllowed ? (
                    <span className="text-xs text-zinc-600">可</span>
                  ) : (
                    <span className="text-xs text-zinc-400">不可</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {restaurant.reviews && restaurant.reviews.length > 0 && (
                  <div className="flex -space-x-2">
                    {Array.from(new Set(restaurant.reviews.map(r => r.authorId))).slice(0, 5).map((authorId, idx) => {
                      const user = mockUsers.find(u => u.id === authorId)
                      if (!user) return null
                      return (
                        <div
                          key={idx}
                          className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 border-2 border-white ring-1 ring-zinc-200 text-xs font-medium text-zinc-700"
                          title={user.name}
                        >
                          {user.name.charAt(0)}
                        </div>
                      )
                    })}
                    {Array.from(new Set(restaurant.reviews.map(r => r.authorId))).length > 5 && (
                      <div
                        className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 border-2 border-white ring-1 ring-zinc-200 text-xs text-zinc-600"
                      >
                        +{Array.from(new Set(restaurant.reviews.map(r => r.authorId))).length - 5}
                      </div>
                    )}
                  </div>
                )}
              </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
