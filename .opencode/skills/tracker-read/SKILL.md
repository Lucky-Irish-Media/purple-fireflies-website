---
name: tracker-read
description: Read Purple Fireflies features, tasks, decisions, and areas from the Obsidian project tracker
---

## Read from Tracker

Read and query the Purple Fireflies tracker.

**Vault path:** `/home/qwexer/Obsidian/Projects/purple-fireflies-website/`

Volunteer portal and public site for a community meal program. Next.js · Cloudflare Workers · D1 · Drizzle · Bird.

### Layout

Naming follows `tracker-standard` exactly — this project has no exceptions.

| Type | Path | Naming |
|---|---|---|
| Features | `Features/` | PascalCase — `ViewToggle.md` |
| Tasks | `Tasks/` | Capital-kebab — `Fix-search-history-selection.md` |
| Decisions | `Decisions/` | `NNN - Title Case` — `001 - News and Events Storage and Structure.md` |
| Areas | `Areas/` | PascalCase |
| Research | `Research/` | Title Case |
| Dashboard | `MOC.md` | single file |
| Templates | `~/Obsidian/Templates/Tracker/` | `Type Template.md` — one shared set, not per project |

### Area vocabulary

`frontend` · `admin` · `api` · `database` · `email` · `deployment`

Never leave `area: []` and never invent an area that is not on the list above. If work genuinely
needs a new one, add it to this skill in the same change that introduces it.

The machine-readable copy of this vocabulary is
`~/.opencode/skills/tracker-standard/vocab/purple-fireflies-website.json`, and that file is what
`check-tracker.js` enforces. If it and the list above disagree, the JSON is right and this skill is
stale. The same JSON carries this project's file-naming exceptions and its accepted basename
collisions.

### Reading a note

1. `read` the file by full path — prefer this over bash loops
2. Parse `type`, `status`, `priority`, `area`, `created`, `description`, `tags`
3. Read the body for the spec and acceptance criteria
4. Treat the note as the record of the current codebase, not the original intention

If a note predates the standard it may carry a retired value (`planned`, `accepted`, `implemented`,
`on hold`, `type: section`, `type: bug`). Those are grandfathered — see [Legacy notes](#legacy-notes)
below for the full map. Do not "fix" them unless you are already editing the note.

### Filtering

- **Open work** — `Tasks/` where `status` is not `done`
- **Unstarted features** — `Features/` where `status` is `todo`
- **In flight** — `status: in-progress` in either folder
- **By area** — filter the `area` list
- **Blockers** — grep the body for `blocked`

### Implementing from a note

1. Read the parent `feature` note, not just the task
2. Check `## Relevant Files` and confirm every path still exists
3. Implement
4. Tick acceptance criteria as they are met
5. Set `status: done`, and write what actually shipped into `## Implementation Notes`

## Project gotchas

- **No agent writes to production D1** — see `007 - No Agent Writes to Production D1`. Propose
  the change, hand the user the exact SQL or migration to run
- D1 is the source of truth. Note the migration number and which environments it was applied to
- All messaging is consolidated on **Bird** (`005 - Consolidate Messaging on Bird`). Email is
  migrated off Resend; SMS routes by contact preference. Do not reintroduce a second provider
- Volunteer accounts are separate from admin accounts (`002 - Volunteer Portal Accounts`)
- Signup currently issues a temp password by email. Do not log or persist it in plaintext
- Tasks waiting on a third party (e.g. the external waitlist form) are blocked, not `in-progress`

## Legacy notes

These are known deviations in notes written before the standard. Each is fixed opportunistically,
in the same pass that touches the note.

- **5 ambiguous `[[links]]` here** — `[[Frontend]]`, `[[Database]]`, `[[Deployment]]`, `[[Admin]]`
  each also match a streamlist note. Path-qualify them
- `Decisions/LegalObserversPageScope.md` is unnumbered. It should be
  `008 - Legal Observers Page Scope.md`; renumber on touch and fix inbound `[[links]]`
- `status: on hold` (3 notes) → `in-progress`; `status: in progress` (1 note) → `in-progress`
- `status: planned` → `todo`; `status: accepted` → `done`
- `Tasks/Fix-internal-notes-wiped-on-signup.md` is missing `tags`; the other 22 tasks have it
- `Tasks/Bibler-signups-data-loss.md` uses `task/investigation` → standard is `task/research`
- Both `Tasks/Update-navigation-and-readme.md` and `Tasks/Update-readme-and-navigation.md` are the
  same task. Merge on touch
- All `due:` keys in this project are empty — omit the key instead
- `MOC.md` is missing a newline after its frontmatter close, so its H1 renders inside the
  frontmatter block. Fix on touch

## Related

`tracker-standard` · `tracker-moc` · `tracker-area` · `tracker-feature` · `tracker-task` ·
`tracker-decision` · `tracker-research`
