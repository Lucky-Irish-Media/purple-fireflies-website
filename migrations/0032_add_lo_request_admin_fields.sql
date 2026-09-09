ALTER TABLE legal_observer_requests ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE legal_observer_requests ADD COLUMN internal_notes TEXT;
ALTER TABLE legal_observer_requests ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'));
