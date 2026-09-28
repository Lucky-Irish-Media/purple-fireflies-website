---
name: tracker-area
description: Update Purple Fireflies area responsibility notes in the Obsidian project tracker
---

## Area Notes

Area notes are responsibility maps — reference material, not work. They carry no `status`, no
`priority`, and no `created`.

**Vault path:** `/home/qwexer/Obsidian/Projects/purple-fireflies-website/Areas/`

### When updating an area

1. Read the relevant part of the codebase for its current state
2. Update the tables so they match reality — endpoints, files, tables, commands, constants
3. Record the conventions and invariants specific to this area
4. Link the features and tasks that live here in `## Related`

Never let an area note describe code that does not exist. A stale area map is worse than none.

### Frontmatter

```yaml
---
type: area
area: [admin]  # the area's own name, never [self]
---
```

### Body

H1, a short prose intro, then project-specific sections, then `## Related`. Tables for anything
enumerable. There is no fixed section list — an area note carries what its subsystem needs.

### Existing areas

`Admin` · `Database` · `Deployment` · `Frontend` — all already PascalCase, no exceptions.

**But every one of these collides with a streamlist note of the same basename.** Obsidian resolves
`[[links]]` by basename vault-wide, so `[[Database]]` is ambiguous between this project's
`Areas/Database.md` and streamlist's. Five links in this project are affected. Path-qualify them
rather than renaming — see the standard's vault-unique-basename rule.

Naming the area rather than writing `area: [self]` is deliberate — it makes the area note show up
in the same "everything touching `frontend`" query as the features and tasks. Notes using
`area: [self]` are legacy; change them when touched.

### File naming

PascalCase, matching the H1 with spaces removed. Area notes currently using spaces
(`API Routes.md`) get renamed when touched — update the `[[links]]` in `MOC.md` and any feature
note that references them in the same pass.

## Project gotchas

- **No agent writes to production D1** — see `007 - No Agent Writes to Production D1`. Propose
  the change, hand the user the exact SQL or migration to run
- D1 is the source of truth. Note the migration number and which environments it was applied to
- All messaging is consolidated on **Bird** (`005 - Consolidate Messaging on Bird`). Email is
  migrated off Resend; SMS routes by contact preference. Do not reintroduce a second provider
- Volunteer accounts are separate from admin accounts (`002 - Volunteer Portal Accounts`)
- Signup currently issues a temp password by email. Do not log or persist it in plaintext
- Tasks waiting on a third party (e.g. the external waitlist form) are blocked, not `in-progress`

## Related

`tracker-standard` · `tracker-read` · `tracker-feature` · `tracker-moc`
