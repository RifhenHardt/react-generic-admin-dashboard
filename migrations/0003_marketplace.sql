PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS market_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  seller_name TEXT NOT NULL DEFAULT '',
  seller_team TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  event TEXT NOT NULL DEFAULT '',
  booth TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  reorder_at INTEGER NOT NULL DEFAULT 5,
  image_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  seller_verified INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  submission_date TEXT NOT NULL DEFAULT (date('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS market_listings_market_idx ON market_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS market_listings_seller_idx ON market_listings(seller_user_id, created_at DESC);
