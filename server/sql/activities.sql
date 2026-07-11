-- ---------------------------------------------------------------------------
-- Brain Booster Kids — Activity content + User Activity Mapping
-- The Modular Activity Engine's server side. Activity *templates* are stored as
-- schema-light JSONB documents (a "NoSQL-style" collection inside Postgres), so
-- millions of activities can be added with no migration — the app downloads
-- them in small batches (see routes/activities.js). Per-child play history is
-- the User Activity Mapping the scheduler uses to avoid repeats and personalise.
-- ---------------------------------------------------------------------------

-- Activity template collection (document store) ------------------------------
CREATE TABLE IF NOT EXISTS activity_templates (
  id          TEXT PRIMARY KEY,            -- stable activity-type id (e.g. 'match3-ocean')
  mechanic    TEXT NOT NULL,               -- interaction verb the client renders
  min_tier    SMALLINT NOT NULL DEFAULT 0, -- difficulty band (0..4)
  max_tier    SMALLINT NOT NULL DEFAULT 4,
  seq         BIGSERIAL,                   -- monotonic cursor for batched download
  doc         JSONB NOT NULL,              -- the full ActivityType document
  published   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Batched, paginated delivery ("give me the next 20 after cursor N").
CREATE INDEX IF NOT EXISTS idx_activity_templates_seq ON activity_templates (seq) WHERE published;
CREATE INDEX IF NOT EXISTS idx_activity_templates_tier ON activity_templates (min_tier, max_tier) WHERE published;

-- User Activity Mapping ------------------------------------------------------
-- One aggregated row per (child, activity): what they did with it. The client
-- mirrors this locally; the server row is the cross-device source of truth.
CREATE TABLE IF NOT EXISTS activity_history (
  user_id       UUID   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id   TEXT   NOT NULL,
  plays         INT    NOT NULL DEFAULT 0,
  completed     INT    NOT NULL DEFAULT 0,
  skips         INT    NOT NULL DEFAULT 0,
  hints         INT    NOT NULL DEFAULT 0,
  best_stars    SMALLINT NOT NULL DEFAULT 0,
  best_ms       INT    NOT NULL DEFAULT 0,   -- best completion time (ms); 0 = none
  last_level    INT    NOT NULL DEFAULT 0,
  attempts      INT    NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_id)
);
CREATE INDEX IF NOT EXISTS idx_activity_history_recent ON activity_history (user_id, updated_at DESC);

-- Append-only event log (optional, for analytics / personalisation training).
CREATE TABLE IF NOT EXISTS activity_events (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id  TEXT   NOT NULL,
  mechanic     TEXT,
  outcome      TEXT   NOT NULL,             -- 'completed' | 'skipped'
  stars        SMALLINT,
  hints        INT,
  ms           INT,
  level_id     INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_events_user ON activity_events (user_id, created_at DESC);
