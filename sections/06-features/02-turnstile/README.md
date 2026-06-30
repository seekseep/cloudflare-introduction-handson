# 02-turnstile - Turnstile で bot からフォームを守る

[Turnstile](https://www.cloudflare.com/products/turnstile/) は、Cloudflare が提供する CAPTCHA の
代替です。ユーザーに「信号機の画像を選ぶ」ような手間をかけずに、bot かどうかを判定できます。この
レクチャーでは、フォームに Turnstile を組み込み、**サーバー（Worker）側で検証** する最小例を動かします。

セットアップ不要で試せるよう、Cloudflare 公式の **テスト用キー**（常に成功）を使っています。

レクチャーの内容は [LECTURE.md](./LECTURE.md) を参照してください。

## 構成

```text
src/index.js   Worker（/submit で siteverify する。静的アセットも配信）
public/        フォーム（Turnstile ウィジェット入り）
wrangler.jsonc Worker + assets（静的配信）の設定
.dev.vars.example  ローカル用シークレットの見本（コピーして .dev.vars に）
```

## 起動方法

```bash
npm install
cp .dev.vars.example .dev.vars   # ローカル用シークレット（テスト用 secret）
npm run dev                      # = wrangler dev
```

表示された `http://localhost:8787` を開き、なまえを入れて送信すると、Turnstile の確認を経て
「送信できました」と表示されます。

### わざと失敗させる

`public/index.html` の `data-sitekey` を「常に失敗するキー」`2x00000000000000000000AB` に変えると、
サーバー側の検証で弾かれて 403 になる様子を確認できます。確認したら戻しておきましょう。

### 本番に公開する

本番では自分の Turnstile ウィジェット（ダッシュボードで作成）の sitekey / secret を使います。

```bash
npx wrangler secret put TURNSTILE_SECRET   # 本番用 secret を登録（対話入力）
npm run deploy
```

## テスト用キー（Cloudflare 公式）

| 用途 | キー |
|---|---|
| sitekey（常に成功） | `1x00000000000000000000AA` |
| sitekey（常に失敗） | `2x00000000000000000000AB` |
| secret（常に成功） | `1x0000000000000000000000000000000AA` |
| secret（常に失敗） | `2x0000000000000000000000000000000AA` |
