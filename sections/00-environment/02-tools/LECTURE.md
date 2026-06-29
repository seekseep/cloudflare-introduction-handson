---
title: 開発ツール（エディタ / ブラウザ）
docs: true
---

# 開発ツール（エディタ / ブラウザ）

ハンズオンを進めるうえで使うエディタとブラウザについてまとめます。必須ではありませんが、あると
スムーズです。

## エディタ（VSCode）

エディタには [Visual Studio Code](https://code.visualstudio.com/) を推奨します。コード編集と同じ
ウィンドウ内でターミナルを使えるので、`npx wrangler dev` の実行とソース閲覧を素早く切り替えられます。

### インストール方法

公式サイトからインストーラーをダウンロードするか、Homebrew でインストールします。

```bash
# macOS（Homebrew を使う場合）
brew install --cask visual-studio-code
```

### プロジェクトを開く・ターミナルを使う

リポジトリのフォルダを VSCode で開き（**File → Open Folder**）、`Ctrl + \``（バッククォート）で
エディタ内にターミナルを開けます。ここで `cd sections/...` して各レクチャーを起動します。

## ブラウザの開発者ツール

公開したアプリの挙動を確認するときは、ブラウザの開発者ツール（DevTools）を使います。Chrome / Edge /
Firefox いずれでも `F12` または右クリック →「検証」で開けます。

- **Network タブ** — フロントから Worker API へのリクエストやレスポンス、ステータスコード、CORS
  エラーの有無を確認できます（このハンズオンで何度も使います）
- **Console タブ** — JavaScript のエラーやログを確認できます
- **Application タブ**（Chrome）— Cookie や Storage の中身を確認・編集できます

## アカウントのダッシュボード

Cloudflare の [ダッシュボード](https://dash.cloudflare.com/) は、wrangler で作ったリソース（Pages /
Workers / D1 / R2）の状態確認、アクセス解析、課金状況の確認などに使います。コマンドとダッシュボードを
行き来しながら進めます。
