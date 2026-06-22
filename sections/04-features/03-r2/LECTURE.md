---
title: R2 で画像・ファイルを保存する
docs: true
---

# R2 で画像・ファイルを保存する

D1 は「文字や数値の表」を扱うデータベースでした。一方、画像・PDF・動画のような **ファイル** を保存する
には、オブジェクトストレージが向いています。Cloudflare のそれが **R2** です。

R2 は Amazon S3 と互換のある API を持ち、最大の特徴は **下り（egress）転送が無料** なこと。画像を
たくさん配信するアプリでも、転送量の請求に怯えずに済みます。

このレクチャーでは、ファイルをアップロードして R2 に保存し、URL で配信する最小例を動かします。

## TODO

1. アップロードフォームの Worker を起動し、ファイルを保存・表示できることを確認する
2. R2 に保存・取得するコードを読む
3. （任意）本番バケットを作って公開する
4. 公開配信の選択肢（r2.dev / カスタムドメイン / Worker 経由）を理解する

## 学ぶこと

- オブジェクトストレージとデータベースの使い分け（ファイルは R2、構造化データは D1）
- R2 の基本：`env.BUCKET.put(key, body)` で保存、`env.BUCKET.get(key)` で取得、`list()` で一覧
- ファイルのメタ情報（Content-Type）を保存し、配信時に返すこと
- R2 の強み（egress 無料）と、公開配信の方法の選択肢

## 説明

### TODO 1: 起動してアップロードする

```bash
npm install
npm run dev
```

`http://localhost:8787` を開き、ファイルを選んで「アップロード」を押します。一覧に表示され、クリック
すると開けます。ローカルでは実際の R2 バケットがなくても、ローカルに保存されて動きます。

### TODO 2: コードを読む

[src/index.js](./src/index.js) を見ます。保存（PUT）:

```js
const obj = await c.env.BUCKET.put(key, c.req.raw.body, {
  httpMetadata: { contentType: c.req.header('content-type') ?? 'application/octet-stream' },
});
```

取得・配信（GET）:

```js
const obj = await c.env.BUCKET.get(key);
if (!obj) return c.notFound();
const headers = new Headers();
obj.writeHttpMetadata(headers);   // 保存時の Content-Type などを復元
return new Response(obj.body, { headers });
```

`env.BUCKET` は [wrangler.jsonc](./wrangler.jsonc) の `r2_buckets` の binding 名です。`put` の
キー（ここではファイル名）が、後で取り出すときの目印になります。

> 実運用では、ファイル名をそのままキーにすると上書きや衝突が起きます。`時刻 + ランダム文字列` や
> `ユーザーID/ファイル名` のように一意なキーにするのが定石です。アップロードを誰でもできる状態は
> [踏み台](../../03-security/02-abuse/LECTURE.md) のリスクにもなるので、本番では認証や
> サイズ・種類の制限も検討します。

### TODO 3: 本番バケットを作って公開する（任意）

```bash
npm run bucket:create     # wrangler r2 bucket create handson-uploads
npm run deploy
```

> R2 の利用には、無料枠の範囲でも支払い方法の登録を求められることがあります。

### TODO 4: 公開配信の選択肢

R2 のファイルを外部に見せる方法はいくつかあります。

- **r2.dev 開発 URL** … ダッシュボードで公開アクセスを有効化すると `https://pub-xxxx.r2.dev/<key>` で
  直接配信。お試し向け（本番非推奨・レート制限あり）
- **カスタムドメイン** … バケットに独自ドメインを紐付ける。CDN キャッシュが効き本番向き
- **Worker 経由**（このデモの方式）… Worker でラップすると、認証・アクセス制御・キャッシュ制御を
  自分で行える

## 次の章へ

最後に [無料枠の「その先」｜課金の見極め方](../04-pricing/LECTURE.md) で、ここまで使ってきた各機能の
無料枠と課金について整理します。
