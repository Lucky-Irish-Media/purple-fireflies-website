<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:deployment-rules -->
# Deployment Rules

- NEVER manually deploy using `npm run cf:deploy` or `wrangler deploy`
- ALL deployments MUST go through Cloudflare Workers Builds connected to the GitHub repository
- Only push code to GitHub; Cloudflare will automatically build and deploy from the `main` branch
- Build command for Cloudflare Workers Builds: `npm run cf:build`
- Deploy command for Cloudflare Workers Builds: (none - use build output directly)

# Production Safety

- NEVER run any command against production (e.g. `wrangler ... --remote` without `--env preview`) unless the user EXPLICITLY states you may
- This includes D1 migrations, KV operations, and any other wrangler commands targeting the production environment
- When in doubt, default to the preview environment (`--env preview`)

# "Make it so"

When the user says "make it so", perform these steps in order:
1. Switch to `main` and pull
2. Run any pending migrations on production if they haven't been run yet
3. Delete the remote and local feature branch
<!-- END:deployment-rules -->

# Verification

- BEFORE pushing any changes, run `npm run build` to type-check and compile. `npx tsc --noEmit` is unreliable in this project (it fails on `@cloudflare/workers-types`).
- `npm run build` uses Turbopack which includes its own type checker and catches the same errors the CI build will catch.

<!-- BEGIN:admin-table-style-rules -->
# Admin Table Style Rules

All admin tables use the shared `<DataTable>` component from `app/admin/components/DataTable.tsx`.

## Formatting Conventions

Import shared formatters and badge components from `app/admin/lib/utils.tsx` — do NOT define them locally.

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

## Heading Hierarchy

- **Page `<h1>`**: `text-2xl font-bold text-foreground`
- **Section `<h2>`**: `text-xl font-bold text-foreground`

## Filter Components

- Stick to the existing select/dropdown pattern for enum filters: `w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary`
- Define filter components locally in the table file when their option values are table-specific.

## Do NOT

- Do not call `new Date().toLocaleString()` directly in cell renderers — use `formatDateTime()` from utils.
- Do not duplicate `formatPhone`, `formatDate`, `todayLocal`, or `deliveryDateFilterFn` — they live in `app/admin/lib/utils.tsx`.
- Do not create per-table badge components — use the shared ones from `app/admin/lib/utils.tsx`.
<!-- END:admin-table-style-rules -->

<!-- BEGIN:skills -->
# Local Skills

- At the START of every session, run `ls ~/.opencode/skills/` to check for skill files
- READ every skill file found there and be ready to execute its workflow
- The `skill` tool may report "no skills available" even when files exist — ALWAYS verify by listing the directory directly
- When a user says a task is done (or similar phrasing), re-check this directory for any post-feature workflow
<!-- END:skills -->
