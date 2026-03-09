"use client"

import * as React from "react"
import { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-500">
            <th className="px-4 py-3">名前</th>
            <th className="px-4 py-3">メールアドレス</th>
            <th className="px-4 py-3">会社</th>
            <th className="px-4 py-3">部署</th>
            <th className="px-4 py-3">権限</th>
            <th className="px-4 py-3">登録日</th>
            <th className="px-4 py-3">最終ログイン</th>
            <th className="px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-sm text-zinc-500">
                ユーザーが見つかりませんでした
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-700">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium text-zinc-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">{user.email}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {user.company ? (
                    <div className="flex items-center gap-1">
                      <span>{user.company.icon}</span>
                      <span>{user.company.name}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {user.department || "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={user.role === "admin" ? "default" : undefined}
                  >
                    {user.role === "admin" ? "管理者" : "一般"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {user.lastLogin ? formatDateTime(user.lastLogin) : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      削除
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
