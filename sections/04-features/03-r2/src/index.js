import { Hono } from 'hono';

const app = new Hono();

// アップロードされたファイル一覧（キー名）を返す
app.get('/api/files', async (c) => {
  const listed = await c.env.BUCKET.list();
  const files = listed.objects.map((o) => ({ key: o.key, size: o.size }));
  return c.json(files);
});

// ファイルをアップロード（PUT /files/<キー>）。リクエストボディをそのまま保存する。
app.put('/files/:key', async (c) => {
  const key = c.req.param('key');
  const obj = await c.env.BUCKET.put(key, c.req.raw.body, {
    httpMetadata: {
      contentType: c.req.header('content-type') ?? 'application/octet-stream',
    },
  });
  return c.json({ key: obj.key, size: obj.size });
});

// ファイルを取得・配信（GET /files/<キー>）
app.get('/files/:key', async (c) => {
  const key = c.req.param('key');
  const obj = await c.env.BUCKET.get(key);
  if (!obj) return c.notFound();

  const headers = new Headers();
  // R2 に保存した Content-Type などのメタ情報をレスポンスに反映する
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  return new Response(obj.body, { headers });
});

export default app;
