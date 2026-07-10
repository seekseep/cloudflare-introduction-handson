---
title: Workers で API を動かす
docs: true
---

# Workers で API を動かす

[ウェブアプリの基本](../../01-publish/03-webapp/LECTURE.md) で見たとおり、アプリには「フロント」
「API（処理）」「データ」の層があります。フロント（見た目）はすでに Pages に公開しました。次は、投稿を
保存したり一覧を返したりする「処理」を作る番です。そこで登場するのが **Cloudflare Workers** です。

Workers は、リクエストを受けてプログラムを実行する **サーバーレス** の仕組みです。サーバーの台数や
OS を管理する必要はなく、コードを書いて `wrangler deploy` するだけで、世界中の Cloudflare の拠点で
動きます。ここでは [Hono](https://hono.dev/) という軽量フレームワークで API を作ります。

![ブラウザのリクエストがCloudflareの拠点で動くWorkerに届き、コードが処理してレスポンスを返す](./images/01-serverless-worker.svg)

<!-- genfig: 左にブラウザ(🌐)、中央にCloudflareの拠点で動くWorker(⚙️)、右にレスポンス。「リクエスト」がブラウザからWorkerへ入り(SOURCE-PATH-GOAL)、Workerの中でコードが実行され(CONTAINER:中で処理)、「レスポンス」が戻る往復。サーバーの台数管理が不要＝Workerの箱だけがある点を強調。リクエスト/レスポンスは矢印のラベルで表現（絵文字ノードにしない）。絵文字: ブラウザ=🌐, 処理/Worker=⚙️。イメージスキーマ = SOURCE-PATH-GOAL + CONTAINER。 -->
*図: リクエストを受けて Worker（⚙️）がコードを実行し、レスポンスを返す。サーバーの管理は不要。*

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

![ポート8788のフロントがポート8787のAPIをfetchで呼び、一覧を受け取る](./images/02-front-calls-api.svg)

<!-- genfig: 左にフロント(🌐 ":8788" ラベル)、右にAPI(⚙️ ":8787" ラベル)を別々の箱として置く。フロントから「fetch /api/messages」の矢印がAPIへ向かい(SOURCE-PATH-GOAL)、APIから「一覧JSON」の矢印が戻る往復。やり取りは矢印のラベルで表現（絵文字ノードにしない）。2つが別のオリジン(別の箱)である点を視覚的に分ける。絵文字: フロント=🌐, API/処理=⚙️。イメージスキーマ = SOURCE-PATH-GOAL + CONTAINER(別オリジン2箱)。 -->
*図: フロント（:8788）が API（:8787）を呼び出し、一覧を受け取る。2つは別のオリジンで動く。*

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

![別オリジンへのリクエストはブラウザに既定でブロックされ、CORS許可があると通る](./images/03-cors-blockage.svg)

<!-- genfig: 上下2段の対比図。上段「CORSなし」: フロント(🌐)→APIへの矢印が壁(🚧)で止められる(FORCE:BLOCKAGE)。下段「CORS許可あり」: 同じ矢印が壁の代わりに開いた門を通ってAPI(⚙️)へ到達する。ブラウザの安全機構が止める→サーバーが許可を返すと通る、という対比を強調。絵文字: フロント=🌐, API/処理=⚙️, ブロック=🚧, 許可/通過=✅。イメージスキーマ = FORCE:BLOCKAGE（許可で解除）+ SOURCE-PATH-GOAL。 -->
*図: 別オリジンへのリクエストは既定でブロックされ（上）、CORS で許可すると通る（下）。*

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

API ができたら、いよいよ投稿を **保存** します。次は [D1 でデータを保存する](../02-d1/LECTURE.md)
に進みます。
