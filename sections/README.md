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

- [開発ツール（エディタ / ブラウザ）](./00-environment/01-tools/LECTURE.md)
- [Node.js のセットアップ](./00-environment/02-node/LECTURE.md)

> Cloudflare アカウントと wrangler の準備は [01. Cloudflareで公開する](./01-publish/01-account/LECTURE.md) で扱います。

## 全体の流れ

このハンズオンでは、小さな「ひとことボード」アプリを題材に、まず **静的なフロントを Pages で公開** し、
続いて **セキュリティの土台** を押さえてから、**フロント → API → データ** の順でアプリを作り上げます。
最後に「比較」や「運用に役立つ機能」を付録として広げます。

## 一覧

### 01. Pages で公開する（ハンズオン）

まずは静的なフロントを Cloudflare に公開します。

- [Cloudflare アカウントを作る](./01-publish/01-account/LECTURE.md)
- [Pages でフロントを公開する](./01-publish/02-pages/LECTURE.md)
- [ウェブアプリの基本（フロント / API / データ）](./01-publish/03-webapp/LECTURE.md)

### 02. セキュリティ

アプリを作る前に、公開時に押さえておきたい考え方を整理します。

- [セキュリティの3要素（可用性・機密性・完全性）](./02-security/01-basic/LECTURE.md)
- [OSS のセキュリティ](./02-security/02-oss/LECTURE.md)
- [AI エージェントの暴走](./02-security/03-ai-agents/LECTURE.md)

### 03. アプリを作る（ハンズオン）

フロントに API とデータをつなぎ、「ひとことボード」を完成させます。

- [Workers で API を動かす](./03-build-app/01-workers/LECTURE.md)
- [D1 でデータを保存する](./03-build-app/02-d1/LECTURE.md)
- [R2 で画像を保存する](./03-build-app/03-r2/LECTURE.md)

### 04. 付録

- [公開先の比較（オンプレ/クラウド・VPS/SaaS・ベンダー）](./04-appendix/01-compare/LECTURE.md)
- [Web Analytics でアクセス解析](./04-appendix/02-web-analytics/LECTURE.md)
- [Turnstile で bot からフォームを守る](./04-appendix/03-turnstile/LECTURE.md)
- [その他の便利な機能](./04-appendix/04-others/LECTURE.md)
