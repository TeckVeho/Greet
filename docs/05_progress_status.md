# 05 進捗状況

最終更新: 2026-02-17

---

## 1. フェーズ全体概要

| フェーズ | 内容 | ステータス | 進捗 |
|---------|------|-----------|------|
| Phase 1 | フロントエンド実装 | **完了** | 100% |
| Phase 2 | バックエンド実装（Express + RDS） | **未着手** | 0% |
| Phase 3 | フロントエンド API 接続 | **未着手** | 0% |
| Phase 4 | テスト構築（UT / IT / E2E） | **未着手** | 0% |
| Phase 5 | インフラ構築・デプロイ（EC2 / RDS） | **未着手** | 0% |

---

## 2. Phase 1: フロントエンド実装（完了）

### 2.1 画面・ページ

| # | 機能 | ファイル | ステータス |
|---|------|---------|-----------|
| 1 | ログインページ | `app/login/page.tsx` | ✅ 完了 |
| 2 | ホーム（飲食店一覧） | `app/page.tsx` | ✅ 完了 |
| 3 | 飲食店詳細 | `app/restaurant/[id]/page.tsx` | ✅ 完了 |
| 4 | エリア別一覧 | `app/area/page.tsx` | ✅ 完了 |
| 5 | ジャンル別一覧 | `app/genre/page.tsx` | ✅ 完了 |
| 6 | お気に入り一覧 | `app/favorites/page.tsx` | ✅ 完了 |
| 7 | ユーザー管理（管理者） | `app/admin/users/page.tsx` | ✅ 完了 |

### 2.2 コンポーネント

| # | コンポーネント | ファイル | ステータス |
|---|--------------|---------|-----------|
| 1 | アプリレイアウト | `components/app-layout.tsx` | ✅ 完了 |
| 2 | サイドバー | `components/sidebar.tsx` | ✅ 完了 |
| 3 | 飲食店テーブル | `components/restaurant-table.tsx` | ✅ 完了 |
| 4 | 飲食店カード | `components/restaurant-cards.tsx` | ✅ 完了 |
| 5 | 飲食店登録・編集 | `components/restaurant-form-dialog.tsx` | ✅ 完了 |
| 6 | 検索・フィルターバー | `components/search-filter-bar.tsx` | ✅ 完了 |
| 7 | フィルターダイアログ | `components/filter-dialog.tsx` | ✅ 完了 |
| 8 | グローバル検索 | `components/global-search-dialog.tsx` | ✅ 完了 |
| 9 | レビュー投稿 | `components/review-form-dialog.tsx` | ✅ 完了 |
| 10 | ユーザーテーブル | `components/user-table.tsx` | ✅ 完了 |
| 11 | ユーザー登録・編集 | `components/user-form-dialog.tsx` | ✅ 完了 |

### 2.3 状態管理・ユーティリティ

| # | 機能 | ファイル | ステータス | 備考 |
|---|------|---------|-----------|------|
| 1 | 型定義 | `lib/types.ts` | ✅ 完了 | |
| 2 | 認証コンテキスト | `lib/auth-context.tsx` | ✅ 完了 | モックデータ使用中 |
| 3 | お気に入りコンテキスト | `lib/favorites-context.tsx` | ✅ 完了 | localStorage使用中 |
| 4 | モック飲食店データ | `lib/mock-data.ts` | ✅ 完了 | API接続後に削除 |
| 5 | モックユーザーデータ | `lib/mock-users.ts` | ✅ 完了 | API接続後に削除 |
| 6 | モック会社データ | `lib/mock-companies.ts` | ✅ 完了 | API接続後に削除 |
| 7 | ユーティリティ関数 | `lib/utils.ts` | ✅ 完了 | |

---

## 3. Phase 2: バックエンド実装（未着手）

### 3.1 プロジェクトセットアップ

| # | タスク | ステータス | 担当 |
|---|--------|-----------|------|
| 1 | `backend/` ディレクトリ作成・package.json 初期化 | ⬜ 未着手 | - |
| 2 | TypeScript + Express 環境構築 | ⬜ 未着手 | - |
| 3 | Prisma セットアップ・schema.prisma 作成 | ⬜ 未着手 | - |
| 4 | 環境変数設定（.env） | ⬜ 未着手 | - |
| 5 | ESLint / Prettier 設定 | ⬜ 未着手 | - |

### 3.2 データベース

| # | タスク | ステータス | 担当 |
|---|--------|-----------|------|
| 6 | Prisma マイグレーション実行 | ⬜ 未着手 | - |
| 7 | シーダー実装（初期データ投入） | ⬜ 未着手 | - |

### 3.3 ミドルウェア

| # | タスク | ステータス | 担当 |
|---|--------|-----------|------|
| 8 | JWT 認証ミドルウェア（`auth.middleware.ts`） | ⬜ 未着手 | - |
| 9 | 管理者チェックミドルウェア（`admin.middleware.ts`） | ⬜ 未着手 | - |
| 10 | バリデーションミドルウェア（`validate.middleware.ts`） | ⬜ 未着手 | - |
| 11 | エラーハンドリングミドルウェア（`error.middleware.ts`） | ⬜ 未着手 | - |

