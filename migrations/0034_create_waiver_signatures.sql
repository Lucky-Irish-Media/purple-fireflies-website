-- Create waiver signatures table for in-app driver liability waiver e-signature
CREATE TABLE IF NOT EXISTS waiver_signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL,
  signer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  signed_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address TEXT,
  user_agent TEXT,
  waiver_version TEXT NOT NULL,
  driver_license_number TEXT,
  license_state TEXT,
  vehicle TEXT,
  license_plate TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);

CREATE INDEX IF NOT EXISTS idx_waiver_signatures_participant_id ON waiver_signatures(participant_id);
