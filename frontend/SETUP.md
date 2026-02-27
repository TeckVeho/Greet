# セットアップガイド

## 1. 必要な依存関係のインストール

ターミナルを開き、以下のコマンドを実行してください：

```bash
cd /Users/kohei/settai
npm install lucide-react class-variance-authority clsx tailwind-merge
```

## 2. 開発サーバーの起動

依存関係のインストールが完了したら、開発サーバーを起動します：

```bash
npm run dev
```

## 3. ブラウザで確認

ブラウザで以下のURLを開いてください：

```
http://localhost:3000
```

## 実装済み機能

✅ **飲食店一覧画面（テーブルビュー）**
- 店名、エリア、ジャンル、個室、価格帯、喫煙可否を表示
- リアルタイム検索機能
- ホバーエフェクト

✅ **飲食店詳細画面（ページビュー）**
- カバー画像とアイコン
- プロパティセクション
- Calloutブロックを使った利用レビュー

✅ **登録・編集モーダル**
- センターピーク表示
- フォームバリデーション

✅ **サイドバーナビゲーション**
- 折りたたみ可能
- アクティブ状態のハイライト

✅ **Notion風UIコンポーネント**
- Badge（タグ）
- Callout（コールアウト）
- Button、Input、Dialog等

✅ **インタラクション**
- スムーズなホバーエフェクト
- フォーカススタイル
- アニメーション

## トラブルシューティング

### ポート3000が使用中の場合

```bash
npm run dev -- -p 3001
```

### 依存関係のエラーが出る場合

```bash
rm -rf node_modules package-lock.json
npm install
npm install lucide-react class-variance-authority clsx tailwind-merge
```

## 次のステップ

1. モックデータを編集して、実際の飲食店情報を追加
2. フィルター機能の実装
3. データベース連携（Supabase / Prisma）
4. 認証機能の追加
