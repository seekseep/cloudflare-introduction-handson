# 03-r2 - R2 で画像・ファイルを保存する

[R2](https://www.cloudflare.com/products/r2/) は Cloudflare のオブジェクトストレージ（S3 互換）です。
画像やファイルの保存・配信に使います。最大の特徴は **下り（egress）転送が無料** なこと。画像を多く配信
するアプリでも転送量の請求を気にせずに済みます。

このレクチャーでは、ファイルをアップロードして R2 に保存し、URL で配信する最小例を動かします。

レクチャーの内容は [LECTURE.md](./LECTURE.md) を参照してください。

## 構成

```text
src/index.js   Worker（PUT /files/:key で保存、GET /files/:key で配信、/api/files で一覧）
public/        アップロードフォーム + 一覧
wrangler.jsonc Worker + assets + R2 binding の設定
```

## 起動方法

```bash
npm install
npm run dev        # = wrangler dev（ローカルでは実バケットなしでも動く）
```

`http://localhost:8787` を開き、ファイルを選んでアップロードすると、一覧に表示され、クリックで開けます。

### 本番に公開する

本番では実際の R2 バケットが必要です。

```bash
npm run bucket:create     # = wrangler r2 bucket create handson-uploads
npm run deploy
```

> R2 の利用には、無料枠の範囲でも支払い方法の登録を求められることがあります。

## npm scripts

| コマンド | 説明 |
|---|---|
| `npm run dev` | ローカル起動（ローカル R2 に保存） |
| `npm run bucket:create` | R2 バケットを作成 |
| `npm run deploy` | Worker を公開 |
