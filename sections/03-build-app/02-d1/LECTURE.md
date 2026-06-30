---
title: D1 でデータを保存する
docs: true
---

# D1 でデータを保存する

前章の API は、投稿を受け取っても保存していませんでした（Worker は基本的に状態を持たないため、変数に
ためても次のリクエストでは消えてしまいます）。データを **ずっと残す** には、データベースが必要です。

ここで使うのが **Cloudflare D1**。SQLite ベースのデータベースで、Worker から直接読み書きできます。
これでようやく「ひとことボード」が完成します。

このハンズオンでは ORM（オブジェクト関係マッピング）は使わず、**生の SQL** を書きます。中で何が
起きているかが見えるほうが、仕組みを理解しやすいからです。

## TODO

1. D1 データベースを作り、`wrangler.jsonc` に binding を設定する
2. マイグレーションでテーブルを作る（ローカル・本番それぞれ）
3. Worker から D1 に読み書きするコードを読む
4. ローカルで投稿が保存されることを確認する
5. 本番に公開して、インターネット越しに保存できることを確認する

## 学ぶこと

- データベースの役割（処理が終わってもデータが残る）
- D1 の基本：`prepare(...).bind(...).all()/run()` で SQL を実行する
- 値は必ず **プレースホルダ `?` でバインド** する（文字列連結で SQL を作らない＝SQLインジェクション対策）
- **ローカル D1 と本番 D1 は別物**。マイグレーションは両方に適用が必要

## 説明

### TODO 1: D1 を作る

このフォルダで依存をインストールし、データベースを作ります。

```bash
npm install
npx wrangler d1 create hitokoto-db
```

実行すると `database_id` が表示されます。これを [wrangler.jsonc](./wrangler.jsonc) の `database_id`
に貼り付けます。

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "hitokoto-db",
    "database_id": "（ここに貼る）",
    "migrations_dir": "migrations"
  }
]
```

`binding` の `"DB"` が、Worker のコードで `c.env.DB` として使う名前です。

### TODO 2: マイグレーションでテーブルを作る

テーブル定義は [migrations/0001_init.sql](./migrations/0001_init.sql) にあります。これを適用します。

```bash
npx wrangler d1 migrations apply hitokoto-db --local     # ローカル（wrangler dev が使う SQLite）
npx wrangler d1 migrations apply hitokoto-db --remote    # 本番（公開後に使う D1）
```

> **ここが最頻のつまずきポイント**：ローカルと本番は完全に別のデータベースです。片方にしか適用して
> いないと「ローカルでは動くのに公開すると table が無い」エラーになります。両方に流しましょう。

### TODO 3: 読み書きのコードを読む

[src/index.js](./src/index.js) を見ます。一覧の取得（GET）:

```js
const { results } = await c.env.DB.prepare(
  'SELECT id, name, body, created_at FROM messages ORDER BY id DESC LIMIT 100',
).all();
return c.json(results);
```

投稿の保存（POST）:

```js
const result = await c.env.DB.prepare(
  'INSERT INTO messages (name, body) VALUES (?, ?)',
).bind(name, body).run();
```

`?` がプレースホルダで、`.bind(name, body)` の値が安全に当てはめられます。**ユーザーの入力を直接
SQL 文字列に連結しない** のが鉄則です（連結すると SQL インジェクションの入り口になります）。

### TODO 4: ローカルで保存を確認する

ターミナルを 2 つ使います。

```bash
npx wrangler dev                                 # ターミナル1: Worker（API）:8787
npx wrangler pages dev ./public --port 8788      # ターミナル2: フロント :8788
```

`http://localhost:8788` を開いて投稿し、**ページを再読み込みしても残っている** ことを確認します。
保存されたデータは次のコマンドでも確認できます。

```bash
npx wrangler d1 execute hitokoto-db --local --command "SELECT * FROM messages"
```

### TODO 5: 本番に公開する

```bash
npx wrangler deploy
```

公開後の Worker から本番 D1 を使うには、TODO 2 の `db:migrate:remote` が済んでいる必要があります。
公開 Worker の URL を `public/main.js` の `API_BASE` に設定し、フロントを再デプロイすれば、
インターネット上の「ひとことボード」が完成です。

本番 D1 の中身も確認できます。

```bash
npx wrangler d1 execute hitokoto-db --remote --command "SELECT * FROM messages"
```

## まとめ

ここまでで、**フロント（Pages）＋ API（Workers）＋ データベース（D1）** という、現代的なフルスタック
アプリの最小構成を、すべて Cloudflare の無料枠で公開できました。

次の章では、これに **画像の添付（R2）** を足して、データの種類ごとに保存先を使い分けます。

## コラム

### npm scripts でコマンドを短くする

この章では `npx wrangler d1 migrations apply hitokoto-db --local` のような **長いコマンド** を
何度か打ちました。よく使うものは [package.json](./package.json) の `scripts` に名前を付けて
登録しておくと、短い名前で呼べます。

```jsonc
{
  "scripts": {
    "dev": "wrangler dev",                                          // npm run dev
    "front": "wrangler pages dev ./public --port 8788",             // npm run front
    "deploy": "wrangler deploy",                                    // npm run deploy
    "db:create": "wrangler d1 create hitokoto-db",                  // npm run db:create
    "db:migrate:local": "wrangler d1 migrations apply hitokoto-db --local",   // npm run db:migrate:local
    "db:migrate:remote": "wrangler d1 migrations apply hitokoto-db --remote"  // npm run db:migrate:remote
  }
}
```

こうしておくと、次のように短く実行できます。

```bash
npm run db:create           # = npx wrangler d1 create hitokoto-db
npm run db:migrate:local    # = npx wrangler d1 migrations apply hitokoto-db --local
npm run db:migrate:remote   # = npx wrangler d1 migrations apply hitokoto-db --remote
npm run dev                 # = npx wrangler dev
npm run front               # = npx wrangler pages dev ./public --port 8788
npm run deploy              # = npx wrangler deploy
```

このフォルダの `package.json` には最初からこの scripts が入っているので、`npm run db:migrate:local`
のように呼んでも動きます。`db:migrate:remote` のような **打ち間違えると本番に影響するコマンド** ほど、
名前で固定しておくと安全です。

## 次の章へ

次は [R2 で画像を保存する](../03-r2/LECTURE.md) で、投稿に画像を添付できるようにし、
**ファイルは R2・構造化データは D1** という保存先の使い分けを体験します。
