---
name: tracker-task
description: Create and update tasks, bugs, and ideas in the Purple Fireflies Obsidian project tracker
---

## Task Notes

A task is one verifiable outcome belonging to a feature. Exactly one `task/*` tag.

**Vault path:** `/home/qwexer/Obsidian/Projects/purple-fireflies-website/Tasks/`

### When creating a task

1. Read the codebase and ground the task in real files and line numbers
2. Find the parent `[[Feature]]`. If none fits, create the feature first — a task with no parent
   is invisible in the MOC
3. Check it is not already tracked. Duplicate notes are the most common defect in this vault
4. Pick one `task/*` tag, and set `status: in-progress` only when work actually starts

### Frontmatter

```yaml
---
type: task
area: [admin]
status: todo
priority: medium
created: YYYY-MM-DD
tags:
  - task/feature
---
```

Add `due: YYYY-MM-DD` only when there is a real date. Omit the key rather than leaving it blank.

### Body

```
## Description            required — what, why, real paths and line numbers
## Steps to Reproduce     required when tagged task/bug
## Expected Behavior      required when tagged task/bug
## Root Cause             task/bug, filled in on completion
## Acceptance Criteria    required
## Relevant Files         optional
## Implementation Notes   required — what actually shipped
## Related                required — parent feature, constraining decisions
```

### File naming

Capital-kebab-case, matching the H1: `Fix search history selection` →
`Fix-search-history-selection.md`. First word capitalized, rest lowercase, hyphens between.

Notes written before the standard may use Title Case or all-lowercase. Rename when touched, and
fix every inbound `[[link]]` in the same pass.

### Updating a task

- `todo` → `in-progress` when work starts
- Tick acceptance criteria as each is met, not in one pass at the end
- `done` when the outcome shipped
- **Record divergence.** If the implementation turned out differently from the plan, write what is
  actually there into `## Implementation Notes`. The note documents the codebase, not the intention

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

`tracker-standard` · `tracker-feature` · `tracker-decision` · `tracker-moc`
