CREATE TABLE IF NOT EXISTS github_activity (
  account TEXT PRIMARY KEY CHECK(account = 'Dexter2099'),
  contributions INTEGER CHECK(contributions BETWEEN 0 AND 10000000),
  checked_at INTEGER,
  attempted_at INTEGER NOT NULL,
  last_status TEXT NOT NULL CHECK(last_status IN ('refreshing','ok','unavailable')),
  CHECK((contributions IS NULL) = (checked_at IS NULL))
);
