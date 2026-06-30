---
title: Workers で API を動かす
docs: true
---

# Workers で API を動かす

前章ではフロント（見た目）を Pages に公開しました。でも、投稿を保存したり一覧を返したりする「処理」は
フロントだけでは作れません。そこで登場するのが **Cloudflare Workers** です。

Workers は、リクエストを受けてプログラムを実行する **サーバーレス** の仕組みです。サーバーの台数や
OS を管理する必要はなく、コードを書いて `wrangler deploy` するだけで、世界中の Cloudflare の拠点で
動きます。ここでは [Hono](https://hono.dev/) という軽量フレームワークで API を作ります。

この章ではまだデータベースを使いません。一覧は固定のサンプルを返し、投稿は「受け取るだけ」にします。
保存は次章の D1 で実装します。

## TODO

1. Worker の API をローカルで起動し、ブラウザでレスポンスを確認する
2. フロントから API を呼び出し、一覧が表示されることを確認する
3. Worker を Cloudflare に公開する

## 学ぶこと

- サーバーレス（Workers）とは何か。「処理」をどこで動かすのか
- API の基本（GET で取得、POST で送信、JSON でやり取り）
- 入力チェックは **サーバー側でも必ず行う**（フロントのチェックは迂回できる）
- **CORS**：フロント（Pages）と API（Workers）が別の URL（オリジン）にあると、ブラウザは既定で
  リクエストをブロックする。サーバー側で「このオリジンからは許可」と返す必要がある

## 説明

### TODO 1: API をローカルで起動する

このフォルダで依存をインストールし、Worker を起動します。

```bash
npm install
npx wrangler dev
```

`wrangler dev` が `http://localhost:8787` で起動します。ブラウザで起動を確認しましょう。

ブラウザのアドレスバーに `http://localhost:8787/api/messages` を入力して開くと、サンプルのひとこと一覧が
JSON で返ってきます（アドレスバーから開く＝GET リクエストです）。これで API が動いていることが確認できました。

投稿（POST）は次の TODO 2 で、フロントのフォームから試します。

API の中身は [src/index.js](./src/index.js) です。`app.get('/api/messages', ...)` と
`app.post('/api/messages', ...)` の 2 つのエンドポイントがあります。

### TODO 2: フロントから呼び出す

もう 1 つターミナルを開き、フロントを起動します。

```bash
npx wrangler pages dev ./public --port 8788
```

`http://localhost:8788` を開くと、フロントが起動時に `fetch('http://localhost:8787/api/messages')`
で API を呼び、一覧を表示します。フォームから投稿すると、画面に追加され「まだ保存されない」案内が
出ます。

フロントの呼び出し先は [public/main.js](./public/main.js) の `API_BASE` で指定しています。

### TODO 3: Cloudflare に公開する

```bash
npx wrangler deploy
```

`wrangler.jsonc` の `name` を自分用に変えてから実行してください（例: `hitokoto-api-tanaka`）。
公開されると Worker の URL（`https://<name>.<サブドメイン>.workers.dev`）が表示されます。ブラウザで
`<その URL>/api/messages` を開くと、インターネット越しに JSON が返ります。

公開した Pages から公開した Worker を呼ぶには、[public/main.js](./public/main.js) の
`API_BASE` をこの Worker の URL に書き換えて、フロントを再デプロイ（前章の `wrangler pages deploy`）
します。

## コラム

### CORS とは

フロントは `:8788`、API は `:8787` と **別のオリジン** です。ブラウザはセキュリティのため、別オリジンへの
リクエストを既定でブロックします（同一オリジンポリシー）。これを許可するのが **CORS** です。

[src/index.js](./src/index.js) の冒頭で、Hono の `cors()` を使って許可を返しています。

```js
app.use('/api/*', cors({
  origin: '*',                              // どのオリジンからでも許可（学習用）
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));
```

試しにこの `app.use('/api/*', cors({...}))` の行をコメントアウトして保存し、ブラウザの
DevTools（Console / Network タブ）を見ると、CORS エラーで一覧が取得できなくなることが確認できます。
確認したら戻しておきましょう。

> **本番では `origin: '*'` を避ける**のが基本です。自分の Pages の URL
> （例: `'https://hitokoto-board-tanaka.pages.dev'`）に絞ると、他サイトから API を勝手に使われる
> リスクを減らせます。

### npm scripts でコマンドを短くする

このレクチャーでは `npx wrangler dev` のように **そのままのコマンド** を打ってきましたが、毎回フルで
入力するのは大変です。よく使うコマンドは [package.json](./package.json) の `scripts` に名前を付けて
登録しておけます。

```jsonc
{
  "scripts": {
    "dev": "wrangler dev",                          // npm run dev
    "front": "wrangler pages dev ./public --port 8788", // npm run front
    "deploy": "wrangler deploy"                      // npm run deploy
  }
}
```

こうしておくと、長いコマンドの代わりに短い名前で同じことが実行できます。

```bash
npm run dev      # = npx wrangler dev
npm run front    # = npx wrangler pages dev ./public --port 8788
npm run deploy   # = npx wrangler deploy
```

このフォルダの `package.json` には最初からこの scripts が入っているので、`npm run dev` のように
呼んでも動きます。中身（どんなコマンドが動くのか）を理解しておくと、トラブル時に追いやすくなります。

## 次の章へ

API ができたら、いよいよ投稿を **保存** します。次は [D1 でデータを保存する](../04-d1/LECTURE.md)
に進みます。
