-- ひとことボードのテーブル。
-- wrangler d1 migrations apply で --local / --remote それぞれに適用する。
CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 初期サンプル（空のときの見栄え用）
INSERT INTO messages (name, body) VALUES ('たなか', 'はじめての投稿です！');
INSERT INTO messages (name, body) VALUES ('さとう', 'Cloudflare で公開してみた');
