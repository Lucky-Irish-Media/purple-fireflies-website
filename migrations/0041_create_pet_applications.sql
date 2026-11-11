-- Create pet_applications table for the Sponsor a Pet intake form.

CREATE TABLE IF NOT EXISTS pet_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  applicant_address TEXT,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age_text TEXT,
  sex TEXT,
  story TEXT NOT NULL,
  needs TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'contacted', 'approved', 'declined', 'converted')),
  internal_notes TEXT,
  waiver_signed_at TEXT,
  waiver_signer_name TEXT,
  waiver_version TEXT,
  waiver_ip TEXT,
  waiver_user_agent TEXT,
  converted_animal_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (converted_animal_id) REFERENCES animals(id)
);

CREATE INDEX IF NOT EXISTS idx_pet_applications_status ON pet_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_applications_created ON pet_applications(created_at DESC);