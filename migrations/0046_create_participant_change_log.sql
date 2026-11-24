CREATE TABLE IF NOT EXISTS participant_change_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL REFERENCES participants(id),
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  actor TEXT,
  source TEXT,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT
);

CREATE INDEX IF NOT EXISTS idx_participant_change_log_participant ON participant_change_log(participant_id, changed_at);
CREATE INDEX IF NOT EXISTS idx_participant_change_log_changed_at ON participant_change_log(changed_at);