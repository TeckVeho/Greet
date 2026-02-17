# 03 データベース設計

## 1. 概要

| 項目 | 内容 |
|------|------|
| DBMS | MySQL 8.0 |
| インフラ | AWS RDS |
| データベース名 | `greet_db` |
| 文字コード | utf8mb4 |
| 照合順序 | utf8mb4_unicode_ci |
| ORM | Prisma 5.x |

---

## 2. ER 図

```
┌─────────────────┐       ┌──────────────────────────────┐
│    companies    │       │         restaurants           │
├─────────────────┤       ├──────────────────────────────┤
│ id (PK)         │       │ id (PK)                      │
│ name            │       │ name                         │
│ code            │       │ area                         │
│ icon            │       │ has_private_room             │
│ created_at      │       │ price_range                  │
│ updated_at      │       │ address                      │
└────────┬────────┘       │ phone                        │
         │ 1              │ url                          │
         │                │ smoking_allowed              │
         │ N              │ cover_image                  │
┌────────▼────────┐       │ icon                         │
│      users      │       │ created_by (FK: users.id)    │
├─────────────────┤       │ company_id (FK: companies.id)│
│ id (PK)         │       │ created_at                   │
│ email (UNIQUE)  │       │ updated_at                   │
│ password_hash   │       └──────────────┬───────────────┘
│ name            │                      │ 1
│ role            │                      ├──────────────────────────┐
│ department      │                      │ N                        │ N
│ avatar          │               ┌──────▼───────────┐  ┌──────────▼────────┐
│ icon            │               │ restaurant_genres │  │      reviews      │
│ company_id (FK) │               ├──────────────────┤  ├───────────────────┤
│ created_at      │               │ id (PK)          │  │ id (PK)           │
│ updated_at      │               │ restaurant_id(FK)│  │ restaurant_id (FK)│
│ last_login_at   │               │ genre            │  │ author_id (FK)    │
└────────┬────────┘               └──────────────────┘  │ occasion          │
         │ 1                                             │ result            │
         │                                               │ rating            │
         │ N                                             │ created_at        │
┌────────▼────────┐                                      │ updated_at        │
│   favorites     │                                      └───────────────────┘
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ restaurant_id(FK│
│ created_at      │
└─────────────────┘
```

---

## 3. テーブル定義

### 3.1 companies（会社）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| `id` | VARCHAR(36) | NOT NULL | UUID | 主キー |
| `name` | VARCHAR(100) | NOT NULL | - | 会社名 |
| `code` | VARCHAR(20) | NOT NULL | - | 会社コード（ユニーク） |
| `icon` | VARCHAR(10) | NULL | NULL | 会社アイコン（絵文字） |
| `created_at` | DATETIME(3) | NOT NULL | NOW() | 作成日時 |
| `updated_at` | DATETIME(3) | NOT NULL | NOW() | 更新日時 |

**インデックス**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `code`

---

### 3.2 users（ユーザー）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| `id` | VARCHAR(36) | NOT NULL | UUID | 主キー |
| `email` | VARCHAR(255) | NOT NULL | - | メールアドレス（ユニーク） |
| `password_hash` | VARCHAR(255) | NOT NULL | - | bcryptハッシュ |
| `name` | VARCHAR(100) | NOT NULL | - | 氏名 |
| `role` | ENUM('admin','user') | NOT NULL | 'user' | ロール |
| `department` | VARCHAR(100) | NULL | NULL | 部署名 |
| `avatar` | TEXT | NULL | NULL | アバター画像URL |
| `icon` | VARCHAR(10) | NULL | NULL | アイコン絵文字 |
| `company_id` | VARCHAR(36) | NOT NULL | - | 所属会社ID（FK） |
| `created_at` | DATETIME(3) | NOT NULL | NOW() | 作成日時 |
| `updated_at` | DATETIME(3) | NOT NULL | NOW() | 更新日時 |
| `last_login_at` | DATETIME(3) | NULL | NULL | 最終ログイン日時 |

**インデックス**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `email`
- INDEX: `company_id`

**外部キー**
- `company_id` -> `companies.id` (ON DELETE RESTRICT)

---

