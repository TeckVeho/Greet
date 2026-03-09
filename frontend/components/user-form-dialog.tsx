"use client"

import * as React from "react"
import { User } from "@/lib/types"
import { type CompanyListItem } from "@/lib/api/companies"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  user?: User
  onSave: (user: Partial<User> & { password?: string }) => void
  companies?: CompanyListItem[]
  isSaving?: boolean
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  onSave,
  companies = [],
  isSaving = false,
}: UserFormDialogProps) {
  const [formData, setFormData] = React.useState<Partial<User> & { password?: string }>({
    name: "",
    email: "",
    password: "",
    role: "user",
    department: "",
  })

  React.useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        department: user.department,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        department: "",
      })
    }
  }, [mode, user, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.role) {
      alert("必須項目を全て入力してください")
      return
    }
    if (mode === "create" && !formData.password) {
      alert("パスワードを入力してください")
      return
    }
    
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新規ユーザー登録" : "ユーザー情報編集"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              {/* 名前 */}
              <div className="space-y-2">
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="例: 山田太郎"
                  required
                />
              </div>

              {/* メールアドレス */}
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="yamada@example.com"
                  required
                />
              </div>

              {/* パスワード（新規作成時のみ） */}
              {mode === "create" && (
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="8文字以上"
                    required
                  />
                </div>
              )}

              {/* 部署 */}
              <div className="space-y-2">
                <Label htmlFor="department">部署</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="営業部"
                />
              </div>

              {/* 権限 */}
              <div className="space-y-2">
                <Label htmlFor="role">ユーザー権限 *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="権限を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">一般ユーザー</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "保存中..." : mode === "create" ? "登録" : "更新"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
