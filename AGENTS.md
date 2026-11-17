# ⚠️ FIRST THING: Run `ls ~/.opencode/skills/` and READ every skill file before doing anything else.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:deployment-rules -->
# Deployment Rules

- NEVER manually deploy using `npm run cf:deploy` or `wrangler deploy`
- ALL deployments MUST go through Cloudflare Workers Builds connected to the GitHub repository
- Only push code to GitHub; Cloudflare will automatically build and deploy from the `main` branch
- Build command for Cloudflare Workers Builds: `npm run cf:build`
- Deploy command for Cloudflare Workers Builds: (none - use build output directly)

# Production Safety

- NEVER run any command against production (e.g. `wrangler ... --remote` with no preview flag) unless the user EXPLICITLY states you may
- This includes D1 migrations, KV operations, and any other wrangler commands targeting the production environment
- There is no `[env.preview]` and no `wrangler deploy --env preview`. Feature branches deploy through Worker Previews with `npx wrangler preview`, which reads the `[previews]` block in `wrangler.toml`. `wrangler deploy` is production-only
- When in doubt, read the resource IDs in `wrangler.toml` before running anything remote
<!-- END:deployment-rules -->

<!-- BEGIN:project-tracking-rules -->
# Project Tracking Rules

- Document EVERY feature in the Obsidian project tracker at `~/Obsidian/Projects/purple-fireflies-website/` as soon as planning starts - before writing any code
- **The note schema is defined by the `tracker-standard` skill** - load it first, then the local `tracker-*` skills in `.opencode/skills/` for this project's deltas rather than re-deriving the conventions:
  - `tracker-feature` - create/update a feature note in `Features/` (PascalCase filename, e.g. `AdminAnyDayDelivery.md`)
  - `tracker-task` - create implementation/bug notes in `Tasks/` (capitalized kebab-case)
  - `tracker-decision` - record ADRs in `Decisions/` (sequential, zero-padded)
  - `tracker-area` - maintain responsibility notes in `Areas/`
  - `tracker-moc` - refresh the `MOC.md` dashboard
  - `tracker-read` - query existing notes
  - `tracker-research` - document external services and investigations
- Status is one of `todo`, `in-progress`, `done`, `cancelled` - never `planned` or `on hold`. Set the feature `status` to `todo` when planning starts, `in-progress` when work begins, and `done` when merged to `main`
- If a feature was built without a tracker note, create the note retroactively as part of completing it
<!-- END:project-tracking-rules -->

# Writing Style

- NEVER use em dashes (`—`). Use regular hyphens (`-`) instead.

# Verification

- BEFORE pushing any changes, run `npm run build` to type-check and compile. `npx tsc --noEmit` is unreliable in this project (it fails on `@cloudflare/workers-types`).
- `npm run build` uses Turbopack which includes its own type checker and catches the same errors the CI build will catch.

<!-- BEGIN:admin-table-style-rules -->
# Admin Table Style Rules

All admin tables use the shared `<DataTable>` component from `app/admin/components/DataTable.tsx`.

## Formatting Conventions

Import shared formatters and badge components from `app/admin/lib/utils.tsx` - do NOT define them locally.

| Data Type | Formatter | Example |
|---|---|---|
| Phone number | `formatPhone(info.getValue())` | `(740) 555-1234` |
| Delivery date (`delivery_date`) | `formatDate(info.getValue())` | `07/02/2026` |
| Timestamp (`created_at`) | `formatDateTime(info.getValue())` | `7/2/2026, 3:45:00 PM` |
| Date only (`created_at` in Users) | `formatDateOnly(info.getValue())` | `7/2/2026` |
| Role (user) | `getRoleBadge(info.getValue())` | Colored pill ✔ |
| On Signal status | `getSignalBadge(info.getValue())` | Colored pill ✔ |
| Meal type | `getMealTypeBadge(info.getValue())` | Colored pill ✔ |
| Delivery day | `getDeliveryDayBadge(info.getValue())` | Capitalized secondary text |
| Contact method | `getContactMethodBadge(info.getValue())` | Capitalized secondary text |

## Column Styling Rules

