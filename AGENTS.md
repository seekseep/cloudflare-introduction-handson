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

小さな「ひとことボード」アプリ。01-publish のレクチャーで **フロント（Pages）→ API（Workers）→
保存（D1）** と段階的に作り上げる。各レクチャーは単体で `cd` して動かせるスナップショットになっている。

## ディレクトリ構成

```text
/README.md              リポジトリ全体の説明
/AGENTS.md              本ファイル
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
