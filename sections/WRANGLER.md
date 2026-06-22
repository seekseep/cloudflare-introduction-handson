---
docs: true
title: Cloudflare / Wrangler のセットアップ
sidebar:
  label: Cloudflare / Wrangler
  order: 2
---

# Cloudflare / Wrangler のセットアップ

Cloudflare にアプリを公開するために必要な「アカウント」と「CLI（wrangler）」の準備をします。
アカウント作成自体は [01. Cloudflareで公開する](./01-publish/01-account/LECTURE.md) でも詳しく扱うので、
ここでは全体像と最低限の事前準備をまとめます。

## Cloudflare アカウント

[dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) から無料で作成できます。
**メールの送受信ができるアドレス**（Google アカウントのメールなど）を用意してください。確認メールの
リンクを踏むまで一部機能が使えないので、当日までに登録とメール認証まで済ませておくとスムーズです。

> クレジットカードの登録は無料プランの利用だけなら不要です。R2 など一部の機能は、無料枠の範囲でも
> 支払い方法の登録を求められることがあります。詳しくは各レクチャーで触れます。

## wrangler とは

**wrangler**（ラングラー）は Cloudflare を操作するコマンドラインツールです。アプリのデプロイ、
ローカル実行、D1（データベース）や R2（ストレージ）の作成などをすべて wrangler から行います。

このハンズオンでは各レクチャーのフォルダで `npm install` してから `npx wrangler ...` を使います。
`npx` はそのフォルダにインストールされた wrangler を呼び出すので、バージョンのズレを気にせず進められます。

バージョン確認:

```bash
npx wrangler --version
```

## ログイン

wrangler から Cloudflare アカウントを操作できるようにするには、一度ログインします。

```bash
npx wrangler login
```

ブラウザが開くので、Cloudflare にログインして「Allow（許可）」を選びます。ターミナルに戻って成功
メッセージが出ればOKです。今ログインしているアカウントは次で確認できます。

```bash
npx wrangler whoami
```

> **複数の Cloudflare アカウントを持っている場合**は、`whoami` で表示される Account が意図した
> ものか必ず確認してください。取り違えると別のアカウントにデプロイしてしまいます。

## まとめ：当日までにやっておくこと

1. [Node.js のセットアップ](./HOST.md) を済ませる
2. Cloudflare アカウントを作成し、確認メールのリンクを踏んでおく
3. （任意・時間があれば）`npx wrangler login` まで試しておく
