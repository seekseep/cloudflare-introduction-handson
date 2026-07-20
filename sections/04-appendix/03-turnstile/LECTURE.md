---
title: Turnstile で bot からフォームを守る
docs: true
---

# Turnstile で bot からフォームを守る

![Turnstile で bot からフォームを守る](./images/00-thumbnail.svg)

フォームを公開すると、必ずと言っていいほど **bot（自動プログラム）によるスパム投稿** がやってきます。

これを防ぐ定番が CAPTCHA ですが、画像選択のような操作はユーザーにとって面倒です。Cloudflare の **Turnstile** は、多くの場合ユーザー操作なしで（裏側で）bot かどうかを判定してくれる、CAPTCHA の代替です。無料で使えます。

このレクチャーでは、設定なしで試せるよう **テスト用キー** を使って、フォーム送信を Turnstile で守る流れを体験します。

## プロジェクトを用意する

このレクチャーのサンプルを ZIP で配布しています。次の手順で手元に用意してください。

1. 下の「サンプルコードをダウンロード」ボタンからプロジェクト ZIP をダウンロードする
2. ダウンロードした ZIP を解凍する（展開すると `03-turnstile` フォルダができます）
3. その `03-turnstile` フォルダを VSCode で開く（File → Open Folder、またはフォルダをドラッグ&ドロップ）
4. VSCode で[ターミナルを開く](../../00-environment/01-tools/LECTURE.md)。以降のコマンドは、この開いたフォルダ（`03-turnstile`）の中で実行します。

:::download
[サンプルコードをダウンロード](./project.zip)
:::

## 起動して送信する

```bash
npm ci
cp .dev.vars.example .dev.vars
npm run dev
```

`http://localhost:8787` を開き、なまえを入れて送信します。Turnstile の確認（テスト用キーなので即成功）を経て、「送信できました」と表示されれば成功です。

フロントは [public/index.html](./public/index.html) です。`<head>` でTurnstile のスクリプトを読み込み、フォーム内に次のウィジェットを置いています。

```html
<div class="cf-turnstile" data-sitekey="1x00000000000000000000AA"></div>
```

`data-sitekey` は公開してよい値です。送信時、Turnstile はフォームに`cf-turnstile-response` という隠しフィールド（トークン）を自動で追加します。

## サーバー側の検証を読む

肝心なのはサーバー側です。[src/index.js](./src/index.js) の `/submit` で、受け取ったトークンをCloudflare に問い合わせて検証します。

![ブラウザがトークンを取得しWorkerに送り、WorkerがCloudflareに問い合わせて検証する流れ](./images/01-siteverify-flow.svg)

```js
const outcome = await verifyTurnstile(c.env.TURNSTILE_SECRET, token, ip);
if (!outcome.success) {
  return c.html(resultPage('検証に失敗しました', false), 403);
}
// 成功したときだけ本処理へ
```

`siteverify` は `secret` と `token` を Cloudflare に送り、`{ success: true/false }` を返します。**この検証をサボって「ウィジェットを置いただけ」では、bot は直接 `/submit` を叩けるので無意味** です。必ずサーバー側で検証します。

![ウィジェットを迂回したbotはサーバー側のsiteverifyで遮断される](./images/02-server-side-blockage.svg)

`TURNSTILE_SECRET` はコードに書かず、ローカルは `.dev.vars`、本番は `wrangler secret put` で渡します。

## 失敗させる

[public/index.html](./public/index.html) の `data-sitekey` を、常に失敗するテスト用キー`2x00000000000000000000AB` に書き換えて保存し、もう一度送信してみましょう。今度はサーバー側の検証で弾かれ、403（送信できませんでした）になります。確認できたら元のキーに戻します。

## 本番で使う （任意）

本番では、Cloudflare ダッシュボードの Turnstile で自分のウィジェットを作成し、発行された **sitekey をフロントに**、**secret を `wrangler secret put TURNSTILE_SECRET` に** 登録します。

```bash
npx wrangler secret put TURNSTILE_SECRET
npm run deploy
```

## Turnstile vs reCAPTCHA

reCAPTCHA は長い間、多くの Web サイトで使われてきた CAPTCHA です。一方 Cloudflare Turnstile は、その代わりとして登場した新しいサービスです。

Turnstile は、できるだけ利用者に負担をかけないことを重視しています。画像を選ぶ問題が表示されることはほとんどなく、多くの場合は何もしなくても人間かどうかを判定できます。

また、Turnstile は広告のための追跡（トラッキング）を行わない方針で、Cookie にも依存しません。対して reCAPTCHA は Google のサービスなので、Google の仕組みに依存することになります。

どちらも導入方法はよく似ており、Web ページに CAPTCHA を設置し、サーバー側で結果を確認します。初学者が気軽に試すなら、使いやすさやプライバシーを重視した Turnstile が選ばれることも増えています。

### sitekey は公開・secret は秘密

Turnstile では 2 つの値を使い分けます。

- **sitekey**：フロントの HTML に埋め込む。**公開してよい値**（`data-sitekey` としてブラウザに出る）
- **secret**：サーバー側で `siteverify` に使う。**絶対に秘密**（コードに書かず `.dev.vars` /
  `wrangler secret put` で渡す）

これは [セキュリティの3要素](../../02-security/01-basic/LECTURE.md) の **機密性（Confidentiality）**
そのものです。secret が漏れると第三者が「検証済み」を偽装できてしまうため、sitekey と secret を
取り違えないよう注意してください。

## 次の章へ

次は [その他の無料で使える機能](../04-others/LECTURE.md) に進みます。
