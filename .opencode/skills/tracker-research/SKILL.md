---
name: tracker-research
description: Document research findings in the Purple Fireflies Obsidian project tracker
---

## Research Notes

Research brings in external knowledge. It does not itself ship, and it has no `status`,
`priority`, or `area` — a research note is a reference, not work.

**Vault path:** `/home/qwexer/Obsidian/Projects/purple-fireflies-website/Research/`

### When creating research

1. Fetch from official sources — `webfetch` or `websearch`, not recall
2. **Record the date you verified, and pin exact versions.** External APIs and TUI crates move; a
   stale research note is worse than no note
3. Filter for what is relevant to Purple Fireflies specifically
4. Lead with the gotchas — that is the highest-value part of any research note

### Frontmatter

```yaml
---
type: research
created: YYYY-MM-DD
---
```

### Body

```
## Overview    required
## Findings    optional
## Links       required — sources as [[wiki links]] or URLs
## Related     required
```

Topical sections beyond these are expected and encouraged (`## Gotchas`, `## Crate Versions`,
`## Endpoints Used`, `## Setup API`).

### File naming

Title Case topic: `MCP Protocol.md`, `TMDB API.md`, `Rust TUI Game Development.md`.

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

`tracker-standard` · `tracker-decision` · `tracker-feature` · `tracker-moc`
