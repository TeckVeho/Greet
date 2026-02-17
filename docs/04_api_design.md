# 04 API設計

## 1. 基本仕様

| 項目 | 内容 |
|------|------|
| ベースURL | `http(s)://<host>/api` |
| プロトコル | HTTPS（本番）/ HTTP（開発） |
| フォーマット | JSON |
| 認証方式 | JWT Bearer Token |
| 文字コード | UTF-8 |
| APIバージョン | v1（将来の拡張時に `/api/v2` 等に移行） |

### 共通リクエストヘッダー

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>   ← 認証が必要なエンドポイントのみ
```

### 共通レスポンスフォーマット

**成功**
```json
{
  "success": true,
  "data": { ... }
}
```

**一覧取得（ページネーション付き）**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**エラー**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": [
      { "field": "name", "message": "店名は必須です" }
    ]
  }
}
```

### エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|--------------|------|
| `VALIDATION_ERROR` | 400 | バリデーションエラー |
| `UNAUTHORIZED` | 401 | 未認証（トークンなし・無効） |
| `FORBIDDEN` | 403 | 権限不足 |
| `NOT_FOUND` | 404 | リソースが存在しない |
| `CONFLICT` | 409 | 重複エラー |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

---

## 2. 認証 API

### POST /api/auth/login

ログイン・JWTトークン発行

**認証不要**

**リクエスト**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**レスポンス 200**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "管理者 太郎",
      "role": "admin",
      "department": "総務部",
      "icon": "👤",
      "companyId": "uuid",
      "company": {
        "id": "uuid",
        "name": "株式会社グリート",
        "code": "GREET"
      }
    }
  }
}
```

**エラー 401**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

---

### POST /api/auth/logout

ログアウト（クライアント側でトークン破棄。将来的にトークンブラックリスト対応も可）

**認証必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": { "message": "ログアウトしました" }
}
```

---

### GET /api/auth/me

現在のログインユーザー情報取得

**認証必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "山田 花子",
    "role": "user",
    "department": "営業部",
    "icon": "🌸",
    "companyId": "uuid",
    "company": {
      "id": "uuid",
      "name": "山田商事",
      "code": "YAMADA"
    },
    "createdAt": "2024-01-15T09:00:00.000Z",
    "lastLoginAt": "2025-02-17T10:30:00.000Z"
  }
}
```

---

## 3. 飲食店 API

### GET /api/restaurants

飲食店一覧取得

**認証必要**

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `page` | number | - | ページ番号（デフォルト: 1） |
| `limit` | number | - | 1ページ件数（デフォルト: 20、最大: 100） |
| `search` | string | - | 店名での部分一致検索 |
| `area` | string | - | エリア絞り込み（複数可: `area=銀座&area=赤坂`） |
| `genre` | string | - | ジャンル絞り込み（複数可） |
| `hasPrivateRoom` | boolean | - | 個室あり絞り込み |
| `smokingAllowed` | boolean | - | 喫煙可絞り込み |
| `priceRange` | string | - | 価格帯絞り込み（複数可） |
| `sortBy` | string | - | 並び替え項目（`createdAt` / `name` / `priceRange` / `reviewCount` / `rating`） |
| `sortOrder` | string | - | 並び替え順序（`asc` / `desc`、デフォルト: `desc`） |

**レスポンス 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "銀座 しのはら",
      "area": "銀座",
      "genres": ["和食", "割烹"],
      "hasPrivateRoom": true,
      "priceRange": "20000~",
      "address": "東京都中央区銀座6-3-12",
      "phone": "03-1234-5678",
      "url": "https://example.com",
      "smokingAllowed": false,
      "coverImage": "https://...",
      "icon": "🍱",
      "reviewCount": 5,
      "averageRating": 4.2,
      "createdBy": {
        "id": "uuid",
        "name": "山田 太郎",
        "icon": "👤"
      },
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-20T14:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

---

### GET /api/restaurants/:id

飲食店詳細取得

**認証必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "銀座 しのはら",
    "area": "銀座",
    "genres": ["和食", "割烹"],
    "hasPrivateRoom": true,
    "priceRange": "20000~",
    "address": "東京都中央区銀座6-3-12",
    "phone": "03-1234-5678",
    "url": "https://example.com",
    "smokingAllowed": false,
    "coverImage": "https://...",
    "icon": "🍱",
    "createdBy": {
      "id": "uuid",
      "name": "山田 太郎",
      "icon": "👤"
    },
    "reviews": [
      {
        "id": "uuid",
        "occasion": "部長クラス接待",
        "result": "非常に喜んでいただけました。個室が静かで会話もしやすい。",
        "rating": 5,
        "author": {
          "id": "uuid",
          "name": "鈴木 一郎",
          "icon": "🌟"
        },
        "createdAt": "2024-02-10T12:00:00.000Z"
      }
    ],
    "isFavorite": true,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-20T14:00:00.000Z"
  }
}
```

