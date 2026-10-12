CREATE TABLE IF NOT EXISTS chat_requests (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  network_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  day TEXT NOT NULL,
  month TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  answer TEXT,
  source_ids TEXT,
  knowledge_version TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  model TEXT NOT NULL,
  reserved_micros INTEGER NOT NULL CHECK(reserved_micros >= 0),
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chat_requests_session ON chat_requests(session_id, created_at);
CREATE INDEX IF NOT EXISTS chat_requests_network ON chat_requests(network_id, created_at);
CREATE INDEX IF NOT EXISTS chat_requests_time ON chat_requests(created_at);
CREATE INDEX IF NOT EXISTS chat_requests_month ON chat_requests(month);
CREATE INDEX IF NOT EXISTS chat_requests_day ON chat_requests(day);
