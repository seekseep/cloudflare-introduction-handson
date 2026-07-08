# 03-examples - 静的ページアプリの例

サーバーを用意しなくても作れる **静的ページアプリ** の例を 3 つ集めたレクチャーです。すべて HTML と
JavaScript だけで動き、入力を外のサーバーへ送りません（＝公開のハードルもセキュリティ上のリスクも低い）。
スタイルは Bootstrap（CDN）を読み込んで当てています。

レクチャーの内容は [LECTURE.md](./LECTURE.md) を参照してください。

## 構成

```text
public/
  index.html                    /               3アプリへのメニュー
  bmi-calculator/
    index.html                  /bmi-calculator BMI 計算機（入力→計算→表示）
    main.js
  word-list/
    index.html                  /word-list      単語帳（1問4択クイズ・難易度3段階）
    main.js                     ベストスコアを localStorage に保存
  toy-sound/
    index.html                  /toy-sound      音のなるおもちゃ
    main.js                     Web Audio API で音を合成（音声ファイル不要）
package.json                    依存（wrangler）
```

`public/<アプリ名>/index.html` というフォルダ構成が、そのまま公開 URL（`/<アプリ名>`）になります。

🎹 の音は **Web Audio API** でその場で合成しているため、音声ファイルの同梱やホスティングは不要です。
録音済みの効果音（CC0・表記不要）に差し替えたい場合の入手先は、`toy-sound` ページ内にリンクを載せて
います。

## 起動方法

すべて **このフォルダ（`sections/01-publish/03-examples/`）の中** で実行します。

### 準備

```bash
npm install
```

### ローカルで確認

```bash
npx wrangler pages dev ./public
```

表示された `http://localhost:8788`（ポートは変わることがあります）をブラウザで開きます。

### Cloudflare に公開（任意）

```bash
npx wrangler pages deploy ./public
```