- **Name / Driver columns**: `<span className="text-foreground font-medium">`
- **Email, phone, date, address columns**: `<span className="text-text-secondary">`
- **Editable action buttons**: `rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors`
- **Actions column must always be the LAST column.** Define it last in the columns array AND pin it to the right so it stays visible last: `initialColumnPinning={{ left: ["<name-or-id-column>"], right: ["actions"] }}`. Never pin `actions` to the left.

## Heading Hierarchy

- **Page `<h1>`**: `text-2xl font-bold text-foreground`
- **Section `<h2>`**: `text-xl font-bold text-foreground`

## Filter Components

- Stick to the existing select/dropdown pattern for enum filters: `w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary`
- Define filter components locally in the table file when their option values are table-specific.

## Do NOT

- Do not call `new Date().toLocaleString()` directly in cell renderers - use `formatDateTime()` from utils.
- Do not duplicate `formatPhone`, `formatDate`, `todayLocal`, or `deliveryDateFilterFn` - they live in `app/admin/lib/utils.tsx`.
- Do not create per-table badge components - use the shared ones from `app/admin/lib/utils.tsx`.
<!-- END:admin-table-style-rules -->

<!-- BEGIN:public-form-style-rules -->
# Public Form Style Rules

All public signup/pledge forms (meal delivery, driver volunteer, donation pledge, and any new public form) MUST follow the established form pattern. Mirror `components/MealSignupForm.tsx` and `components/DriverVolunteerForm.tsx`. Do NOT invent a new layout or styling.

## Wrapper & Heading

- Wrapper: `<div className="max-w-2xl mx-auto">`
- Page/form heading: `<h2 className="mb-6 text-3xl font-bold text-foreground">`
- Description paragraphs: `mb-8 text-lg text-text-secondary`
- "Look up my existing signups" button: `<p className="mb-8"><button type="button" onClick={...} className="text-sm font-medium text-primary hover:underline">Look up my existing signups →</button></p>`
- "Already have an account? Sign in..." link: `<p className="mb-8"><a href="/login" className="text-sm font-medium text-primary hover:underline">Already have an account? Sign in to manage your signups →</a></p>`

## Form & Fields

- Form: `<form action={formAction} className="space-y-6" noValidate>`
- Field wrapper: `<div className="space-y-2">`
- Label: `<label htmlFor="..." className="block text-sm font-medium text-foreground">Field <span className="text-red-500">*</span></label>`
- Input/select/textarea: `w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary` with conditional error styling: `border-red-500 focus:border-red-500 focus:ring-red-500` vs `border-input focus:border-primary focus:ring-primary`
- Each field sets `aria-invalid` and `aria-describedby` pointing at its error element id (`<field>-error`)
- Error text: `<p id="<field>-error" className="text-sm text-red-500" role="alert">{state.errors.<field>[0]}</p>`
- Grouped options use `<fieldset className="space-y-2">` with `<legend className="block text-sm font-medium text-foreground">`
- Radio/checkbox inputs: `h-4 w-4 text-primary border-input focus:ring-primary`

## Messages & Submit

- Top-level server error: `<div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">`
- Success: `<div className="rounded-lg bg-green-50 p-4 text-green-600" role="status">`
- Submit button: `<button type="submit" disabled={isPending || ...} className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">`
- Button label toggles: `{isPending ? "Submitting..." : "Submit ..."}`

## Lookup Modal

- Include a "Look up my existing signups" button wired to `<LookupModal>` when the program has existing-signup lookup support.
- If a new public form is added, add a corresponding lookup type to `LookupModal` and a `getMy...` action in `app/actions/lookup-signups.ts`.

## Do NOT

- Do not use small inputs (`px-2 py-1 text-sm`, `rounded border`) on public forms - those are for admin tables only.
- Do not omit `aria-invalid` / `aria-describedby` / error ids.
- Do not create a new visual style; reuse the classes above.
<!-- END:public-form-style-rules -->

<!-- BEGIN:skills -->
# Local Skills

- At the START of every session, run `ls ~/.opencode/skills/` to check for skill files
- READ every skill file found there and be ready to execute its workflow
- The `skill` tool may report "no skills available" even when files exist - ALWAYS verify by listing the directory directly
- When a user says a task is done (or similar phrasing), re-check this directory for any post-feature workflow
<!-- END:skills -->
