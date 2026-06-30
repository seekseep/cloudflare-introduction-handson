CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  body        TEXT NOT NULL,
  image_key   TEXT,                                  -- R2 に保存した画像のキー（画像なしの投稿では NULL）
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