**エラー 404**
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "飲食店が見つかりません" }
}
```

---

### POST /api/restaurants

飲食店登録

**認証必要**

**リクエスト**
```json
{
  "name": "銀座 しのはら",
  "area": "銀座",
  "genres": ["和食", "割烹"],
  "hasPrivateRoom": true,
  "priceRange": "20000~",
  "address": "東京都中央区銀座6-3-12",
  "phone": "03-1234-5678",
  "url": "https://example.com",
  "smokingAllowed": false,
  "coverImage": "https://...",
  "icon": "🍱"
}
```

**バリデーション**

| フィールド | 必須 | ルール |
|-----------|------|--------|
| `name` | ○ | 1〜200文字 |
| `area` | ○ | ENUM値のいずれか |
| `genres` | ○ | 配列、1件以上、ENUM値のみ |
| `hasPrivateRoom` | - | boolean（デフォルト: false） |
| `priceRange` | - | ENUM値のいずれか |
| `address` | - | 300文字以内 |
| `phone` | - | 電話番号形式 |
| `url` | - | URL形式 |
| `smokingAllowed` | - | boolean（デフォルト: false） |

**レスポンス 201**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "銀座 しのはら", "..." : "..." }
}
```

---

### PUT /api/restaurants/:id

飲食店更新

**認証必要**

**リクエスト**（更新するフィールドのみ）
```json
{
  "name": "銀座 しのはら（改）",
  "hasPrivateRoom": true
}
```

**レスポンス 200**
```json
{
  "success": true,
  "data": { "id": "uuid", "..." : "..." }
}
```

---

### DELETE /api/restaurants/:id

飲食店削除（管理者のみ）

**認証必要 / admin ロール必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": { "message": "飲食店を削除しました" }
}
```

---

## 4. レビュー API

### POST /api/restaurants/:restaurantId/reviews

レビュー投稿

**認証必要**

**リクエスト**
```json
{
  "occasion": "部長クラス接待",
  "result": "個室で落ち着いた雰囲気。料理のクオリティも高く大変喜んでいただけた。",
  "rating": 5
}
```

**バリデーション**

| フィールド | 必須 | ルール |
|-----------|------|--------|
| `occasion` | ○ | 1〜200文字 |
| `result` | ○ | 1〜2000文字 |
| `rating` | - | 1〜5 の整数 |

**レスポンス 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "restaurantId": "uuid",
    "occasion": "部長クラス接待",
    "result": "...",
    "rating": 5,
    "author": {
      "id": "uuid",
      "name": "山田 花子",
      "icon": "🌸"
    },
    "createdAt": "2025-02-17T10:30:00.000Z"
  }
}
```

---

### DELETE /api/reviews/:id

レビュー削除（投稿者本人または管理者）

**認証必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": { "message": "レビューを削除しました" }
}
```

---

## 5. お気に入り API

### GET /api/favorites

ログインユーザーのお気に入り一覧取得

**認証必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "restaurant": {
        "id": "uuid",
        "name": "銀座 しのはら",
        "area": "銀座",
        "genres": ["和食"],
        "priceRange": "20000~",
        "icon": "🍱",
        "reviewCount": 5,
        "averageRating": 4.2
      },
      "createdAt": "2025-01-20T09:00:00.000Z"
    }
  ]
}
```

---

### POST /api/favorites

お気に入り追加

**認証必要**

**リクエスト**
```json
{
  "restaurantId": "uuid"
}
```

**レスポンス 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "restaurantId": "uuid",
    "createdAt": "2025-02-17T10:30:00.000Z"
  }
}
```

**エラー 409（重複）**
```json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "すでにお気に入りに追加されています" }
}
```

---

### DELETE /api/favorites/:restaurantId

お気に入り削除

**認証必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": { "message": "お気に入りを解除しました" }
}
```

