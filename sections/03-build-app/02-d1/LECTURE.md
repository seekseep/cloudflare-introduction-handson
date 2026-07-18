---
title: D1 でデータを保存する
docs: true
---

# D1 でデータを保存する

![D1 でデータを保存する](./images/00-thumbnail.svg)

前章の API は、投稿を受け取っても保存していませんでした（Worker は基本的に状態を持たないため、変数に
ためても次のリクエストでは消えてしまいます）。データを **ずっと残す** には、データベースが必要です。

ここで使うのが **Cloudflare D1**。SQLite ベースのデータベースで、Worker から直接読み書きできます。
これでようやく「ひとことボード」が完成します。

![Workerだけだとリクエストごとにデータが消えるが、D1に入れると残る](./images/01-worker-stateless-vs-d1.svg)

<!-- genfig: 上段「Worker(⚙️)だけ」: 投稿(📝)が次のリクエストで消える様子を、容器(Worker)の外へ漏れ落ちる/消滅する向きで表現。下段「Worker(⚙️)+D1(🗄️)」: 投稿(📝)がD1(🗄️)という容器に入って残る様子。上段と下段を対比。イメージスキーマ = CONTAINER（残る/漏れる）の対比。絵文字: Worker=⚙️, 投稿=📝, データベース=🗄️。 -->
*図: Worker だけだとデータは残らない。D1 という「ためる場所」に入れて初めてデータが残る。*

このハンズオンでは ORM（オブジェクト関係マッピング）は使わず、**生の SQL** を書きます。中で何が
起きているかが見えるほうが、仕組みを理解しやすいからです。

## TODO

1. D1 データベースを作り、`wrangler.jsonc` に binding を設定する
2. `schema.sql` を流してテーブルを作る
3. Worker から D1 に読み書きするコードを読む
4. ローカルで投稿が保存されることを確認する
5. 本番に公開して、インターネット越しに保存できることを確認する
6. 不要になったリソース（Worker / D1）を削除する

## 学ぶこと

- データベースの役割（処理が終わってもデータが残る）
- D1 の基本：`prepare(...).bind(...).all()/run()` で SQL を実行する
- 値は必ず **プレースホルダ `?` でバインド** する（文字列連結で SQL を作らない＝SQLインジェクション対策）
- テーブルは `schema.sql` を流して作る（ローカルで開発し、公開時に本番にも同じ SQL を流す）

## 説明

### TODO 1: D1 を作る

まず、このセクション用の設定ファイル `wrangler.jsonc` を用意します。テンプレートの
`wrangler.example.jsonc` を **同じフォルダ上で複製し、複製した方の名前を `wrangler.jsonc` に変更**
します（このステップでも新しく自分専用のアプリを作ります）。

複製した [wrangler.jsonc](./wrangler.jsonc) を開き、`name` の「あなたの名前」を自分用に書き換えます
（例: `hitokoto-tanaka-02-d1`）。他の人とぶつからないよう、必ず自分だけの名前にしてください。

