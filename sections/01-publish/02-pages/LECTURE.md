---
title: Pages でフロントを公開する
docs: true
---

# Pages でフロントを公開する

アプリの公開で最初にやることは、多くの場合「画面（フロント）を見られる状態にする」ことです。
ここでは「ひとことボード」の HTML / CSS を **Cloudflare Pages** に公開し、世界中からアクセスできる
URL を手に入れます。

Cloudflare Pages は、HTML・CSS・画像のような **静的ファイルをそのまま配信** するサービスです。
サーバーの管理は不要で、無料枠でも帯域は実質無制限。AI に作らせたランディングページや、フロントエンド
フレームワーク（React など）のビルド結果を置く先として最適です。

## TODO

1. ローカルでフロントの見た目を確認する
2. Cloudflare Pages に公開して、`*.pages.dev` の URL でアクセスできることを確認する
3. ファイルを直して再デプロイし、変更が反映されることを確認する

## 学ぶこと

- 静的サイトのホスティングとは何か（サーバー管理なしで HTML を配信する）
- `wrangler pages dev` でローカル確認 → `wrangler pages deploy` で公開、という基本の流れ
- 「フロントだけでは保存ができない」こと。動的な処理（投稿の保存）には次章の API が要る、という
  役割分担

## 説明

### TODO 1: ローカルで確認する

このフォルダ（`sections/01-publish/02-pages/`）で、まず依存をインストールします。

```bash
npm install
```

ローカルプレビューを起動します。

```bash
npm run dev
```

`wrangler pages dev ./public` が動き、`http://localhost:8788`（ポートは変わることがあります）が
表示されます。ブラウザで開くと「ひとことボード」が表示されます。投稿フォームに入力して送信すると、
「まだ保存されません」という案内が出ます。これは想定どおりで、**この章ではフロントだけ**だからです。

中身は [public/index.html](./public/index.html) と [public/style.css](./public/style.css) です。
特別な仕組みはなく、ただの HTML と CSS です。

### TODO 2: Cloudflare Pages に公開する

まず、ログインしているか確認します（まだなら [前の章](../01-account/LECTURE.md) を参照）。

```bash
npx wrangler whoami
```

[wrangler.jsonc](./wrangler.jsonc) の `name` は世界で 1 つの名前です。他の人と重複しないよう、
自分用に書き換えます（例: `hitokoto-board-tanaka`）。

```jsonc
{
  "name": "hitokoto-board-あなたの名前",
  "pages_build_output_dir": "./public"
}
```

公開します。

```bash
npm run deploy
```

初回はプロジェクトが自動作成され、しばらくすると公開 URL（`https://<name>.pages.dev`）が表示されます。
ブラウザで開いて、さっきと同じ画面がインターネット上に出ていれば成功です。スマホからも開いてみましょう。

> `wrangler pages deploy` は、指定したフォルダ（`./public`）の中身をそのままアップロードする
> **Direct Upload** という方式です。GitHub 連携で push のたびに自動ビルド・公開する方法もありますが、
> まずは手元から直接上げる形で「公開とは何か」を体感します。

### TODO 3: 直して再デプロイする

[public/index.html](./public/index.html) の見出しやサンプルのひとことを書き換えて、もう一度
`npm run deploy` してみましょう。数十秒で URL の内容が更新されます。

このように Pages は「静的ファイルを置くと URL で配信される」シンプルな仕組みです。次は、投稿を実際に
受け取って処理する **サーバー側（API）** を Workers で作ります。

## 補足: Pages と Workers の役割

- **Pages** … HTML/CSS/画像などの静的ファイルを配信する（見た目・フロント）
- **Workers** … リクエストを受けてプログラムを実行する（処理・API）

「ひとことを保存する」「一覧を返す」といった動的な処理はフロントだけでは作れません。次章でその役割を
担う Workers を作り、フロントから呼び出します。

## 次の章へ

フロントが公開できたら、次は [Workers で API を動かす](../03-workers/LECTURE.md) に進みます。
