# 02-d1 - D1 でデータを保存する

「ひとことボード」の投稿を **Cloudflare D1**（SQLite ベースのデータベース）に保存する、このセクションの
完成形です。前章の Worker API に D1 をつなぎ、投稿が本当に保存され、再読み込みしても残ることを確認
します。

レクチャーの内容は [LECTURE.md](./LECTURE.md) を参照してください。

## 構成

```text
src/index.js     Worker（D1 から読み書きする API）
schema.sql       テーブル定義
public/          フロント（投稿後に一覧を取り直す）
wrangler.jsonc   Worker + D1 binding の設定
package.json     npm scripts（dev / deploy / db:*）
```

## 起動方法

### 準備

```bash
npm install
```

### D1 データベースを作る

```bash
npm run db:create        # = wrangler d1 create hitokoto-db
```

表示された `database_id` を [wrangler.jsonc](./wrangler.jsonc) の `database_id` に貼り付けます。

### テーブルを作る

`schema.sql` をローカル D1 に流します。

```bash
npm run db:setup     # = wrangler d1 execute hitokoto-db --local --file=./schema.sql
```

### 起動（ターミナル2つ）

```bash
npm run dev        # ターミナル1: Worker（API）:8787
npm run front      # ターミナル2: フロント :8788
```

`http://localhost:8788` を開いて投稿し、ページを再読み込みしても残っていれば成功です。

### 公開

```bash
npm run deploy
```

公開後は `public/main.js` の `API_BASE` を公開 Worker の URL に変え、フロントを再デプロイします。

## npm scripts

| コマンド | 説明 |
|---|---|
| `npm run db:create` | D1 データベースを作成 |
| `npm run db:migrate:local` | ローカル D1 にマイグレーション適用 |
| `npm run db:migrate:remote` | 本番 D1 にマイグレーション適用 |
| `npm run dev` | Worker（API）をローカル起動（:8787） |
| `npm run front` | フロントをローカル起動（:8788） |
| `npm run deploy` | Worker を Cloudflare に公開 |
