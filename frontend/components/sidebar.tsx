"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isCollapsed: boolean
  isMobileMenuOpen?: boolean
  onMobileMenuClose?: () => void
}

export function Sidebar({ isCollapsed, isMobileMenuOpen = false, onMobileMenuClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      title: "すべての飲食店リスト",
      href: "/",
      icon: "📋",
    },
    {
      title: "エリア別",
      href: "/area",
      icon: "📍",
    },
    {
      title: "ジャンル別",
      href: "/genre",
      icon: "🍴",
    },
    {
      title: "お気に入り",
      href: "/favorites",
      icon: "⭐",
    },
  ]

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileMenuClose}
          aria-hidden="true"
        />
      )}
      
      {/* サイドバー - ピンクベージュ・グルメ（明るめ） */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-[#A67B6B] bg-[#B8958A] transition-all duration-300",
          // モバイル: transform でスライド、PC: 常に表示
          "transform md:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // 幅
          isCollapsed ? "w-64 md:w-16" : "w-64"
        )}
      >
      <div className="flex h-full flex-col">
        {/* ヘッダー */}
        <div className="flex h-14 items-center border-b border-[#A67B6B] px-4">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold tracking-wide text-white" style={{ fontFamily: 'var(--font-logo), serif' }}>Greet</h2>
              <p className="text-xs text-white/85">接待を、戦略に。</p>
            </div>
          )}
          {isCollapsed && <span className="text-lg">✨</span>}
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // モバイルメニューを閉じる
                  if (onMobileMenuClose && window.innerWidth < 768) {
                    onMobileMenuClose()
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#A67B6B] text-white"
                    : "text-white/90 hover:bg-[#A67B6B]/70 hover:text-white"
                )}
              >
                <span className="text-base">{item.icon}</span>
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* 管理者メニュー (モバイルでは非表示) */}
        {user?.role === "admin" && (
          <div className="hidden md:block border-t border-[#A67B6B] p-3">
            <Link
              href="/admin/users"
              onClick={() => {
                // モバイルメニューを閉じる
                if (onMobileMenuClose && window.innerWidth < 768) {
                  onMobileMenuClose()
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin/users"
                  ? "bg-[#A67B6B] text-white"
                  : "text-white/90 hover:bg-[#A67B6B]/70 hover:text-white"
              )}
            >
              <span className="text-base">👥</span>
              {!isCollapsed && <span>ユーザー管理</span>}
            </Link>
          </div>
        )}

        {/* フッター */}
        <div className="border-t border-[#A67B6B] p-3">
          {user ? (
            <div className="space-y-2">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                  !isCollapsed && "bg-[#A67B6B]/50"
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A67B6B] text-xs font-medium text-white">
                  {user.name.charAt(0)}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-sm font-medium text-white">
                      {user.name}
                    </div>
                    <div className="truncate text-xs text-white/75">
                      {user.role === "admin" ? "管理者" : "一般"}
                    </div>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-white/90 hover:bg-[#A67B6B]/70 hover:text-white"
                >
                  <span className="mr-2">🚪</span>
                  ログアウト
                </Button>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/90 hover:bg-[#A67B6B]/70 hover:text-white"
              )}
            >
              <span className="text-base">🔑</span>
              {!isCollapsed && <span>ログイン</span>}
            </Link>
          )}
        </div>
      </div>
    </aside>
    </>
  )
}
