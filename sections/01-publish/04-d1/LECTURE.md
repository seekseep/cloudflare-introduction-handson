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
npm run db:create        # = wrangler d1 create hitokoto-db
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
npm run db:migrate:local     # ローカル（wrangler dev が使う SQLite）
npm run db:migrate:remote    # 本番（公開後に使う D1）
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
npm run dev        # ターミナル1: Worker（API）:8787
npm run front      # ターミナル2: フロント :8788
```

`http://localhost:8788` を開いて投稿し、**ページを再読み込みしても残っている** ことを確認します。
保存されたデータは次のコマンドでも確認できます。

```bash
npx wrangler d1 execute hitokoto-db --local --command "SELECT * FROM messages"
```

### TODO 5: 本番に公開する

```bash
npm run deploy
```

公開後の Worker から本番 D1 を使うには、TODO 2 の `db:migrate:remote` が済んでいる必要があります。
公開 Worker の URL を `public/index.html` の `API_BASE` に設定し、フロントを再デプロイすれば、
インターネット上の「ひとことボード」が完成です。

本番 D1 の中身も確認できます。

```bash
npx wrangler d1 execute hitokoto-db --remote --command "SELECT * FROM messages"
```

## まとめ

ここまでで、**フロント（Pages）＋ API（Workers）＋ データベース（D1）** という、現代的なフルスタック
アプリの最小構成を、すべて Cloudflare の無料枠で公開できました。

この後のセクションでは、「他のサービスと比べてどうか」「公開するときに気をつけること」「運用に役立つ
機能」へと広げていきます。

## 次の章へ

次は [Vercel / AWS / VPS との違い](../../02-compare/01-comparison/LECTURE.md) で、Cloudflare を
いつ選ぶと良いかを整理します。