### 3.3 restaurants（飲食店）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| `id` | VARCHAR(36) | NOT NULL | UUID | 主キー |
| `name` | VARCHAR(200) | NOT NULL | - | 店名 |
| `area` | ENUM | NOT NULL | - | エリア ※1 |
| `has_private_room` | TINYINT(1) | NOT NULL | 0 | 個室の有無 |
| `price_range` | ENUM | NOT NULL | '要確認' | 価格帯 ※2 |
| `address` | VARCHAR(300) | NULL | NULL | 住所 |
| `phone` | VARCHAR(20) | NULL | NULL | 電話番号 |
| `url` | TEXT | NULL | NULL | 公式サイトURL |
| `smoking_allowed` | TINYINT(1) | NOT NULL | 0 | 喫煙可否 |
| `cover_image` | TEXT | NULL | NULL | カバー画像URL |
| `icon` | VARCHAR(10) | NULL | NULL | アイコン絵文字 |
| `created_by` | VARCHAR(36) | NOT NULL | - | 登録者ID（FK） |
| `company_id` | VARCHAR(36) | NOT NULL | - | 所属会社ID（FK） |
| `created_at` | DATETIME(3) | NOT NULL | NOW() | 作成日時 |
| `updated_at` | DATETIME(3) | NOT NULL | NOW() | 更新日時 |

**※1 area ENUM値**
`銀座` / `赤坂` / `六本木` / `新橋` / `麻布` / `恵比寿` / `表参道` / `その他`

**※2 price_range ENUM値**
`~5000` / `5000~10000` / `10000~20000` / `20000~` / `要確認`

**インデックス**
- PRIMARY KEY: `id`
- INDEX: `company_id`
- INDEX: `created_by`
- INDEX: `area`

**外部キー**
- `created_by` -> `users.id` (ON DELETE RESTRICT)
- `company_id` -> `companies.id` (ON DELETE RESTRICT)

---

### 3.4 restaurant_genres（飲食店ジャンル）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| `id` | VARCHAR(36) | NOT NULL | UUID | 主キー |
| `restaurant_id` | VARCHAR(36) | NOT NULL | - | 飲食店ID（FK） |
| `genre` | ENUM | NOT NULL | - | ジャンル ※1 |

**※1 genre ENUM値**
`寿司` / `フレンチ` / `イタリアン` / `和食` / `中華` / `鉄板焼き` / `焼肉` / `天ぷら` / `割烹` / `その他`

**インデックス**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `(restaurant_id, genre)`
- INDEX: `genre`

**外部キー**
- `restaurant_id` -> `restaurants.id` (ON DELETE CASCADE)

---

### 3.5 reviews（レビュー）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| `id` | VARCHAR(36) | NOT NULL | UUID | 主キー |
| `restaurant_id` | VARCHAR(36) | NOT NULL | - | 飲食店ID（FK） |
| `author_id` | VARCHAR(36) | NOT NULL | - | 投稿者ID（FK） |
| `occasion` | VARCHAR(200) | NOT NULL | - | 利用シーン（例: 部長クラス接待） |
| `result` | TEXT | NOT NULL | - | 接待結果・所感 |
| `rating` | TINYINT | NULL | NULL | 評価（1〜5） |
| `created_at` | DATETIME(3) | NOT NULL | NOW() | 作成日時 |
| `updated_at` | DATETIME(3) | NOT NULL | NOW() | 更新日時 |

**インデックス**
- PRIMARY KEY: `id`
- INDEX: `restaurant_id`
- INDEX: `author_id`

**外部キー**
- `restaurant_id` -> `restaurants.id` (ON DELETE CASCADE)
- `author_id` -> `users.id` (ON DELETE RESTRICT)

**CHECK制約**
- `rating` CHECK (`rating` BETWEEN 1 AND 5)

---

### 3.6 favorites（お気に入り）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| `id` | VARCHAR(36) | NOT NULL | UUID | 主キー |
| `user_id` | VARCHAR(36) | NOT NULL | - | ユーザーID（FK） |
| `restaurant_id` | VARCHAR(36) | NOT NULL | - | 飲食店ID（FK） |
| `created_at` | DATETIME(3) | NOT NULL | NOW() | 作成日時 |

**インデックス**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `(user_id, restaurant_id)`
- INDEX: `restaurant_id`

**外部キー**
- `user_id` -> `users.id` (ON DELETE CASCADE)
- `restaurant_id` -> `restaurants.id` (ON DELETE CASCADE)

---

