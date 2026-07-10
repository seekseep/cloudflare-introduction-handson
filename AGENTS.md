# AGENTS.md - プロジェクト方針

## プロジェクト概要

Cloudflare の無料プランでアプリを「公開」し「運用」する流れを、手を動かして学ぶ勉強会・ハンズオン用
リポジトリ。「セクション + レクチャー」の 2 階層で教材を整理する。

参加者は 1 つのリポジトリをクローンし、各レクチャーのディレクトリに移動してサンプルを動かし、
Cloudflare に公開しながらテーマを学ぶ。サイト（`site/`）は `sections/` の `docs: true` マークダウンを
取り込んで GitHub Pages に出す。

## 用語：セクションとレクチャー

| 用語 | 指すもの | 例 |
|---|---|---|
| **セクション** | テーマで束ねた親ディレクトリ（`sections/<section>/`） | `01-publish/` |
| **レクチャー** | 1 つのハンズオン単位（多くは 1 つの動くサンプル）（`sections/<section>/<lecture>/`） | `01-publish/02-pages/` |

- レクチャーは `README.md`（プロジェクト説明）と `LECTURE.md`（教材本文, `docs: true`）を持つ
- ディレクトリ名は `NN-<slug>`。番号がサイト sidebar の並び順になる

## 技術スタック

- **Cloudflare**: Pages（静的フロント）、Workers（API）、D1（SQLite DB）、R2（オブジェクトストレージ）、
  Turnstile（CAPTCHA 代替）、Web Analytics
- **wrangler 4.x**（CLI）。各レクチャーで `npm install` → `npx wrangler ...`
- 設定は **`wrangler.jsonc`**（JSONC。`wrangler.toml` は使わない）
- Workers は **ESM**（`export default app` / `export default { fetch }`）。API は **Hono** を使う
- **JavaScript（ESM）で書く。TypeScript は使わない**（学習者がコードを追いやすくするため）
- D1 は **ORM を使わず生 SQL**。値は必ずプレースホルダ `?` でバインドする
- パッケージマネージャは **npm**
- サイト: @astrojs/starlight

## ハンズオンの題材（共通）

小さな「ひとことボード」アプリ。01-publish でフロントを Pages に公開し、02-security で公開時の
土台を押さえたうえで、03-build-app のレクチャーで **API（Workers）→ 保存（D1）→ 画像（R2）** と
段階的に作り上げる。各レクチャーは単体で `cd` して動かせるスナップショットになっている。

## セクション構成（目次）

番号がサイト sidebar の並び順。`site/astro.config.mjs` の sidebar と対応する。

- **00-environment** … 開発環境の準備
  - `01-node` Node.js のセットアップ / `02-tools` エディタ・ブラウザ開発者ツール
- **01-publish** … フロントを Pages で公開する（ハンズオン）
  - `00-about` このセクションについて / `01-account` アカウント作成・wrangler ログイン /
    `02-pages` Pages で公開 / `03-webapp` ウェブアプリの基本（フロント / API / データ）
- **02-security** … 公開時に押さえるセキュリティ（読み物）
  - `01-basic` セキュリティの3要素（可用性・機密性・完全性 = CIA） /
    `02-oss` OSS のセキュリティ（依存・サプライチェーン・実例） /
    `03-ai-agents` AI エージェントの暴走（自律実行のリスクと制御・実例）
- **03-build-app** … 「ひとことボード」を作る（ハンズオン）
  - `01-workers` Workers で API / `02-d1` D1 で保存 / `03-r2` R2 で画像
- **04-appendix** … 付録
  - `01-compare` 公開先の比較（オンプレ/クラウド・VPS/SaaS・ベンダー） /
    `02-web-analytics` アクセス解析（Cloudflare / GA / Matomo / Plausible） /
    `03-turnstile` bot 対策（Turnstile vs reCAPTCHA・動くサンプルあり） /
    `04-others` その他の便利な機能＋料金の見極め

## ディレクトリ構成

```text
/README.md              リポジトリ全体の説明
/AGENTS.md              本ファイル（プロジェクト方針・目次の単一の情報源）
/sections/              セクション群（教材本体, 単一の情報源）
/site/                  @astrojs/starlight の解説サイト（sections を取り込んで生成）
/.github/workflows/     GitHub Pages デプロイ
```

## サイトへの公開ルール

- frontmatter に `docs: true` を持つマークダウンだけが `site/scripts/sync-lectures.mjs` に拾われ、
  Starlight のページになる
- 文章は必ず `sections/` 側に書く。`site/src/content/docs/` は自動生成なので直接編集しない
- 相対リンクは sync スクリプトが自動変換する（他レクチャー → サイト内 URL、ソースコード → GitHub blob）

## コーディング・運用ルール

- JavaScript（ESM）。TypeScript は使わない
- シークレット（API キー、Turnstile secret など）は **コードに書かない**。`wrangler secret put` か、
  ローカルは `.dev.vars`。`.dev.vars` と `.wrangler/` は `.gitignore` に入れる
- wrangler のアカウント取り違えに注意（`npx wrangler whoami` で確認）。教材内では学習者自身の
  アカウントを使う前提で書く
- 無料枠・料金の数値は変動するので「公式の料金ページを参照」と添える