次に、このフォルダで依存をインストールし、データベースを作ります。

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
    "database_id": "（ここに貼る）"
  }
]
```

`binding` の `"DB"` が、Worker のコードで `c.env.DB` として使う名前です。

### TODO 2: テーブルを作る

テーブル定義は [schema.sql](./schema.sql) にあります。この SQL をデータベースに流すだけです。

```bash
npx wrangler d1 execute hitokoto-db --local --file=./schema.sql
```

`--local` は手元の開発用 D1（`wrangler dev` が使う SQLite）にだけ流します。本番側へは TODO 5 の
公開のときに同じ SQL をもう一度流すので、今はローカルだけで大丈夫です。

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

本番の D1 はローカルとは別のデータベースなので、公開前に同じ `schema.sql` を本番側にも流して
おきます（`--local` を `--remote` に変えるだけです）。

![マイグレーションをローカルD1と本番D1の両方に適用する必要がある](./images/02-local-vs-remote-d1.svg)

<!-- genfig: 中央にマイグレーション(📜 = テーブル定義のSQL)。そこから2方向に分岐し、左「--local → ローカルD1(🗄️ 手元PC=💻 の中)」右「--remote → 本番D1(🗄️ クラウド=☁️ の中)」。2つのD1は別物であることを、間に区切り線/壁を入れて強調。片方だけに適用すると反対側に table が無いことを示唆。イメージスキーマ = SPLITTING（分岐）+ CONTAINER（別々の容器）。絵文字: マイグレーション=📜, データベース=🗄️, ローカル/PC=💻, クラウド=☁️。 -->
*図: 同じ `schema.sql` を、ローカル D1（`--local`）と本番 D1（`--remote`）の両方に流す。2つは別のデータベース。*

```bash
npx wrangler d1 execute hitokoto-db --remote --file=./schema.sql    # 本番 D1 にテーブルを作る
npx wrangler deploy
```

公開 Worker の URL を `public/main.js` の `API_BASE` に設定し、フロントを再デプロイすれば、
インターネット上の「ひとことボード」が完成です。

本番 D1 の中身も確認できます。

```bash
npx wrangler d1 execute hitokoto-db --remote --command "SELECT * FROM messages"
```

### TODO 6: 公開したものを削除する

ここまでで作った Worker と D1 データベースは、不要になったら削除できます。削除の方法は、前章までに
見た **ダッシュボード（画面）** と **CLI（コマンド）** のどちらでも構いません。やりやすい方で消してください。

:::danger
削除は元に戻せません。消すのは「このハンズオンで作った練習用のもの」だけにしてください。
:::

CLI（コマンド）で消す場合は次のとおりです。

```bash
npx wrangler delete                      # この章の Worker を削除
npx wrangler d1 delete hitokoto-db       # D1 データベースを削除
```

ダッシュボードから消す場合は、**Workers & Pages** で Worker を、**Storage & Databases → D1** で
データベースを、それぞれ選んで削除します。

:::notice
**次章の R2 に進むなら、D1（`hitokoto-db`）は残しておいて構いません。** 次章では同じ `hitokoto-db` を
再利用します。ここで消した場合は、次章の TODO 1 でもう一度 `npx wrangler d1 create hitokoto-db` を
実行して作り直し、新しい `database_id` を `wrangler.jsonc` に貼り直してください。
:::

## まとめ

ここまでで、**フロント（Pages）＋ API（Workers）＋ データベース（D1）** という、現代的なフルスタック
アプリの最小構成を、すべて Cloudflare の無料枠で公開できました。

次の章では、これに **画像の添付（R2）** を足して、データの種類ごとに保存先を使い分けます。

## コラム

### npm scripts でコマンドを短くする

この章では `npx wrangler d1 execute hitokoto-db --local --file=./schema.sql` のような **長いコマンド** を
打ちました。よく使うものは [package.json](./package.json) の `scripts` に名前を付けて
登録しておくと、短い名前で呼べます。

```jsonc
{
  "scripts": {
    "dev": "wrangler dev",                                          // npm run dev
    "front": "wrangler pages dev ./public --port 8788",             // npm run front
    "deploy": "wrangler deploy",                                    // npm run deploy
    "db:create": "wrangler d1 create hitokoto-db",                  // npm run db:create
    "db:setup": "wrangler d1 execute hitokoto-db --local --file=./schema.sql",    // npm run db:setup
    "db:setup:remote": "wrangler d1 execute hitokoto-db --remote --file=./schema.sql"  // npm run db:setup:remote
  }
}
```

こうしておくと、次のように短く実行できます。

```bash
npm run db:create           # = npx wrangler d1 create hitokoto-db
npm run db:setup            # = npx wrangler d1 execute hitokoto-db --local --file=./schema.sql
npm run db:setup:remote     # = npx wrangler d1 execute hitokoto-db --remote --file=./schema.sql
npm run dev                 # = npx wrangler dev
npm run front               # = npx wrangler pages dev ./public --port 8788
npm run deploy              # = npx wrangler deploy
```

このフォルダの `package.json` には最初からこの scripts が入っているので、`npm run db:setup`
のように呼んでも動きます。`db:setup:remote` のような **打ち間違えると本番に影響するコマンド** ほど、
名前で固定しておくと安全です。

## 次の章へ

次は [R2 で画像を保存する](../03-r2/LECTURE.md) で、投稿に画像を添付できるようにし、
**ファイルは R2・構造化データは D1** という保存先の使い分けを体験します。
