# 03-workers - Workers で API を動かす

「ひとことボード」の **API（サーバー側）** を Cloudflare Workers で作るレクチャーです。Hono を使って
「ひとこと一覧を返す」「投稿を受け取る」エンドポイントを作り、フロント（Pages）から呼び出します。

この章では **まだデータベースを使わない** ため、一覧は固定のサンプルを返し、投稿は受け取るだけで保存は
しません（保存は次章の D1 で行います）。

レクチャーの内容は [LECTURE.md](./LECTURE.md) を参照してください。

## 構成

```text
src/index.js   Worker 本体（Hono の API。GET/POST /api/messages）
public/        フロント（API を呼び出す。前章とほぼ同じ）
wrangler.jsonc Worker の設定（name・main・compatibility_date）
package.json   npm scripts と依存（hono）
```

## 起動方法

API（Worker）とフロントは別々に起動します。**ターミナルを2つ**使います。

### 準備

```bash
npm install
```

### ターミナル1: API（Worker）

```bash
npm run dev        # = wrangler dev → http://localhost:8787
```

### ターミナル2: フロント

```bash
npm run front      # = wrangler pages dev ./public --port 8788
```

ブラウザで `http://localhost:8788` を開きます。一覧が API から取得されて表示されれば成功です。

### API を単体で試す

```bash
curl http://localhost:8787/api/messages
curl -X POST http://localhost:8787/api/messages \
  -H 'Content-Type: application/json' \
  -d '{"name":"てすと","body":"こんにちは"}'
```

### Cloudflare に公開

```bash
npm run deploy     # = wrangler deploy
```

表示された Worker の URL を、`public/index.html` の `API_BASE` に設定すると、公開した Pages からも
API を呼べます。

## npm scripts

| コマンド | 説明 |
|---|---|
| `npm run dev` | Worker（API）をローカル起動（:8787） |
| `npm run front` | フロントをローカル起動（:8788） |
| `npm run deploy` | Worker を Cloudflare に公開 |
