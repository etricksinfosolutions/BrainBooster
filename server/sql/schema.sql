-- Brain Booster Kids — database schema (PostgreSQL 15+)
-- Apply with: psql "$DATABASE_URL" -f sql/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Parent accounts. Children never have accounts of their own (COPPA-friendly);
-- child profiles live inside the progress snapshot under the parent.
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'admin')),
  premium       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- One cloud save per account. The snapshot mirrors the client's localStorage
-- shape (coins, diamonds, xp, starsByLevel, badges, skills, playLog...).
CREATE TABLE IF NOT EXISTS progress (
  user_id    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  snapshot   jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Immutable purchase audit trail. `reference` is the gateway's payment id /
-- purchase token, unique so replayed verifications are idempotent.
CREATE TABLE IF NOT EXISTS purchases (
  id           bigserial PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform     text NOT NULL CHECK (platform IN ('razorpay', 'google', 'apple')),
  reference    text NOT NULL UNIQUE,
  amount_paise integer NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Admin-managed content, served to clients as add-on packs on top of the
-- bundled offline content.
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
  body       jsonb NOT NULL,  -- { title, pages[], questions[] }
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(premium) WHERE premium;
