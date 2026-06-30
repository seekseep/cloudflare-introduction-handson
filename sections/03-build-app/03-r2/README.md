# 03-r2 - R2 で画像を保存する

前章 [02-d1](../02-d1/README.md) の「ひとことボード」に、**画像の添付** を足します。投稿の本文は
これまで通り **D1（データベース）** に、画像ファイルは **R2（オブジェクトストレージ）** に保存し、
両者を組み合わせて 1 つの投稿として表示します。

レクチャーの内容は [LECTURE.md](./LECTURE.md) を参照してください。

## 構成

```text
src/index.js          Worker（D1 + R2 を読み書きする API）
migrations/0001_init.sql  テーブル定義（image_key 列つき）
public/               フロント（画像つきで投稿・表示）
wrangler.jsonc        Worker + D1 binding + R2 binding の設定
package.json          npm scripts（dev / deploy / db:* / bucket:create）
```

## 起動方法

### 準備

```bash
npm install
```

### D1 と R2 を作る

```bash
npm run db:create          # = wrangler d1 create hitokoto-db
npm run bucket:create      # = wrangler r2 bucket create hitokoto-images
```

`db:create` で表示された `database_id` を [wrangler.jsonc](./wrangler.jsonc) の `database_id` に貼り付けます。

### マイグレーション（テーブル作成）

```bash
npm run db:migrate:local     # ローカル（wrangler dev 用）
npm run db:migrate:remote    # 本番（公開後の D1）
```

### 起動（ターミナル2つ）

```bash
npm run dev        # ターミナル1: Worker（API）:8787
npm run front      # ターミナル2: フロント :8788
```

`http://localhost:8788` を開いて画像つきで投稿し、再読み込みしても画像が残っていれば成功です。

### 公開

```bash
npm run deploy
```

公開後は `public/main.js` の `API_BASE` を公開 Worker の URL に変え、フロントを再デプロイします。

## npm scripts

| コマンド | 説明 |
|---|---|
| `npm run db:create` | D1 データベースを作成 |
| `npm run bucket:create` | R2 バケットを作成 |
| `npm run db:migrate:local` | ローカル D1 にマイグレーション適用 |
| `npm run db:migrate:remote` | 本番 D1 にマイグレーション適用 |
| `npm run dev` | Worker（API）をローカル起動（:8787） |
| `npm run front` | フロントをローカル起動（:8788） |
| `npm run deploy` | Worker を Cloudflare に公開 |
