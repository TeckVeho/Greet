"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { GlobalSearchDialog } from "./global-search-dialog"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  // キーボードショートカット (Cmd+K / Ctrl+K) で検索を開く
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="relative min-h-screen bg-white">
      <Sidebar 
        isCollapsed={isCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* メインコンテンツエリア */}
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"
        )}
      >
        {/* トップバー */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
          <button
            onClick={() => {
              // モバイルではメニュー開閉、PCではサイドバー折りたたみ
              if (window.innerWidth < 768) {
                setIsMobileMenuOpen(!isMobileMenuOpen)
              } else {
                setIsCollapsed(!isCollapsed)
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-8 items-center gap-2 rounded-md px-3 text-sm text-zinc-600 hover:bg-zinc-100"
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span>検索...</span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 font-mono text-xs text-zinc-500">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </header>

        {/* ページコンテンツ */}
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>

      {/* グローバル検索ダイアログ */}
      <GlobalSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  )
}
