# 02 詳細設計

## 1. アーキテクチャ概要

本システムは **フロントエンド（Next.js）** と **バックエンド（Express API）** を分離した構成を採用する。

```
┌──────────────────────────────────────────────────────────────────┐
│  フロントエンド（Next.js / App Router）                            │
│                                                                    │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────────┐   │
│  │  Pages      │   │  Components   │   │  Context / Hooks    │   │
│  │  /          │   │  AppLayout    │   │  AuthContext        │   │
│  │  /login     │   │  Sidebar      │   │  FavoritesContext   │   │
│  │  /restaurant│   │  Restaurant   │   │  useAuth()          │   │
│  │  /area      │   │  User         │   │  useFavorites()     │   │
│  │  /genre     │   │  Review       │   └─────────────────────┘   │
│  │  /favorites │   └──────────────┘                              │
│  │  /admin     │                                                  │
│  └─────────────┘                                                  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  API Client Layer（lib/api/）                              │    │
│  │  axios / fetch → Bearer Token 付与 → Express API          │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                              │ HTTP/HTTPS
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  バックエンド（Express API）                                        │
│                                                                    │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  Router   │→ │ Middleware  │→ │ Controller│→ │  Service    │  │
│  │  /auth    │  │ authJWT     │  │ auth      │  │  auth       │  │
│  │  /restaurants│ validation  │  │ restaurant│  │  restaurant │  │
│  │  /reviews │  │ errorHandler│  │ review    │  │  review     │  │
│  │  /users   │  └────────────┘  │ user      │  │  user       │  │
│  │  /companies│                 └───────────┘  └─────────────┘  │
│  │  /favorites│                                                   │
│  └───────────┘                                                    │
│                              │                                    │
│  ┌───────────────────────────▼──────────────────────────────┐    │
│  │  Prisma ORM                                                │    │
│  └───────────────────────────┬──────────────────────────────┘    │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │  RDS MySQL 8.0  │
                    └─────────────────┘
```

---

## 2. フロントエンド詳細設計

### 2.1 ディレクトリ構造

```
app/
├── layout.tsx              # ルートレイアウト（プロバイダー注入）
├── page.tsx                # ホーム（飲食店一覧）
├── login/
│   └── page.tsx            # ログインページ
├── restaurant/
│   └── [id]/
│       └── page.tsx        # 飲食店詳細
├── area/
│   └── page.tsx            # エリア別一覧
├── genre/
│   └── page.tsx            # ジャンル別一覧
├── favorites/
│   └── page.tsx            # お気に入り一覧
└── admin/
    └── users/
        └── page.tsx        # ユーザー管理（管理者のみ）

components/
├── app-layout.tsx          # 全体レイアウト
├── sidebar.tsx             # サイドバーナビゲーション
├── restaurant-table.tsx    # 飲食店テーブル表示
├── restaurant-cards.tsx    # 飲食店カード表示
├── restaurant-form-dialog.tsx  # 飲食店登録・編集
├── search-filter-bar.tsx   # 検索・フィルターバー
├── filter-dialog.tsx       # フィルターダイアログ
├── global-search-dialog.tsx    # グローバル検索（Cmd+K）
├── review-form-dialog.tsx  # レビュー投稿
├── user-table.tsx          # ユーザーテーブル
├── user-form-dialog.tsx    # ユーザー登録・編集
└── ui/                     # 汎用UIコンポーネント
    ├── badge.tsx
    ├── button.tsx
    ├── callout.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    └── textarea.tsx

lib/
├── types.ts                # TypeScript型定義
├── utils.ts                # ユーティリティ関数
├── auth-context.tsx        # 認証コンテキスト
├── favorites-context.tsx   # お気に入りコンテキスト
├── api/                    # ★実装予定: APIクライアント
│   ├── client.ts           # axios インスタンス（JWT付与）
│   ├── auth.ts             # 認証API
│   ├── restaurants.ts      # 飲食店API
│   ├── reviews.ts          # レビューAPI
│   ├── users.ts            # ユーザーAPI
│   ├── companies.ts        # 会社API
│   └── favorites.ts        # お気に入りAPI
├── mock-data.ts            # モックデータ（API移行後に削除）
├── mock-users.ts           # モックユーザー（API移行後に削除）
└── mock-companies.ts       # モック会社（API移行後に削除）
```

### 2.2 認証フロー（フロントエンド）

