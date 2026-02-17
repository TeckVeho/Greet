export interface Restaurant {
  id: string
  name: string
  area: string
  genres: string[]
  hasPrivateRoom: boolean
  priceRange: string
  address: string
  phone: string
  url?: string
  smokingAllowed: boolean
  coverImage?: string
  icon: string
  reviews: Review[]
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  authorId: string // ユーザーID
  author: string // ユーザー名（後方互換性のため残す）
  occasion: string // 誰と行ったか
  result: string // 結果どうだったか
  rating?: number
  createdAt: Date
}

export type Area = "銀座" | "赤坂" | "六本木" | "新橋" | "麻布" | "恵比寿" | "表参道" | "その他"

export type Genre = "寿司" | "フレンチ" | "イタリアン" | "和食" | "中華" | "鉄板焼き" | "焼肉" | "天ぷら" | "割烹" | "その他"

export interface Company {
  id: string
  name: string
  code: string // 会社コード
  icon?: string // 会社アイコン絵文字
  createdAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  companyId: string // 所属会社ID
  company?: Company // 所属会社情報（結合用）
  department?: string
  avatar?: string // アバター画像URL
  icon?: string // アイコン絵文字
  createdAt: Date
  lastLogin?: Date
}
