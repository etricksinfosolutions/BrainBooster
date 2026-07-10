-- 0001_init — base BrainBooster schema (mirrors server/sql/schema.sql).
-- Idempotent; safe to re-run. Apply with: psql "$DATABASE_URL" -f 0001_init.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'admin')),
  premium       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress (
  user_id    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  snapshot   jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchases (
  id           bigserial PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform     text NOT NULL CHECK (platform IN ('razorpay', 'google', 'apple')),
  reference    text NOT NULL UNIQUE,
  amount_paise integer NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_riddles (
  id           bigserial PRIMARY KEY,
  question     text NOT NULL,
  options      jsonb NOT NULL,
  answer_index integer NOT NULL,
  min_tier     integer NOT NULL DEFAULT 0 CHECK (min_tier BETWEEN 0 AND 4),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_stories (
  id         bigserial PRIMARY KEY,
  title      text NOT NULL,
  body       jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(premium) WHERE premium;
