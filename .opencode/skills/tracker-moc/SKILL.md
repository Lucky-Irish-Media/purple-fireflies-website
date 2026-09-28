---
name: tracker-moc
description: Check Purple Fireflies project status or update its Obsidian tracker dashboard
---

## MOC (Map of Content)

The dashboard for the Purple Fireflies tracker.

**Vault path:** `/home/qwexer/Obsidian/Projects/purple-fireflies-website/MOC.md`

### Checking project status

1. Read `MOC.md`
2. Read `Tasks/` and `Features/`, group by `status` and `priority`
3. Report: open work by priority · features by status · recent decisions · blockers

### Updating the MOC

- Bump `updated:` in the frontmatter. This is the only date the MOC carries.
- **Prepend** a bullet to `## Recent Changes`. Never add a `## Recent Changes (YYYY-MM-DD)`
  heading — that pattern produced 19 stray headings across the four MOCs. Cap the list and prune.
- Add new `## Areas` / `## Features` / `## Notes` links as notes are created.
- Dataview blocks render tasks, features, and decisions from frontmatter. Do not hand-maintain
  those lists — fix the note's frontmatter instead.

`MOC.md` opens with hand-written `> **Planned / in progress:**` callouts above the Dataview
blocks. Keep those — they carry the one-line "why" that a status field cannot. Remove a callout
when its feature leaves `in-progress`.

### Sections

| Section | Maintained by hand? |
|---|---|
| Project intro + `**Tech Stack:**` | yes |
| `## Areas` | yes |
| `## Features` | no — Dataview |
| `## Active Tasks` | no — Dataview |
| `## Recent Decisions` | no — Dataview |
| `## Recent Changes` | yes — prepend, bump `updated:` |
| `## Notes` | yes |

### Dataview gotcha

A query filtering `status = "planned"` or `status = "accepted"` silently returns nothing once its
notes are migrated to the standard's four values. When you migrate, rewrite the query in the same
pass: `planned` → `todo`, `accepted` → `done`.

The `Features` table renders `description`. A feature without it shows an empty cell.

## Related

`tracker-standard` · `tracker-read` · `tracker-feature` · `tracker-decision`
