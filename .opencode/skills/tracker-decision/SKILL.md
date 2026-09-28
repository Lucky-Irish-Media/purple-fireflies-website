---
name: tracker-decision
description: Record architecture decision records (ADRs) in the Purple Fireflies Obsidian project tracker
---

## Decision Records (ADRs)

A decision is a choice that constrains future work. It is a permanent record — never edited to
reflect what later turned out to be true.

**Vault path:** `/home/qwexer/Obsidian/Projects/purple-fireflies-website/Decisions/`

### When recording a decision

1. Understand the context and the constraints actually in play
2. Research the alternatives if they have not been discussed
3. Check it against `MOC.md` design pillars and existing decisions
4. Find the next number and write it

### Frontmatter

```yaml
---
type: decision
status: done
created: YYYY-MM-DD
---
```

No `area`, no `priority` — a decision is not scoped to work, it constrains work. `status: done`
means "this decision was made". Decisions are never `todo` or `in-progress`; an unmade decision is
a discussion, not a note.

### Body

All five core sections, every time:

```
## Context                 the situation and the forces at play
## Decision                what was decided, in the active voice
## Consequences            what gets easier, what gets harder
## Alternatives Considered numbered, each with why it lost
## Superseded By           optional — [[NNN - Later Decision]]
## Related                 required
```

Under `## Consequences`, split into `### Easier` and `### Harder`, and call out the standing
**constraint** the decision imposes on everything downstream.

### File naming

`NNN - Title Case.md`, zero-padded to three digits. `ls Decisions/` to find the next number. Never
reuse a number, even for a cancelled decision.

### Status

`todo` (proposed, not yet decided) → `done` (made). A decision later overturned keeps its note and
gains `## Superseded By`. The reasoning is the value — deleting it destroys the record.

### Worth an ADR

Stack choices, data models, anything that forecloses an alternative, and any rule later work will
be tempted to violate. Not worth one: naming a variable, adding a module, picking a glyph.

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

`tracker-standard` · `tracker-feature` · `tracker-research` · `tracker-moc`
