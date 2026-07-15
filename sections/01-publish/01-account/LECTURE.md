---
title: Cloudflare アカウントを作る
docs: true
---

# Cloudflare アカウントを作る

![Cloudflare アカウントを作る](./images/00-thumbnail.svg)

Web サイトを公開する最初の一歩として、公開先となる **Cloudflare アカウント** を作り、CLI（wrangler）から
操作できる状態にします。ここが整えば、あとはコマンドひとつでインターネットに公開できるようになります。

このレクチャーにはコードはありません。アカウントとCLIの準備だけを行います。

## TODO

1. Cloudflare の無料アカウントを作り、メール認証を済ませる
2. wrangler でログインし、自分のアカウントが選ばれていることを確認する

## 学ぶこと

- Cloudflare のアカウントの作成方法
- wrangler でログインする方法

## 説明

### TODO 1: アカウントを作る

1. [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) を開く
2. **メールの送受信ができるアドレス**（Google アカウントのメールなど）とパスワードを入力して登録
3. 届いた確認メールのリンクを踏んで、メールアドレスを認証する

無料プランの利用だけならクレジットカードの登録は不要です。R2（ストレージ）など一部の機能では、無料枠の範囲でも支払い方法の登録を求められることがあります。

ログインすると [ダッシュボード](https://dash.cloudflare.com/) が開きます。ここで、これから作るPages / Workers / D1 などのリソースを一覧・確認できます。

### TODO 2: wrangler でログインする

ターミナルで以下を実行します（Node.js のセットアップが済んでいる前提。まだの人は
[Node.js のセットアップ](../../00-environment/01-node/LECTURE.md) を先に）。

```bash
npx wrangler login
```

ブラウザが開くので、Cloudflare にログインして「Authorize」を選びます。ターミナルに戻って成功メッセージが出ればOKです。

ログイン中のアカウントを確認します。

```bash
npx wrangler whoami
```

表示された Account が、これから使いたいアカウントであることを確認してください。

**複数の Cloudflare アカウントを持っている場合**は特に注意。`whoami` の表示が意図したアカウントでないと、別のアカウントにアプリを公開してしまいます。違う場合は `npx wrangler logout` してから入り直します。

## コラム

### CLI で操作する

CLI（Command Line Interface）は、ボタンやアイコンではなく**文字のコマンドでコンピュータを操作する**方法です。`wrangler login` のように、やりたいことを単語で打ち込むとその通りに動きます。マウスで操作する画面（GUI）と違い、手順をそのまま記録・共有・自動化できるのが強みです。

公開やデプロイは「同じ操作を何度も・正確に」繰り返す作業です。CLI ならコマンド一行で再現でき、結果も文字で残るので何が起きたか追いやすい。 **作る・反映するは wrangler（CLI）、状態の確認はダッシュボード（GUI）** と役割を分けると快適に進められます。

![開発PCのwrangler(CLI)でCloudflareにデプロイし、ブラウザのダッシュボード(GUI)で状態を確認する役割分担](./images/01-cli-vs-gui.svg)

<!-- genfig: 中央に Cloudflare（本番環境）を「雲シェイプ（cloud）」で置く対比図。雲の中に雲の絵文字は入れない（二重の雲を避ける）。雲の中にラベル「Cloudflare（本番環境）」を書く。左に ⚒️ wrangler(CLI) を主役として置き、その下の 💻 開発PC から ⚒️ へ縦の濃い矢印（PCで wrangler を動かす）。⚒️ から Cloudflare へ「作る・反映する（deploy）」の濃い矢印（往路）。右=「🌐 ブラウザ：ダッシュボード(GUI)」と Cloudflare の間を「状態を確認する」の薄い双方向矢印。登場要素 = ⚒️(wrangler/CLI), 💻(開発PC), 🌐(ブラウザ/GUIダッシュボード), 雲シェイプ(Cloudflare本番環境)。イメージスキーマ = CENTER-PERIPHERY（中央のCloudflareに操作経路が集まる）+ SOURCE-PATH-GOAL（開発PC→wrangler→Cloudflare）。絵文字割当: wrangler/CLI=⚒️ 2692, 開発PC=💻 1f4bb, ブラウザ/GUI=🌐 1f310。Cloudflareは絵文字ではなく cloud() シェイプで表す。 -->
*図: 「作る・反映する」は wrangler（CLI）、「状態の確認」はダッシュボード（GUI）。役割を分けて Cloudflare を操作する。*

CLIは Claude Code などのAIエージェントからも操作できるので、AIに「このアプリをデプロイして」とお願いすることも可能です。

### wrangler とは

wrangler *ˈræŋɡlə(r)* はラングラーと読みます。

wrangler は、Cloudflare のリソースを操作するための CLI です。アプリの公開や設定変更など、Cloudflare 上で行う操作をコマンドで実行できます。

次のようなことができます。

- **Pages の公開** … `npx wrangler pages deploy ./public` で、ローカルの `./public` フォルダを Pages にアップロードして公開
- **Worker の公開** … `npx wrangler publish` で、ローカルの Worker コードを Cloudflare 上に公開
- **D1 の操作** … `npx wrangler d1` で、Cloudflare 上の D1 データベースを作成・削除・操作

## 次の章へ

アカウントの準備ができたら、次は [Pages でフロントを公開する](../02-pages/LECTURE.md) に進みます。
まずは「見た目（フロント）」だけをインターネットに公開してみましょう。
