import { Hono } from 'hono';
import { html } from 'hono/html';

const app = new Hono();

// Turnstile の検証は必ずサーバー（Worker）側で行う。
// secret はコードに書かず、ローカルは .dev.vars、本番は `wrangler secret put TURNSTILE_SECRET`。
async function verifyTurnstile(secret, token, ip) {
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    },
  );
  return res.json();
}

function resultPage(message, ok) {
  // html`` は ${...} を自動エスケープするので、ユーザー入力を安全に埋め込める。
  return html`<!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>結果</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <main class="container">
          <h1>${ok ? '送信できました' : '送信できませんでした'}</h1>
          <p class="${ok ? 'ok' : 'ng'}">${message}</p>
          <p><a href="/">← フォームに戻る</a></p>
        </main>
      </body>
    </html>`;
}

app.post('/submit', async (c) => {
  const form = await c.req.formData();
  const token = form.get('cf-turnstile-response');
  const name = String(form.get('name') ?? '').trim() || '名無し';
  const ip = c.req.header('CF-Connecting-IP');

  const outcome = await verifyTurnstile(c.env.TURNSTILE_SECRET, token, ip);
  if (!outcome.success) {
    // bot 判定や、トークン切れ・使い回し（timeout-or-duplicate）などで失敗する
    return c.html(
      resultPage('Turnstile の検証に失敗しました（bot 判定 / トークン切れなど）。', false),
      403,
    );
  }

  // 検証に成功した場合だけ本処理（ここでは挨拶を返すだけ）。
  return c.html(resultPage(`ようこそ、${name} さん。人間として確認できました。`, true));
});

export default app;
