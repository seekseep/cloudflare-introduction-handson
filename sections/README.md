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

- [Node.js のセットアップ](./00-environment/01-node/LECTURE.md)
- [開発ツール（エディタ / ブラウザ）](./00-environment/02-tools/LECTURE.md)

> Cloudflare アカウントと wrangler の準備は [01. Cloudflareで公開する](./01-publish/01-account/LECTURE.md) で扱います。

## 全体の流れ

このハンズオンでは、小さな「ひとことボード」アプリを題材に、まず **静的なフロントを Pages で公開** し、
続いて **フロント → API → データ** の順でアプリを作り上げます。後半は「比較」「セキュリティ」「運用に
役立つ機能」へと広げます（05・06 は補足的な位置づけです）。

## 一覧

### 01. Pages で公開する（ハンズオン）

まずは静的なフロントを Cloudflare に公開します。

- [Cloudflare アカウントを作る](./01-publish/01-account/LECTURE.md)
- [Pages でフロントを公開する](./01-publish/02-pages/LECTURE.md)

### 02. ウェブアプリの基本

- [ウェブアプリの基本（フロント / API / データ）](./02-web-app-basic/01-overview/LECTURE.md)

### 03. アプリを作る（ハンズオン）

フロントに API とデータをつなぎ、「ひとことボード」を完成させます。

- [Workers で API を動かす](./03-build-app/01-workers/LECTURE.md)
- [D1 でデータを保存する](./03-build-app/02-d1/LECTURE.md)
- [R2 で画像を保存する](./03-build-app/03-r2/LECTURE.md)

### 04. 他のサービスとの比較

- [比較の全体像（3段階で絞り込む）](./04-compare/01-overview/LECTURE.md)
- [オンプレ vs クラウド](./04-compare/02-onpremise-vs-cloud/LECTURE.md)
- [VPS vs SaaS](./04-compare/03-vps-vs-saas/LECTURE.md)
- [ベンダー比較（Vercel / Cloudflare / AWS / GCP / Azure）](./04-compare/04-vendors/LECTURE.md)

### 05. 公開するときに気をつけたいこと（補足）

- [秘匿情報（APIキー等）の扱い方](./05-security/01-secrets/LECTURE.md)
- [踏み台にされる危険とその対策](./05-security/02-abuse/LECTURE.md)
- [バックアップ・監視・アラート](./05-security/03-backup-monitoring/LECTURE.md)
- [法令遵守と利用規約](./05-security/04-legal/LECTURE.md)

### 06. Cloudflareの機能と運用に役立つポイント（補足）

- [Web Analytics でアクセス解析](./06-features/01-web-analytics/LECTURE.md)
- [Turnstile で bot からフォームを守る](./06-features/02-turnstile/LECTURE.md)
- [その他の無料で使える機能](./06-features/03-others/LECTURE.md)
- [無料枠の「その先」｜課金の見極め方](./06-features/04-pricing/LECTURE.md)
