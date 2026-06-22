---
docs: true
title: はじめに
sidebar:
  label: はじめに
  order: 0
---

# はじめに

このディレクトリには、ハンズオン教材のすべてのセクションとレクチャーが入っています。

教材は 2 階層で整理されています。

- **セクション** — テーマで束ねた親ディレクトリ
- **レクチャー** — 1 つのハンズオン単位（多くは 1 つの動くサンプル）

学習者はレクチャー単位でディレクトリに移動し、その `LECTURE.md` に沿って手を動かします。

## 事前準備・セットアップ

- [Node.js のセットアップ](./HOST.md)
- [Cloudflare / Wrangler のセットアップ](./WRANGLER.md)
- [開発ツール（エディタ / ブラウザ）](./TOOLS.md)

## 全体の流れ

このハンズオンでは、小さな「ひとことボード」アプリを題材に、**フロント → API → データベース** の順で
公開していきます。前半で公開のしかたを体験し、後半で「比較」「セキュリティ」「運用に役立つ機能」へ
広げます。

## 一覧

### 01. Cloudflareで公開する（ハンズオン）

小さなアプリを段階的に Cloudflare へ公開します。

- [Cloudflare アカウントを作る](./01-publish/01-account/LECTURE.md)
- [Pages でフロントを公開する](./01-publish/02-pages/LECTURE.md)
- [Workers で API を動かす](./01-publish/03-workers/LECTURE.md)
- [D1 でデータを保存する](./01-publish/04-d1/LECTURE.md)

### 02. 他のサービスとの比較

- [Vercel / AWS / VPS との違い](./02-compare/01-comparison/LECTURE.md)

### 03. 公開するときに気をつけたいこと

- [秘匿情報（APIキー等）の扱い方](./03-security/01-secrets/LECTURE.md)
- [踏み台にされる危険とその対策](./03-security/02-abuse/LECTURE.md)
- [バックアップ・監視・アラート](./03-security/03-backup-monitoring/LECTURE.md)
- [法令遵守と利用規約](./03-security/04-legal/LECTURE.md)

### 04. Cloudflareの機能と運用に役立つポイント

- [Web Analytics でアクセス解析](./04-features/01-web-analytics/LECTURE.md)
- [Turnstile で bot からフォームを守る](./04-features/02-turnstile/LECTURE.md)
- [R2 で画像・ファイルを保存する](./04-features/03-r2/LECTURE.md)
- [無料枠の「その先」｜課金の見極め方](./04-features/04-pricing/LECTURE.md)
