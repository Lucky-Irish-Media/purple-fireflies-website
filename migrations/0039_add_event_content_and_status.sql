-- Add rich content, slug, and draft status to events
ALTER TABLE events ADD COLUMN slug TEXT;
ALTER TABLE events ADD COLUMN body TEXT;
ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'published';

-- Backfill slugs for existing rows
UPDATE events SET slug = 'event-' || id WHERE slug IS NULL;

-- Unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);