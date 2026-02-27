import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Restaurant } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SortOption =
  | "createdAt_desc"
  | "createdAt_asc"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "reviews_desc"
  | "rating_desc"

/** priceRange から先頭の数値（円）を抽出。例: "¥10,000~¥20,000" -> 10000 */
function parsePriceLow(priceRange: string): number {
  const match = priceRange.match(/¥?([\d,]+)/)
  if (!match) return 0
  return parseInt(match[1].replace(/,/g, ""), 10) || 0
}

/** レビューの平均評価（rating があるもののみ）。なしなら 0 */
function averageRating(restaurant: Restaurant): number {
  const withRating = restaurant.reviews.filter((r) => r.rating != null)
  if (withRating.length === 0) return 0
  const sum = withRating.reduce((acc, r) => acc + (r.rating ?? 0), 0)
  return sum / withRating.length
}

export function sortRestaurants(
  restaurants: Restaurant[],
  sort: SortOption
): Restaurant[] {
  const arr = [...restaurants]
  switch (sort) {
    case "createdAt_desc":
      return arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case "createdAt_asc":
      return arr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case "name_asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name, "ja"))
    case "name_desc":
      return arr.sort((a, b) => b.name.localeCompare(a.name, "ja"))
    case "price_asc":
      return arr.sort(
        (a, b) => parsePriceLow(a.priceRange) - parsePriceLow(b.priceRange)
      )
    case "price_desc":
      return arr.sort(
        (a, b) => parsePriceLow(b.priceRange) - parsePriceLow(a.priceRange)
      )
    case "reviews_desc":
      return arr.sort(
        (a, b) => (b.reviews?.length ?? 0) - (a.reviews?.length ?? 0)
      )
    case "rating_desc":
      return arr.sort(
        (a, b) => averageRating(b) - averageRating(a)
      )
    default:
      return arr
  }
}
