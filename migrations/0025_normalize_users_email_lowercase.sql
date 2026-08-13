-- Normalize users emails to lowercase so user accounts can never
-- diverge into case-variant duplicates (fixes the case-sensitive
-- exact-match lookup that let "Foo@Bar.com" and "foo@bar.com" both exist).
-- Fails loudly on the UNIQUE(email) constraint if a case-collision exists.
UPDATE users SET email = LOWER(email) WHERE email <> LOWER(email);
