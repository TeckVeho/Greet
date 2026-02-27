import { User } from "./types"
import { getCompanyById } from "./mock-companies"

// 会社情報を含むユーザー配列を生成
function createUsersWithCompany(): User[] {
  const users: User[] = [
    {
      id: "1",
      email: "admin@example.com",
      name: "管理者",
      role: "admin",
      companyId: "c1",
      department: "経営企画部",
      icon: "👨‍💼",
      createdAt: new Date("2024-01-01"),
      lastLogin: new Date(),
    },
    {
      id: "2",
      email: "user@example.com",
      name: "山田太郎",
      role: "user",
      companyId: "c1",
      department: "営業部",
      icon: "👨",
      createdAt: new Date("2024-01-15"),
      lastLogin: new Date("2024-02-17T09:30:00"),
    },
    {
      id: "3",
      email: "tanaka@example.com",
      name: "田中花子",
      role: "user",
      companyId: "c1",
      department: "営業部",
      icon: "👩",
      createdAt: new Date("2024-01-20"),
      lastLogin: new Date("2024-02-16T15:45:00"),
    },
    {
      id: "4",
      email: "suzuki@example.com",
      name: "鈴木一郎",
      role: "user",
      companyId: "c2",
      department: "マーケティング部",
      icon: "👨‍💻",
      createdAt: new Date("2024-02-01"),
      lastLogin: new Date("2024-02-15T11:20:00"),
    },
    {
      id: "5",
      email: "sato@example.com",
      name: "佐藤次郎",
      role: "admin",
      companyId: "c2",
      department: "総務部",
      icon: "👔",
      createdAt: new Date("2024-02-05"),
      lastLogin: new Date("2024-02-17T08:00:00"),
    },
    {
      id: "6",
      email: "takahashi@example.com",
      name: "高橋三郎",
      role: "user",
      companyId: "c3",
      department: "海外事業部",
      icon: "🧑‍💼",
      createdAt: new Date("2024-02-10"),
      lastLogin: new Date("2024-02-16T14:30:00"),
    },
    {
      id: "7",
      email: "watanabe@example.com",
      name: "渡辺美咲",
      role: "user",
      companyId: "c3",
      department: "人事部",
      icon: "👩‍💼",
      createdAt: new Date("2024-02-12"),
      lastLogin: new Date("2024-02-17T10:15:00"),
    },
  ]

  // 各ユーザーに会社情報を付加
  return users.map((user) => ({
    ...user,
    company: getCompanyById(user.companyId),
  }))
}

export const mockUsers: User[] = createUsersWithCompany()
