-- Seed data for local/dev. NOT for production.
-- Admin login: admin@brainbooster.local / password "admin123"
-- (bcrypt hash below is for "admin123", cost 10).
INSERT INTO users (email, password_hash, role, premium)
VALUES ('admin@brainbooster.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO content_riddles (question, options, answer_index, min_tier) VALUES
  ('What has to be broken before you can use it?', '["An egg","A promise","A window"]', 0, 0),
  ('What gets wetter the more it dries?', '["A towel","The sun","A rock"]', 0, 1)
ON CONFLICT DO NOTHING;

INSERT INTO leaderboard (board, user_id, score)
SELECT 'weekly', id, 1200 FROM users WHERE email = 'admin@brainbooster.local'
ON CONFLICT DO NOTHING;
