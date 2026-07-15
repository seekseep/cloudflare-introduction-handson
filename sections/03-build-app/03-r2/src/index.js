import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// 受け付ける画像の種類とサイズ上限（踏み台対策の基本。本番ではさらに認証なども検討する）
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// フロント（別オリジン）から呼べるように CORS を許可。本番では origin を自分の Pages に絞る。
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

// 一覧を返す（D1 から新しい順に取得）。image_key も一緒に返す。
app.get('/api/messages', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, name, body, image_key, created_at FROM messages ORDER BY id DESC LIMIT 100',
  ).all();
  return c.json(results);
});

// 投稿を保存する。画像（任意）は R2 に、本文は D1 に保存する。
// フォームは multipart/form-data（画像ファイルを送れる形式）で送られてくる。
app.post('/api/messages', async (c) => {
  const form = await c.req.formData();
  const name = String(form.get('name') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();
  const image = form.get('image'); // File または null

  // サーバー側の入力チェック（フロントのチェックは迂回できるため必須）
  if (!name || !body) {
    return c.json({ error: 'name と body は必須です' }, 400);
  }

  let imageKey = null;

  // 画像が添付されていれば R2 に保存する
  if (image && typeof image === 'object' && image.size > 0) {
    if (!ALLOWED_TYPES.includes(image.type)) {
      return c.json({ error: '画像は png / jpeg / gif / webp のみです' }, 400);
    }
    if (image.size > MAX_BYTES) {
      return c.json({ error: '画像は 5MB までです' }, 400);
    }

    // キーは一意にする。ファイル名をそのまま使うと上書き・衝突が起きるため、
    // 時刻 + ランダム文字列を使う。拡張子は Content-Type から決める。
    const ext = image.type.split('/')[1];
    imageKey = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    await c.env.BUCKET.put(imageKey, image.stream(), {
      httpMetadata: { contentType: image.type },
    });
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO messages (name, body, image_key) VALUES (?, ?, ?)',
  )
    .bind(name, body, imageKey)
    .run();

  return c.json(
    { id: result.meta.last_row_id, name, body, image_key: imageKey },
    201,
  );
});

// R2 に保存した画像を配信する。/api/images/<キー> で取り出す。
app.get('/api/images/:key', async (c) => {
  const obj = await c.env.BUCKET.get(c.req.param('key'));
  if (!obj) return c.notFound();

  const headers = new Headers();
  obj.writeHttpMetadata(headers); // 保存時の Content-Type などを復元
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
});

export default app;