### 3.4 API 実装

| # | エンドポイント | タスク | ステータス | 担当 |
|---|--------------|--------|-----------|------|
| 12 | POST /auth/login | ログインAPI | ⬜ 未着手 | - |
| 13 | POST /auth/logout | ログアウトAPI | ⬜ 未着手 | - |
| 14 | GET /auth/me | 自分の情報取得API | ⬜ 未着手 | - |
| 15 | GET /restaurants | 飲食店一覧API | ⬜ 未着手 | - |
| 16 | GET /restaurants/:id | 飲食店詳細API | ⬜ 未着手 | - |
| 17 | POST /restaurants | 飲食店登録API | ⬜ 未着手 | - |
| 18 | PUT /restaurants/:id | 飲食店更新API | ⬜ 未着手 | - |
| 19 | DELETE /restaurants/:id | 飲食店削除API | ⬜ 未着手 | - |
| 20 | POST /restaurants/:id/reviews | レビュー投稿API | ⬜ 未着手 | - |
| 21 | DELETE /reviews/:id | レビュー削除API | ⬜ 未着手 | - |
| 22 | GET /favorites | お気に入り一覧API | ⬜ 未着手 | - |
| 23 | POST /favorites | お気に入り追加API | ⬜ 未着手 | - |
| 24 | DELETE /favorites/:restaurantId | お気に入り削除API | ⬜ 未着手 | - |
| 25 | GET /users | ユーザー一覧API | ⬜ 未着手 | - |
| 26 | POST /users | ユーザー登録API | ⬜ 未着手 | - |
| 27 | PUT /users/:id | ユーザー更新API | ⬜ 未着手 | - |
| 28 | DELETE /users/:id | ユーザー削除API | ⬜ 未着手 | - |
| 29 | GET /companies | 会社一覧API | ⬜ 未着手 | - |
| 30 | POST /companies | 会社登録API | ⬜ 未着手 | - |

---

## 4. Phase 3: フロントエンド API 接続（未着手）

| # | タスク | ステータス | 担当 |
|---|--------|-----------|------|
| 1 | axios クライアント作成（`lib/api/client.ts`） | ⬜ 未着手 | - |
| 2 | JWT トークン自動付与インターセプター | ⬜ 未着手 | - |
| 3 | 認証APIクライアント（`lib/api/auth.ts`） | ⬜ 未着手 | - |
| 4 | 飲食店APIクライアント（`lib/api/restaurants.ts`） | ⬜ 未着手 | - |
| 5 | レビューAPIクライアント（`lib/api/reviews.ts`） | ⬜ 未着手 | - |
| 6 | お気に入りAPIクライアント（`lib/api/favorites.ts`） | ⬜ 未着手 | - |
| 7 | ユーザーAPIクライアント（`lib/api/users.ts`） | ⬜ 未着手 | - |
| 8 | 会社APIクライアント（`lib/api/companies.ts`） | ⬜ 未着手 | - |
| 9 | `AuthContext` をAPI接続に切り替え | ⬜ 未着手 | - |
| 10 | `FavoritesContext` をAPI接続に切り替え | ⬜ 未着手 | - |
| 11 | 各ページのモックデータをAPI呼び出しに置き換え | ⬜ 未着手 | - |
| 12 | モックデータファイル削除 | ⬜ 未着手 | - |

---

## 5. Phase 4: テスト構築（未着手）

### 5.1 単体テスト（UT） - Jest

| # | テスト対象 | ステータス | 担当 |
|---|-----------|-----------|------|
| 1 | `auth.service.ts` - ログイン成功・失敗 | ✅ 完了 | Copilot |
| 2 | `auth.service.ts` - JWT生成・検証 | ✅ 完了 | Copilot |
| 3 | `restaurant.service.ts` - CRUD | ✅ 完了 | Copilot |
| 4 | `restaurant.service.ts` - フィルタリング | ✅ 完了 | Copilot |
| 5 | `review.service.ts` - レビュー投稿・削除 | ✅ 完了 | Copilot |
| 6 | `user.service.ts` - ユーザーCRUD | ✅ 完了 | Copilot |
| 7 | `jwt.ts` - トークン生成・検証・期限切れ | ✅ 完了 | Copilot |
| 8 | `password.ts` - ハッシュ化・比較 | ✅ 完了 | Copilot |
| 9 | フロントエンド: `AuthContext` | ✅ 完了 | Copilot |
| 10 | フロントエンド: `FavoritesContext` | ✅ 完了 | Copilot |
| 11 | フロントエンド: `DialogRestaurantCreate`（旧 `RestaurantFormDialog` 相当） | ✅ 完了 | Copilot |
| 12 | フロントエンド: `SearchFilterBar` | ✅ 完了 | Copilot |

### 5.2 インテグレーションテスト（IT） - Supertest