## 4. Prisma スキーマ

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Company {
  id          String       @id @default(uuid())
  name        String       @db.VarChar(100)
  code        String       @unique @db.VarChar(20)
  icon        String?      @db.VarChar(10)
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")
  users       User[]
  restaurants Restaurant[]

  @@map("companies")
}

model User {
  id           String       @id @default(uuid())
  email        String       @unique @db.VarChar(255)
  passwordHash String       @map("password_hash") @db.VarChar(255)
  name         String       @db.VarChar(100)
  role         Role         @default(user)
  department   String?      @db.VarChar(100)
  avatar       String?      @db.Text
  icon         String?      @db.VarChar(10)
  companyId    String       @map("company_id")
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")
  lastLoginAt  DateTime?    @map("last_login_at")
  company      Company      @relation(fields: [companyId], references: [id])
  restaurants  Restaurant[]
  reviews      Review[]
  favorites    Favorite[]

  @@map("users")
}

enum Role {
  admin
  user
}

model Restaurant {
  id             String            @id @default(uuid())
  name           String            @db.VarChar(200)
  area           Area
  hasPrivateRoom Boolean           @default(false) @map("has_private_room")
  priceRange     PriceRange        @default(要確認) @map("price_range")
  address        String?           @db.VarChar(300)
  phone          String?           @db.VarChar(20)
  url            String?           @db.Text
  smokingAllowed Boolean           @default(false) @map("smoking_allowed")
  coverImage     String?           @db.Text @map("cover_image")
  icon           String?           @db.VarChar(10)
  createdById    String            @map("created_by")
  companyId      String            @map("company_id")
  createdAt      DateTime          @default(now()) @map("created_at")
  updatedAt      DateTime          @updatedAt @map("updated_at")
  createdBy      User              @relation(fields: [createdById], references: [id])
  company        Company           @relation(fields: [companyId], references: [id])
  genres         RestaurantGenre[]
  reviews        Review[]
  favorites      Favorite[]

  @@map("restaurants")
}

enum Area {
  銀座
  赤坂
  六本木
  新橋
  麻布
  恵比寿
  表参道
  その他
}

enum PriceRange {
  range_5000   @map("~5000")
  range_10000  @map("5000~10000")
  range_20000  @map("10000~20000")
  range_over   @map("20000~")
  要確認
}

model RestaurantGenre {
  id           String     @id @default(uuid())
  restaurantId String     @map("restaurant_id")
  genre        Genre
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@unique([restaurantId, genre])
  @@map("restaurant_genres")
}

enum Genre {
  寿司
  フレンチ
  イタリアン
  和食
  中華
  鉄板焼き
  焼肉
  天ぷら
  割烹
  その他
}

model Review {
  id           String     @id @default(uuid())
  restaurantId String     @map("restaurant_id")
  authorId     String     @map("author_id")
  occasion     String     @db.VarChar(200)
  result       String     @db.Text
  rating       Int?
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  author       User       @relation(fields: [authorId], references: [id])

  @@map("reviews")
}

model Favorite {
  id           String     @id @default(uuid())
  userId       String     @map("user_id")
  restaurantId String     @map("restaurant_id")
  createdAt    DateTime   @default(now()) @map("created_at")
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@unique([userId, restaurantId])
  @@map("favorites")
}
```

---

## 5. マイグレーション・初期データ

### 5.1 実行手順

```bash
# マイグレーション実行
npx prisma migrate deploy

# 初期データ投入
npx prisma db seed
```

### 5.2 シーダー内容（prisma/seed.ts）

| データ | 件数 |
|--------|------|
| Company | 3件（株式会社グリート、山田商事、鈴木物産） |
| User | admin 1件 + user 6件 |
| Restaurant | 5件（銀座・赤坂・六本木・新橋・恵比寿） |
| Review | 各店舗 2〜3件 |

---

## 6. RDS 設定推奨値

| パラメータ | 開発 | 本番 |
|-----------|------|------|
| インスタンスクラス | db.t3.micro | db.t3.small |
| ストレージ | 20GB (gp2) | 20GB (gp3)、自動スケーリング有効 |
| バックアップ保持期間 | 1日 | 7日 |
| マルチAZ | 無効 | 有効推奨 |
| 暗号化 | 有効 | 有効 |
| character_set_server | utf8mb4 | utf8mb4 |
| collation_server | utf8mb4_unicode_ci | utf8mb4_unicode_ci |
