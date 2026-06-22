---
docs: true
title: Node.js のセットアップ
sidebar:
  label: Node.js のセットアップ
  order: 1
---

# Node.js のセットアップ

このハンズオンでは、各レクチャーのコマンド（`npm` / `npx wrangler`）を動かすために **Node.js** を
使います。当日スムーズに進めるため、事前にインストールしておいてください。

## インストール済みかの確認

ターミナル（macOS なら「ターミナル.app」、Windows なら「PowerShell」）で以下を実行し、バージョンが
表示されればインストール済みです。

```bash
node --version
npm --version
```

Node.js は **v20 以上（できれば最新の LTS）** を推奨します。`command not found` と出た場合は
インストールが必要です。

## インストール方法

### 公式インストーラー（Windows / macOS, 一番かんたん）

[nodejs.org](https://nodejs.org/) から **LTS 版** をダウンロードしてインストールしてください。

### macOS（Homebrew を使う場合）

```bash
brew install node
```

### バージョン管理ツールを使う場合（任意・おすすめ）

複数の Node.js バージョンを切り替えたい場合は [Volta](https://volta.sh/) や
[nvm](https://github.com/nvm-sh/nvm) が便利です。

```bash
# Volta の例
curl https://get.volta.sh | bash
volta install node@lts
```

インストール後、ターミナルを開き直して `node --version` で v20 以上が表示されることを確認してください。

## wrangler について

Cloudflare を操作する CLI である **wrangler** は、各レクチャーで `npx wrangler ...` の形で使います。
各レクチャーで `npm install` すると wrangler もそのフォルダに入るので、追加の手動インストールは不要です。
Cloudflare のアカウント作成とログインについては
[Cloudflare / Wrangler のセットアップ](./WRANGLER.md) を参照してください。
