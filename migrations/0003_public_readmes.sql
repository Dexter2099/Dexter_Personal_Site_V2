CREATE TABLE IF NOT EXISTS public_readmes (
  repo TEXT PRIMARY KEY,
  commit_sha TEXT,
  readme_path TEXT,
  excerpt TEXT,
  checked_at INTEGER,
  attempted_at INTEGER NOT NULL,
  last_status TEXT NOT NULL,
  error_code TEXT,
  CHECK ((excerpt IS NULL) = (checked_at IS NULL))
);
