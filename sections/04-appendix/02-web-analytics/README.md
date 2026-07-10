# 02-web-analytics - Web Analytics でアクセス解析

Cloudflare Web Analytics を使って、Cookie 不要・プライバシー重視のアクセス解析を「ひとことボード」に組み込みます。`public/index.html` の `</body>` 直前にスニペットを追加するだけで計測が始まります。

詳しい手順は [LECTURE.md](./LECTURE.md) を参照してください。

## やること

公開済みフロントの `public/index.html` に、発行したトークン入りのスニペットを追加して再デプロイします。

```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "発行されたトークン"}'></script>
```
