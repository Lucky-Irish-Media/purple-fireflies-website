-- Consolidate admins into users table, then drop admins
-- NOTE: Since email is UNIQUE in both tables, any email collision
-- will cause this INSERT to fail. Resolve duplicates before running.

INSERT OR FAIL INTO users (email, name, password_hash, role, created_at)
SELECT email, name, password_hash, 'admin', created_at
FROM admins;

DROP TABLE IF EXISTS admins;