```
[ログインページ]
       │ メール・パスワード入力
       ▼
[AuthContext.login()]
       │ POST /api/auth/login
       ▼
[APIレスポンス]
   ├─ 成功: JWT トークンを localStorage に保存 → ホームへリダイレクト
   └─ 失敗: エラーメッセージ表示

[各ページ]
       │ useAuth() で認証チェック
       ▼
   ├─ 未認証: /login へリダイレクト
   └─ 認証済み: ページ表示

[APIリクエスト]
       │ lib/api/client.ts の axios interceptor
       ▼
   Authorization: Bearer <JWT> ヘッダーを自動付与
```

### 2.3 状態管理

| 状態 | 管理方法 | 永続化 |
|------|---------|--------|
| 認証状態（ユーザー情報） | AuthContext（React Context） | localStorage |
| お気に入りリスト | FavoritesContext（React Context） | localStorage |
| 検索・フィルター条件 | 各ページの useState | なし |
| 並び替え設定 | 各ページの useState | なし |

### 2.4 コンポーネント依存関係

```
layout.tsx
└── AuthProvider
    └── FavoritesProvider
        └── AppLayout
            ├── Sidebar
            │   └── （ナビゲーションリンク）
            ├── TopBar
            │   └── GlobalSearchDialog
            └── {children}（各ページ）
                ├── SearchFilterBar
                ├── RestaurantTable / RestaurantCards
                ├── RestaurantFormDialog
                └── FilterDialog
```

---

## 3. バックエンド詳細設計（実装予定）

### 3.1 ディレクトリ構造

```
backend/
├── src/
│   ├── index.ts                # エントリポイント
│   ├── app.ts                  # Express アプリ設定
│   ├── routes/
│   │   ├── auth.ts             # 認証ルート
│   │   ├── restaurants.ts      # 飲食店ルート
│   │   ├── reviews.ts          # レビュールート
│   │   ├── users.ts            # ユーザールート
│   │   ├── companies.ts        # 会社ルート
│   │   └── favorites.ts        # お気に入りルート
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── restaurant.controller.ts
│   │   ├── review.controller.ts
│   │   ├── user.controller.ts
│   │   ├── company.controller.ts
│   │   └── favorite.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── restaurant.service.ts
│   │   ├── review.service.ts
│   │   ├── user.service.ts
│   │   ├── company.service.ts
│   │   └── favorite.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT検証
│   │   ├── admin.middleware.ts  # 管理者チェック
│   │   ├── validate.middleware.ts # リクエストバリデーション
│   │   └── error.middleware.ts  # エラーハンドリング
│   ├── schemas/
│   │   ├── auth.schema.ts      # zod バリデーションスキーマ
│   │   ├── restaurant.schema.ts
│   │   ├── review.schema.ts
│   │   └── user.schema.ts
│   └── utils/
│       ├── jwt.ts              # JWT ユーティリティ
│       ├── password.ts         # bcrypt ユーティリティ
│       └── response.ts         # レスポンスフォーマット
├── prisma/
│   ├── schema.prisma           # Prisma スキーマ
│   └── seed.ts                 # 初期データ投入
├── tests/
│   ├── unit/                   # 単体テスト
│   ├── integration/            # インテグレーションテスト
│   └── e2e/                    # E2E テスト（Playwright）
├── .env                        # 環境変数
├── .env.example                # 環境変数テンプレート
├── package.json
└── tsconfig.json
```

### 3.2 JWT 認証フロー

```
[クライアント]
       │ POST /api/auth/login { email, password }
       ▼
[auth.controller.ts]
       │ auth.service.loginUser(email, password)
       ▼
[auth.service.ts]
       │ DB から email でユーザー取得
       │ bcrypt.compare(password, hashedPassword)
       ├─ 失敗: 401 Unauthorized
       └─ 成功: jwt.sign({ userId, role, companyId }, SECRET, { expiresIn: '24h' })
                → { token, user } を返却

[クライアント]
       │ localStorage.setItem('token', token)
       │
       │ 以降のリクエスト: Authorization: Bearer <token>
       ▼
[auth.middleware.ts]
       │ jwt.verify(token, SECRET)
       ├─ 失敗: 401 Unauthorized
       └─ 成功: req.user = { userId, role, companyId }
                → 次のミドルウェア/コントローラーへ
```

### 3.3 エラーハンドリング

全 API は以下の統一フォーマットでレスポンスを返す。

**成功レスポンス**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

