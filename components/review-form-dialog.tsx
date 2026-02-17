"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Review } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"

interface ReviewFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantId: string
  onSubmit: (review: Omit<Review, "id" | "createdAt">) => void
}

export function ReviewFormDialog({
  open,
  onOpenChange,
  restaurantId,
  onSubmit,
}: ReviewFormDialogProps) {
  const { user } = useAuth()
  const [formData, setFormData] = React.useState({
    occasion: "",
    result: "",
    rating: 5,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      console.error("User not authenticated")
      return
    }

    // レビューデータを作成
    const reviewData: Omit<Review, "id" | "createdAt"> = {
      authorId: user.id,
      author: user.name,
      occasion: formData.occasion,
      result: formData.result,
      rating: formData.rating,
    }

    onSubmit(reviewData)
    
    // フォームをリセット
    setFormData({
      occasion: "",
      result: "",
      rating: 5,
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>レビューを投稿</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-5">
              {/* 利用シーン */}
              <div className="space-y-2">
                <Label htmlFor="occasion">
                  利用シーン <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="occasion"
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  placeholder="例: 重要な取引先との接待、社内の役員会食など"
                  required
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-zinc-500">
                  誰と、どのような目的で利用したか記載してください
                </p>
              </div>

              {/* 結果 */}
              <div className="space-y-2">
                <Label htmlFor="result">
                  結果・感想 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="result"
                  name="result"
                  value={formData.result}
                  onChange={handleChange}
                  placeholder="例: 料理の質が高く、個室でゆっくり商談できた。先方も満足していただけた様子。"
                  required
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-zinc-500">
                  利用した結果や感想、先方の反応などを記載してください
                </p>
              </div>

              {/* 評価 */}
              <div className="space-y-2">
                <Label>
                  総合評価 <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="text-3xl transition-transform hover:scale-110 focus:outline-none focus:scale-110"
                      title={`${star}つ星`}
                    >
                      <span className={star <= formData.rating ? "text-yellow-400" : "text-zinc-300"}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-zinc-600">
                    {formData.rating} / 5
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  星をクリックして評価を選択してください
                </p>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">
              投稿する
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
