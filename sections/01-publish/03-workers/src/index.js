import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// フロント（別オリジン。Pages や localhost:8788）からこの API を叩けるように CORS を許可する。
// ハンズオンでは分かりやすさを優先して全オリジン許可（'*'）にしている。
// 本番では origin を自分の Pages の URL（例: 'https://hitokoto-board.pages.dev'）に絞ること。
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

// この章ではまだデータベースがないので、固定のサンプルを返す。
// 投稿（POST）は受け取って中身を返すだけで保存はしない（保存は次章の D1 で行う）。
const sampleMessages = [
  { id: 2, name: 'さとう', body: 'Cloudflare で公開してみた' },
  { id: 1, name: 'たなか', body: 'はじめての投稿です！' },
];

// 一覧を返す
app.get('/api/messages', (c) => {
  return c.json(sampleMessages);
});

// 投稿を受け取る（この章では保存せず、受け取った内容をそのまま返す）
app.post('/api/messages', async (c) => {
  const data = await c.req.json();
  const name = String(data.name ?? '').trim();
  const body = String(data.body ?? '').trim();

  // 入力チェックはサーバー側でも必ず行う（フロントのチェックは迂回できるため）。
  if (!name || !body) {
    return c.json({ error: 'name と body は必須です' }, 400);
  }

  // 本来はここで DB に保存する。今はまだ保存先がないので、受け取った内容を返すだけ。
  return c.json({ id: null, name, body, saved: false }, 201);
});

export default app;