| # | テスト対象 | ステータス | 担当 |
|---|-----------|-----------|------|
| 1 | `POST /auth/login` - 正常ログイン | ✅ 完了 | Copilot |
| 2 | `POST /auth/login` - 誤パスワード | ✅ 完了 | Copilot |
| 3 | `GET /restaurants` - 認証なしで 401 | ✅ 完了 | Copilot |
| 4 | `GET /restaurants` - 一覧取得 | ✅ 完了 | Copilot |
| 5 | `GET /restaurants` - フィルタリング | ✅ 完了 | Copilot |
| 6 | `POST /restaurants` - 登録成功 | ✅ 完了 | Copilot |
| 7 | `POST /restaurants` - バリデーションエラー | ✅ 完了 | Copilot |
| 8 | `PUT /restaurants/:id` - 更新成功 | ✅ 完了 | Copilot |
| 9 | `DELETE /restaurants/:id` - admin のみ | ✅ 完了 | Copilot |
| 10 | `POST /restaurants/:id/reviews` - 投稿成功 | ✅ 完了 | Copilot |
| 11 | `GET /users` - admin のみアクセス可 | ✅ 完了 | Copilot |
| 12 | `POST /users` - ユーザー登録 | ✅ 完了 | Copilot |
| 13 | お気に入り追加・削除・一覧 | ✅ 完了 | Copilot |

### 5.3 E2Eテスト（E2E） - Playwright

| # | シナリオ | ステータス | 担当 |
|---|---------|-----------|------|
| 1 | ログインフロー（正常） | ✅ 完了 | Copilot |
| 2 | ログインフロー（エラー表示） | ✅ 完了 | Copilot |
| 3 | 飲食店一覧表示・検索 | ✅ 完了 | Copilot |
| 4 | フィルター適用・解除 | ⬜ 未着手 | - |
| 5 | 飲食店登録フロー | ⬜ 未着手 | - |
| 6 | 飲食店詳細表示・レビュー投稿 | ⬜ 未着手 | - |
| 7 | お気に入り追加・削除・一覧確認 | ⬜ 未着手 | - |
| 8 | エリア別・ジャンル別ページ | ⬜ 未着手 | - |
| 9 | 管理者: ユーザー管理ページアクセス | ⬜ 未着手 | - |
| 10 | 一般ユーザー: 管理者ページへのアクセス制御 | ⬜ 未着手 | - |
| 11 | グローバル検索（Cmd+K） | ⬜ 未着手 | - |

---

## 6. Phase 5: インフラ構築・デプロイ（未着手）

| # | タスク | ステータス | 担当 |
|---|--------|-----------|------|
| 1 | AWS VPC・サブネット設計 | ⬜ 未着手 | - |
| 2 | EC2 インスタンス起動・設定 | ⬜ 未着手 | - |
| 3 | RDS (MySQL 8.0) 作成・設定 | ⬜ 未着手 | - |
| 4 | Security Group 設定 | ⬜ 未着手 | - |
| 5 | Node.js / PM2 インストール | ⬜ 未着手 | - |
| 6 | 環境変数設定（本番） | ⬜ 未着手 | - |
| 7 | フロントエンドビルド・デプロイ | ⬜ 未着手 | - |
| 8 | バックエンドデプロイ・PM2 起動 | ⬜ 未着手 | - |
| 9 | HTTPS 設定（SSL証明書） | ⬜ 未着手 | - |
| 10 | 動作確認・スモークテスト | ⬜ 未着手 | - |

---

## 7. 既知の技術的課題・TODO

| # | 課題 | 優先度 | 備考 |
|---|------|--------|------|
| 1 | `AuthContext` がモックデータ依存（localStorage認証）→ JWT API認証に置き換えが必要 | 高 | Phase 3 で対応 |
| 2 | `FavoritesContext` がローカルストレージ依存→ DB永続化が必要 | 高 | Phase 3 で対応 |
| 3 | 飲食店・ユーザーのCRUDがモックデータ操作→ API経由に置き換えが必要 | 高 | Phase 3 で対応 |
| 4 | 画像アップロード機能が未実装（現在は URL 直接入力） | 中 | S3 等の利用を検討 |
| 5 | ページネーションがフロントエンド側のみで実装→ サーバーサイドページネーションに変更が必要 | 中 | Phase 3 で対応 |
| 6 | エラーハンドリングが未整備（API接続時のエラー表示） | 中 | Phase 3 で対応 |
| 7 | ローディング状態の表示が未実装 | 低 | Phase 3 で対応 |

---

## 8. ドキュメント管理

| ドキュメント | ファイル | 最終更新 |
|------------|---------|---------|
| システム概要 | `docs/01_system_overview.md` | 2026-02-17 |
| 詳細設計 | `docs/02_detailed_design.md` | 2026-02-17 |
| データベース設計 | `docs/03_database_design.md` | 2026-02-17 |
| API設計 | `docs/04_api_design.md` | 2026-02-17 |
| 進捗状況 | `docs/05_progress_status.md` | 2026-02-17 |
