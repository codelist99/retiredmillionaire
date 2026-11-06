CREATE TABLE IF NOT EXISTS rm_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(80) UNIQUE NOT NULL,
  visitor_id VARCHAR(80) NOT NULL,
  path VARCHAR(500) NOT NULL DEFAULT '/',
  referrer VARCHAR(1000) NOT NULL DEFAULT '',
  query_string VARCHAR(1500) NOT NULL DEFAULT '',
  device VARCHAR(20) NOT NULL DEFAULT 'desktop',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  engaged_seconds INTEGER NOT NULL DEFAULT 0,
  video_started BOOLEAN NOT NULL DEFAULT FALSE,
  video_seconds INTEGER NOT NULL DEFAULT 0,
  max_video_percent INTEGER NOT NULL DEFAULT 0,
  cta_clicked BOOLEAN NOT NULL DEFAULT FALSE,
  exited BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS rm_sessions_started_idx ON rm_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS rm_sessions_visitor_idx ON rm_sessions(visitor_id);
