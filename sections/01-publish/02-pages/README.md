# 02-pages - Pages でフロントを公開する

「ひとことボード」アプリの **フロント（静的サイト）** だけを Cloudflare Pages に公開するレクチャー
です。HTML / CSS / JavaScript だけのシンプルなページを、世界中に配信される URL で公開します。
スタイルは Bootstrap（CDN）を読み込んで当てています。

## 構成

```text
public/
  index.html   ひとことボードの見た目（フォーム + 一覧）。スタイルは Bootstrap（CDN）
  main.js      投稿の保存・表示（この章はブラウザの localStorage に保存）
package.json   依存（wrangler）
```

> このレクチャーは、あえて設定ファイル `wrangler.jsonc` を置いていません。公開に必要な「公開フォルダ」
> と「プロジェクト名」を、まずコマンドと対話で渡して基本構造を理解します。

## 起動方法

すべて **このフォルダ（`sections/01-publish/02-pages/`）の中** で実行します。

### 準備

```bash
npm ci
```

### ローカルで確認

```bash
npx wrangler pages dev ./public
```

表示された `http://localhost:8788`（ポートは変わることがあります）をブラウザで開きます。

### Cloudflare に公開

事前に `npx wrangler login` 済みであること。公開フォルダ（`./public`）を指定して実行し、初回は対話で
プロジェクト名を入力します。

```bash
npx wrangler pages deploy ./public
```

公開 URL（`https://<name>.pages.dev`）が表示されます。`wrangler.jsonc` を作っておくと、次回からは
`npx wrangler pages deploy` だけで公開できます。
