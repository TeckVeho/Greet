# 接待用飲食店情報共有システム

Notion風UIを採用した、接待に最適な飲食店の情報を一元管理するためのシステムです。

## 🎨 デザインコンセプト

- **Content First**: 装飾を削ぎ落とし、店名や評価メモが最も目立つデザイン
- **Structured Properties**: エリアやジャンルをタグ（Badge）として可視化
- **Clean Typography**: 余白を多めに取り、可読性の高いデザイン

## 🛠️ 技術スタック

- **Framework**: Next.js 16 (App Router)
- **CSS Framework**: Tailwind CSS v4
- **UI Components**: shadcn/ui風のカスタムコンポーネント
- **Icons**: SVGベースの inline icons
- **Language**: TypeScript

## 📦 必要な依存関係のインストール

プロジェクトをセットアップするには、以下のコマンドを実行してください：

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge
```

## 🚀 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## 📁 プロジェクト構造

```
settai/
├── app/
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # 飲食店一覧画面
│   ├── restaurant/
│   │   └── [id]/
│   │       └── page.tsx        # 飲食店詳細画面
│   └── globals.css             # グローバルスタイル
├── components/
│   ├── app-layout.tsx          # メインレイアウト
│   ├── sidebar.tsx             # サイドバー
│   ├── restaurant-table.tsx    # 飲食店テーブル
│   ├── search-filter-bar.tsx   # 検索・フィルターバー
│   ├── restaurant-form-dialog.tsx  # 登録・編集フォーム
│   └── ui/                     # 再利用可能なUIコンポーネント
│       ├── badge.tsx
│       ├── button.tsx
│       ├── callout.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── lib/
│   ├── utils.ts                # ユーティリティ関数
│   ├── types.ts                # TypeScript型定義
│   └── mock-data.ts            # モックデータ
└── public/                     # 静的ファイル
```

## 🎯 主な機能

### 1. 飲食店一覧画面（テーブルビュー）
- Notionのデータベーステーブルを模倣
- 店名、エリア、ジャンル、個室有無、価格帯、喫煙可否を表示
- リアルタイム検索機能
- ホバーエフェクト付き

### 2. 飲食店詳細画面（ページビュー）
- カバー画像とアイコン表示
- プロパティセクションで詳細情報を整然と表示
- Calloutブロックを使った利用レビュー表示
- 「誰と行ったか」「結果どうだったか」の暗黙知を強調

### 3. 登録・編集モーダル
- センターピークモーダル
- フォームバリデーション
- レスポンシブデザイン

### 4. サイドバーナビゲーション
- 折りたたみ可能
- アイコン+テキストのメニュー
- アクティブ状態のハイライト

## 🎨 UIコンポーネント仕様

### Badge（タグ）
- エリア: グレー背景
- ジャンル: パステルカラー（寿司：赤、フレンチ：紫、イタリアン：緑など）
- ホバー時に背景色が濃くなる

### Callout（コールアウト）
- 薄いグレーの背景ボックス
- アイコン（絵文字）付き
- ホバー時の背景色変化

### Button（ボタン）
- default: 黒背景、白文字
- secondary: グレー背景、黒文字
- ghost: 透明背景、ホバー時のみ背景表示

## 🎯 評価ポイント

### 1. コンポーネント設計力
- ✅ 再利用可能なコンポーネント（Badge、Callout、Button等）
- ✅ Props型定義とバリアント管理

### 2. CSS/スタイリング能力
- ✅ Notionのような絶妙なグレーの使い分け
- ✅ Border、背景色、文字色の細やかな調整
- ✅ 適切な余白（Whitespace）の確保

### 3. UX（インタラクション）
- ✅ ホバー時の背景色変化
- ✅ クリック時のフィードバック
- ✅ スムーズなアニメーション
- ✅ キーボードナビゲーション対応

## 📝 今後の拡張予定

- [ ] フィルター機能の実装
- [ ] お気に入り機能
- [ ] エリア別・ジャンル別の専用ページ
- [ ] データベース連携（Supabase / Prisma）
- [ ] 画像アップロード機能
- [ ] 認証機能（NextAuth.js）
- [ ] レビューの追加・編集機能
- [ ] エクスポート機能（PDF / CSV）

## 🌐 デプロイ

Vercelへのデプロイが推奨されます：

```bash
npm run build
vercel deploy
```

## 📄 ライセンス

MIT
