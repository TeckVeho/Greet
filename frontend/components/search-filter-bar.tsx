"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { SortOption } from "@/lib/utils"

interface SearchFilterBarProps {
  onSearchChange: (value: string) => void
  onFilterClick: () => void
  onNewClick?: () => void
  viewMode?: "table" | "cards"
  onViewModeChange?: (mode: "table" | "cards") => void
  activeFilterCount?: number
  sortOption?: SortOption
  onSortChange?: (sort: SortOption) => void
}

export function SearchFilterBar({
  onSearchChange,
  onFilterClick,
  onNewClick,
  viewMode = "table",
  onViewModeChange,
  activeFilterCount = 0,
  sortOption = "createdAt_desc",
  onSortChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
      <div className="relative w-full md:flex-1 md:max-w-md">
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
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          type="text"
          placeholder="店名、エリア、ジャンルで検索..."
          className="pl-9"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="secondary" onClick={onFilterClick} className="relative">
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
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filter
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* 並び替え */}
      {onSortChange && (
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
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
      )}

      {/* ビュー切り替えボタン (モバイルでは非表示) */}
      {onViewModeChange && (
        <div className="hidden md:flex items-center border border-zinc-200 rounded-md overflow-hidden">
          <button
            onClick={() => onViewModeChange("table")}
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
            onClick={() => onViewModeChange("cards")}
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
      
      {/* 新規登録ボタン（PCのみここに表示、モバイルは画面下部にCTA） */}
      <Button onClick={onNewClick} className="hidden md:inline-flex">
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
        新規登録
      </Button>
    </div>
  )
}
