import { Restaurant, Review } from "./types"

export let mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "銀座 鮨 さいとう",
    area: "銀座",
    genres: ["寿司"],
    hasPrivateRoom: true,
    priceRange: "¥30,000~¥50,000",
    address: "東京都中央区銀座4-2-15",
    phone: "03-1234-5678",
    url: "https://example.com",
    smokingAllowed: false,
    coverImage: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=400&fit=crop",
    icon: "🍣",
    reviews: [
      {
        id: "r1",
        authorId: "2",
        author: "山田太郎",
        occasion: "大手商社の役員と接待",
        result: "ネタの質が非常に高く、先方も大変満足されていた。個室があるため、重要な商談にも最適。次回も利用したい。",
        rating: 5,
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "r2",
        authorId: "5",
        author: "佐藤次郎",
        occasion: "海外VIPのおもてなし",
        result: "英語対応可能なスタッフがいて助かった。日本の伝統的な寿司文化を存分に堪能していただけた。",
        rating: 5,
        createdAt: new Date("2024-02-20"),
      },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-02-20"),
  },
  {
    id: "2",
    name: "赤坂 ラ・トゥール",
    area: "赤坂",
    genres: ["フレンチ"],
    hasPrivateRoom: true,
    priceRange: "¥25,000~¥40,000",
    address: "東京都港区赤坂2-14-6",
    phone: "03-2345-6789",
    url: "https://example.com",
    smokingAllowed: false,
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop",
    icon: "🍷",
    reviews: [
      {
        id: "r3",
        authorId: "3",
        author: "田中花子",
        occasion: "部長昇進のお祝い",
        result: "洗練された空間と料理で、特別な日にふさわしい。ワインペアリングも素晴らしかった。",
        rating: 5,
        createdAt: new Date("2024-01-25"),
      },
    ],
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "3",
    name: "六本木 焼肉 牛太郎",
    area: "六本木",
    genres: ["焼肉"],
    hasPrivateRoom: true,
    priceRange: "¥15,000~¥30,000",
    address: "東京都港区六本木3-1-1",
    phone: "03-3456-7890",
    smokingAllowed: true,
    coverImage: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=400&fit=crop",
    icon: "🥩",
    reviews: [
      {
        id: "r4",
        authorId: "4",
        author: "鈴木一郎",
        occasion: "営業チームの打ち上げ",
        result: "A5ランクの和牛が絶品。個室で賑やかに楽しめた。喫煙可能な点も良かった。",
        rating: 4,
        createdAt: new Date("2024-02-10"),
      },
    ],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-02-10"),
  },
  {
    id: "4",
    name: "恵比寿 イタリアン アモーレ",
    area: "恵比寿",
    genres: ["イタリアン"],
    hasPrivateRoom: false,
    priceRange: "¥10,000~¥20,000",
    address: "東京都渋谷区恵比寿1-5-8",
    phone: "03-4567-8901",
    url: "https://example.com",
    smokingAllowed: false,
    coverImage: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=800&h=400&fit=crop",
    icon: "🍝",
    reviews: [
      {
        id: "r5",
        authorId: "2",
        author: "山田太郎",
        occasion: "カジュアルな会食",
        result: "個室はないが、雰囲気が良く料理も美味しい。コスパも良好。",
        rating: 4,
        createdAt: new Date("2024-02-05"),
      },
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-05"),
  },
  {
    id: "5",
    name: "銀座 天ぷら 天心",
    area: "銀座",
    genres: ["天ぷら", "和食"],
    hasPrivateRoom: true,
    priceRange: "¥20,000~¥35,000",
    address: "東京都中央区銀座5-8-20",
    phone: "03-5678-9012",
    smokingAllowed: false,
    coverImage: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&h=400&fit=crop",
    icon: "🍤",
    reviews: [
      {
        id: "r6",
        authorId: "3",
        author: "田中花子",
        occasion: "取引先の社長と会食",
        result: "カウンター席で職人の技を目の前で楽しめる。個室もあり、用途に応じて使い分けできる。",
        rating: 5,
        createdAt: new Date("2024-01-30"),
      },
    ],
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-30"),
  },
]

/**
 * レストランにレビューを追加する
 */
export function addReview(restaurantId: string, review: Review): boolean {
  const restaurant = mockRestaurants.find((r) => r.id === restaurantId)
  if (!restaurant) {
    return false
  }
  restaurant.reviews.push(review)
  restaurant.updatedAt = new Date()
  return true
}

/**
 * レストランを再取得する（レビュー更新後に使用）
 */
export function getRestaurantById(restaurantId: string): Restaurant | undefined {
  return mockRestaurants.find((r) => r.id === restaurantId)
}
