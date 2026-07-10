-- 0002_services — tables backing the new independent services
-- (leaderboard-service, analytics-service, content-service generation queue).
-- Apply after 0001_init.

-- leaderboard-service: best score per user per board.
CREATE TABLE IF NOT EXISTS leaderboard (
  board      text NOT NULL,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score      integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (board, user_id)
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_board_score ON leaderboard(board, score DESC);

-- analytics-service: append-only event stream.
CREATE TABLE IF NOT EXISTS analytics_events (
  id       bigserial PRIMARY KEY,
  user_id  uuid,
  event    text NOT NULL,
  day      date NOT NULL DEFAULT current_date,
  props    jsonb,
  ts       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_day ON analytics_events(day);

-- content-service: AI-generated activities pending human review (quality gate).
CREATE TABLE IF NOT EXISTS generated_activities (
  id          text PRIMARY KEY,
  topic       text NOT NULL,
  payload     jsonb NOT NULL,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  quality     real,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_generated_status ON generated_activities(status);