**エラーレスポンス**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "バリデーションエラーが発生しました",
    "details": [
      { "field": "name", "message": "店名は必須です" }
    ]
  }
}
```

**HTTPステータスコード**

| コード | 説明 |
|--------|------|
| 200 | 成功（取得・更新） |
| 201 | 成功（作成） |
| 400 | バリデーションエラー |
| 401 | 認証エラー（未認証・トークン無効） |
| 403 | 認可エラー（権限不足） |
| 404 | リソースが存在しない |
| 409 | 競合エラー（重複登録など） |
| 500 | サーバー内部エラー |

---

## 4. セキュリティ設計

### 4.1 認証・認可

| 対策 | 実装方法 |
|------|---------|
| パスワードハッシュ | bcrypt（salt rounds: 12） |
| JWT署名 | HS256、有効期限 24 時間 |
| HTTPS | EC2 + SSL 証明書（Let's Encrypt または ACM） |
| CORS | Express cors ミドルウェア（フロントエンドオリジンのみ許可） |

### 4.2 入力バリデーション

- zod を使用してリクエストボディ・クエリパラメータを検証
- SQLインジェクション対策: Prisma ORM のパラメタライズドクエリを使用

### 4.3 アクセス制御

| エンドポイント | 認証 | 権限 |
|--------------|------|------|
| POST /auth/login | 不要 | - |
| GET /restaurants | 必要 | user / admin |
| POST /restaurants | 必要 | user / admin |
| PUT /restaurants/:id | 必要 | user / admin |
| DELETE /restaurants/:id | 必要 | admin のみ |
| GET /users | 必要 | admin のみ |
| POST /users | 必要 | admin のみ |
| PUT /users/:id | 必要 | admin のみ |
| DELETE /users/:id | 必要 | admin のみ |
| GET /companies | 必要 | admin のみ |

---

## 5. テスト設計

### 5.1 テスト戦略（テストピラミッド）

```
           /\
          /E2E\        ← Playwright: ブラウザ操作テスト（少数・重要フロー）
         /──────\
        /  IT    \     ← Supertest: API統合テスト（中程度）
       /──────────\
      /     UT     \   ← Jest: 単体テスト（多数・ビジネスロジック）
     /──────────────\
```

### 5.2 単体テスト（UT）対象

| 対象 | テスト内容 |
|------|-----------|
| `auth.service.ts` | ログイン成功・失敗、JWT生成 |
| `restaurant.service.ts` | CRUD操作、フィルタリング、並び替え |
| `review.service.ts` | レビュー投稿・削除 |
| `user.service.ts` | ユーザーCRUD |
| `jwt.ts` | トークン生成・検証 |
| `password.ts` | ハッシュ化・比較 |
| フロントエンドコンポーネント | レンダリング、インタラクション |

### 5.3 インテグレーションテスト（IT）対象

| 対象 | テスト内容 |
|------|-----------|
| `POST /auth/login` | 正常ログイン、誤パスワード、存在しないユーザー |
| `GET /restaurants` | 一覧取得、フィルタリング、ページネーション |
| `POST /restaurants` | 作成成功、バリデーションエラー、認証エラー |
| `PUT /restaurants/:id` | 更新成功、存在しないID |
| `POST /reviews` | レビュー投稿成功・失敗 |
| `GET /users` | 管理者のみアクセス可能 |

### 5.4 E2Eテスト（Playwright）対象

| シナリオ | テスト内容 |
|---------|-----------|
| ログインフロー | 正常ログイン、エラー表示 |
| 飲食店一覧 | 表示、検索、フィルター |
| 飲食店登録 | フォーム入力、送信、一覧への反映 |
| レビュー投稿 | 詳細ページからの投稿 |
| お気に入り操作 | 追加・削除・一覧表示 |
| 管理者機能 | ユーザー管理ページへのアクセス制御 |

---

## 6. 環境設計

### 6.1 環境構成

| 環境 | 用途 | インフラ |
|------|------|---------|
| 開発 (local) | 開発者個人の開発環境 | ローカル PC |
| ステージング | テスト・レビュー環境 | EC2 (t3.micro) |
| 本番 | サービス提供環境 | EC2 (t3.small 以上) |

### 6.2 環境変数

```env
# backend/.env

# サーバー設定
NODE_ENV=production
PORT=4000

# データベース
DATABASE_URL="mysql://user:password@rds-endpoint:3306/greet_db"

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

```env
# フロントエンド .env.local

NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
