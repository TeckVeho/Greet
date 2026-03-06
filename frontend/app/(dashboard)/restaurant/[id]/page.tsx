"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import { Callout } from "@/components/ui/callout"
import { Button } from "@/components/ui/button"
import { ReviewFormDialog } from "@/components/review-form-dialog"
import { mockRestaurants, addReview } from "@/lib/mock-data"
import { mockUsers } from "@/lib/mock-users"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import type { Review } from "@/lib/types"

export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [restaurant, setRestaurant] = React.useState(
    mockRestaurants.find((r) => r.id === params.id)
  )
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false)

  // 認証チェック
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // レビュー投稿処理
  const handleReviewSubmit = (reviewData: Omit<Review, "id" | "createdAt">) => {
    if (!restaurant) return

    const newReview: Review = {
      id: `r${Date.now()}`,
      ...reviewData,
      createdAt: new Date(),
    }

    // mock-dataに追加
    const success = addReview(restaurant.id, newReview)
    
    if (success) {
      // ローカル状態を更新してUIを即座に反映
      setRestaurant({
        ...restaurant,
        reviews: [...restaurant.reviews, newReview],
        updatedAt: new Date(),
      })
      setIsReviewDialogOpen(false)
    }
  }

  if (isLoading || !user) {
    return null
  }

  if (!restaurant) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-900">
              飲食店が見つかりません
            </h2>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => router.push("/")}
            >
              一覧に戻る
            </Button>
          </div>
        </div>
      </AppLayout>
    )
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

  return (
    <AppLayout>
      {/* カバー画像 */}
      <div className="relative h-40 md:h-60 w-full bg-gradient-to-br from-zinc-100 to-zinc-200 overflow-hidden">
        {restaurant.coverImage ? (
          <Image
            src={restaurant.coverImage}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-8xl">
            {restaurant.icon}
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        {/* アイコンとタイトル */}
        <div className="-mt-12 mb-4">
          <div className="mb-4 flex h-16 w-16 md:h-24 md:w-24 items-center justify-center rounded-lg bg-white text-4xl md:text-5xl shadow-md">
            {restaurant.icon}
          </div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl md:text-4xl font-bold text-zinc-900">
              {restaurant.name}
            </h1>
            <button
              onClick={() => toggleFavorite(restaurant.id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
              title={isFavorite(restaurant.id) ? "お気に入りから削除" : "お気に入りに追加"}
            >
              <span className="text-2xl">
                {isFavorite(restaurant.id) ? "⭐" : "☆"}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="area">{restaurant.area}</Badge>
            {restaurant.genres.map((genre, idx) => (
              <Badge key={idx} variant={getGenreVariant(genre)}>
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* プロパティセクション */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          <div className="flex items-start gap-3">
            <div className="w-24 flex-shrink-0 text-sm font-medium text-zinc-500">
              住所
            </div>
            <div className="flex-1 text-sm text-zinc-900">
              {restaurant.address}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-24 flex-shrink-0 text-sm font-medium text-zinc-500">
              電話番号
            </div>
            <div className="flex-1 text-sm text-zinc-900">
              {restaurant.phone}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-24 flex-shrink-0 text-sm font-medium text-zinc-500">
              価格帯
            </div>
            <div className="flex-1 text-sm font-semibold text-zinc-900">
              {restaurant.priceRange}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-24 flex-shrink-0 text-sm font-medium text-zinc-500">
              個室
            </div>
            <div className="flex-1 text-sm text-zinc-900">
              {restaurant.hasPrivateRoom ? "あり" : "なし"}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-24 flex-shrink-0 text-sm font-medium text-zinc-500">
              喫煙
            </div>
            <div className="flex-1 text-sm text-zinc-900">
              {restaurant.smokingAllowed ? "可" : "不可"}
            </div>
          </div>

          {restaurant.url && (
            <div className="flex items-start gap-3">
              <div className="w-24 flex-shrink-0 text-sm font-medium text-zinc-500">
                地図
              </div>
              <div className="flex-1">
                <a
                  href={restaurant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Google Mapで見る
                </a>
              </div>
            </div>
          )}
        </div>

        {/* レビューセクション */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900">
              利用レビュー
            </h2>
            <Button onClick={() => setIsReviewDialogOpen(true)}>
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              レビューを書く
            </Button>
          </div>

          {restaurant.reviews.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center">
              <p className="text-sm text-zinc-500 mb-3">
                まだレビューがありません
              </p>
              <Button
                variant="secondary"
                onClick={() => setIsReviewDialogOpen(true)}
              >
                最初のレビューを投稿する
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {restaurant.reviews.map((review) => {
                const reviewUser = mockUsers.find((u) => u.id === review.authorId)
                const nameIcon = (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-700">
                    {review.author.charAt(0)}
                  </div>
                )
                return (
                  <Callout key={review.id} icon={nameIcon}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-semibold text-zinc-900">
                            {review.author}
                          </div>
                          {reviewUser?.company && (
                            <span className="text-xs text-zinc-500">
                              {reviewUser.company.name}
                            </span>
                          )}
                          {reviewUser?.department && (
                            <span className="text-xs text-zinc-400">
                              {reviewUser.department}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {review.createdAt.toLocaleDateString("ja-JP")}
                        </div>
                      </div>
                      <div className="text-sm text-zinc-700">
                        <div className="mb-2">
                          <span className="font-medium text-zinc-900">
                            利用シーン：
                          </span>
                          {review.occasion}
                        </div>
                        <div>
                          <span className="font-medium text-zinc-900">
                            結果：
                          </span>
                          {review.result}
                        </div>
                      </div>
                      {review.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={cn(
                                "text-sm",
                                i < review.rating!
                                  ? "text-yellow-400"
                                  : "text-zinc-300"
                              )}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Callout>
                )
              })}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="mb-12 flex gap-3">
          <Button variant="secondary" onClick={() => router.push("/")}>
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
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            一覧に戻る
          </Button>
        </div>
      </div>

      {/* レビュー投稿ダイアログ */}
      {restaurant && (
        <ReviewFormDialog
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          restaurantId={restaurant.id}
          onSubmit={handleReviewSubmit}
        />
      )}
    </AppLayout>
  )
}
