PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS market_messages (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  seller_team TEXT NOT NULL,
  sender_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'replied')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  replied_at TEXT
);

CREATE INDEX IF NOT EXISTS market_messages_sender_idx ON market_messages(sender_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS market_messages_seller_idx ON market_messages(seller_team, created_at DESC);

CREATE TABLE IF NOT EXISTS market_reviews (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  seller_team TEXT NOT NULL,
  student_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(student_user_id, order_id)
);

CREATE INDEX IF NOT EXISTS market_reviews_student_idx ON market_reviews(student_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS market_reviews_seller_idx ON market_reviews(seller_team, created_at DESC);
