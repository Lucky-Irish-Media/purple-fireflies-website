---
name: tracker-feature
description: Create or update feature notes in the Purple Fireflies Obsidian project tracker
---

## Feature Notes

A feature is a user-visible capability. It spans many tasks. It carries no `tags` — the type is the
tag.

**Vault path:** `/home/qwexer/Obsidian/Projects/purple-fireflies-website/Features/`

### When creating a feature

1. Search the codebase for the modules, types, and functions this touches. Do not invent paths.
2. Check whether the feature already exists in a coarser form — Purple Fireflies has a habit of
   splitting one capability across three overlapping notes. Merge instead of adding a fourth.
3. Write it with the schema below

### Frontmatter

```yaml
---
type: feature
area: [admin, database]
status: todo
priority: medium
created: YYYY-MM-DD
description: One-line scannable summary, no trailing period
---
```

`description` is load-bearing — the MOC renders it in a table. Write it for a reader scanning 60
rows, not for someone who will open the note.

### Body

Section order and required/optional status are fixed by `tracker-standard`:

```
## Overview            required
## Motivation          optional
## User Stories        optional
## Acceptance Criteria required while status is todo or in-progress
## Relevant Files      required
## Technical Notes     optional, H3 children only
## Known Issues        optional
## Open Questions      optional
## Related             required
```

`## Relevant Files` is flat at H2. The older `## Technical Notes` → `### Relevant Files` nesting
is retired; keep new notes flat and leave existing nested ones alone.

### File naming

PascalCase matching the H1, spaces and punctuation removed: `Admin Meal Quantity Override` →
`AdminMealQuantityOverride.md`. Validate with
`node ~/.opencode/skills/tracker-standard/scripts/check-tracker.js --project purple-fireflies-website` — no
`--report`, so it exits 1 on a violation.

### Quality bar

- **Verifiable** — acceptance criteria are checkable, not "works well"
- **Scoped** — one task, one outcome; more than ~8 criteria means two tasks
- **Grounded** — cites real `app/admin/...` paths and the Drizzle migration number
- **Ordered** — states its dependencies, so it can be picked up cold

Most tasks here touch an admin table. They all use the shared `DataTable` in
`app/admin/components/DataTable.tsx` with shared formatters and badges from
`app/admin/lib/utils.tsx`. Check the admin table style rules in `AGENTS.md` before writing table
code, and record which rules the task touches in `## Implementation Notes`.

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

`tracker-standard` · `tracker-task` · `tracker-decision` · `tracker-area` · `tracker-moc`
