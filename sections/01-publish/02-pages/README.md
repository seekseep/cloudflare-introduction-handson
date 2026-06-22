# 02-pages - Pages でフロントを公開する

「ひとことボード」アプリの **フロント（静的サイト）** だけを Cloudflare Pages に公開するレクチャー
です。HTML / CSS だけのシンプルなページを、世界中に配信される URL で公開します。

レクチャーの内容は [LECTURE.md](./LECTURE.md) を参照してください。

## 構成

```text
public/
  index.html   ひとことボードの見た目（フォーム + サンプル表示）
  style.css    スタイル
wrangler.jsonc Pages の設定（プロジェクト名・公開フォルダ）
package.json   npm scripts
```

## 起動方法

### 準備

```bash
npm install
```

### ローカルで確認

```bash
npm run dev        # = wrangler pages dev ./public
```

表示された `http://localhost:8788`（ポートは変わることがあります）をブラウザで開きます。

### Cloudflare に公開

事前に `npx wrangler login` 済みであること。`wrangler.jsonc` の `name` を自分用の名前に変えてから:

```bash
npm run deploy     # = wrangler pages deploy
```

公開 URL（`https://<name>.pages.dev`）が表示されます。

## npm scripts

| コマンド | 説明 |
|---|---|
| `npm run dev` | ローカルで Pages をプレビュー |
| `npm run deploy` | Cloudflare Pages に公開 |