---

## 6. ユーザー API（管理者のみ）

### GET /api/users

ユーザー一覧取得

**認証必要 / admin ロール必要**

**クエリパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `page` | number | ページ番号 |
| `limit` | number | 1ページ件数 |
| `search` | string | 名前・メール・部署での部分一致 |
| `companyId` | string | 会社フィルター |

**レスポンス 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "山田 花子",
      "role": "user",
      "department": "営業部",
      "icon": "🌸",
      "company": {
        "id": "uuid",
        "name": "山田商事"
      },
      "createdAt": "2024-01-15T09:00:00.000Z",
      "lastLoginAt": "2025-02-17T10:30:00.000Z"
    }
  ],
  "meta": { "total": 7, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

### POST /api/users

ユーザー新規作成

**認証必要 / admin ロール必要**

**リクエスト**
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "name": "新規 ユーザー",
  "role": "user",
  "department": "人事部",
  "companyId": "uuid",
  "icon": "😊"
}
```

**バリデーション**

| フィールド | 必須 | ルール |
|-----------|------|--------|
| `email` | ○ | メールアドレス形式、ユニーク |
| `password` | ○ | 8文字以上、英数字含む |
| `name` | ○ | 1〜100文字 |
| `role` | - | `admin` / `user`（デフォルト: `user`） |
| `companyId` | ○ | 存在する会社IDであること |

**レスポンス 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "新規 ユーザー",
    "role": "user",
    "createdAt": "2025-02-17T10:30:00.000Z"
  }
}
```

---

### PUT /api/users/:id

ユーザー更新

**認証必要 / admin ロール必要**

**リクエスト**（更新フィールドのみ）
```json
{
  "name": "山田 花子（更新）",
  "department": "営業推進部",
  "role": "admin"
}
```

**レスポンス 200**
```json
{
  "success": true,
  "data": { "id": "uuid", "..." : "..." }
}
```

---

### DELETE /api/users/:id

ユーザー削除

**認証必要 / admin ロール必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": { "message": "ユーザーを削除しました" }
}
```

---

## 7. 会社 API（管理者のみ）

### GET /api/companies

会社一覧取得

**認証必要 / admin ロール必要**

**レスポンス 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "株式会社グリート",
      "code": "GREET",
      "icon": "🏢",
      "userCount": 3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/companies

会社登録

**認証必要 / admin ロール必要**

**リクエスト**
```json
{
  "name": "新規 株式会社",
  "code": "NEWCO",
  "icon": "🏬"
}
```

**レスポンス 201**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "新規 株式会社", "code": "NEWCO" }
}
```

---

## 8. エンドポイント一覧サマリー

| メソッド | パス | 説明 | 認証 | ロール |
|---------|------|------|------|--------|
| POST | `/api/auth/login` | ログイン | 不要 | - |
| POST | `/api/auth/logout` | ログアウト | 必要 | any |
| GET | `/api/auth/me` | 自分の情報取得 | 必要 | any |
| GET | `/api/restaurants` | 飲食店一覧 | 必要 | any |
| GET | `/api/restaurants/:id` | 飲食店詳細 | 必要 | any |
| POST | `/api/restaurants` | 飲食店登録 | 必要 | any |
| PUT | `/api/restaurants/:id` | 飲食店更新 | 必要 | any |
| DELETE | `/api/restaurants/:id` | 飲食店削除 | 必要 | admin |
| POST | `/api/restaurants/:id/reviews` | レビュー投稿 | 必要 | any |
| DELETE | `/api/reviews/:id` | レビュー削除 | 必要 | 本人/admin |
| GET | `/api/favorites` | お気に入り一覧 | 必要 | any |
| POST | `/api/favorites` | お気に入り追加 | 必要 | any |
| DELETE | `/api/favorites/:restaurantId` | お気に入り削除 | 必要 | any |
| GET | `/api/users` | ユーザー一覧 | 必要 | admin |
| POST | `/api/users` | ユーザー登録 | 必要 | admin |
| PUT | `/api/users/:id` | ユーザー更新 | 必要 | admin |
| DELETE | `/api/users/:id` | ユーザー削除 | 必要 | admin |
| GET | `/api/companies` | 会社一覧 | 必要 | admin |
| POST | `/api/companies` | 会社登録 | 必要 | admin |
