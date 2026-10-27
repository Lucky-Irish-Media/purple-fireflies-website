# Purple Fireflies

A community mutual-aid website for programs such as food justice in Athens County, OH, built with Next.js and deployed on Cloudflare Workers.

**Mission:** Foster an inclusive community where everyone feels safe, respected, and empowered to thrive. We work with grassroots leaders to inspire action, inform neighbors, and create lasting change.

## Pages

| Route | Description |
|---|---|
| `/` | Home page with mission and core values |
| `/about` | About page - Purple Fireflies' founding story and the origin of the name |
| `/programs` | Programs overview |
| `/programs/meal-delivery` | Meal Delivery program info |
| `/programs/meal-delivery/delivery-signup` | Meal recipient signup form |
| `/programs/meal-delivery/volunteer-signup` | Driver volunteer signup form |
| `/programs/legal-observers` | Legal Observers program info |
| `/programs/legal-observers/signup` | Legal Observer signup form |
| `/programs/legal-observers/request` | Coverage request form |
| `/programs/springfield-neighbors` | Springfield Neighbors donation program info (pantry staples + Walmart eGift cards) |
| `/programs/community-pets` | Community Pet Fund program info, transparency totals, and published pets |
| `/programs/community-pets/[slug]` | One pet profile with photos, needs list, and sponsorship progress |
| `/events` | Upcoming and past community events |
| `/community` | Community groups Purple Fireflies collaborates with (Athens County Food Info, Love Light Movement) |
| `/news` | Articles about Purple Fireflies in the news |
| `/donate` | Donations page (Venmo, PayPal, Cash App, Give Butter) |
| `/contact` | Get Involved page — 7 volunteer branch cards, signup process, FAQ |
| `/login` | Sign in (admins and volunteers) |
| `/admin` | Admin dashboard |
| `/admin/users` | Admin user management (volunteer approval, password reset, resend invite) |
| `/admin/programs` | Programs management |
| `/admin/programs/meal-delivery` | Meal delivery CRUD + driver assignment |
| `/admin/programs/legal-observers` | Legal observer signups and coverage requests |
| `/admin/programs/community-pets` | Community Pet Fund roster, needs, expenses, and publish gate |
| `/api/givebutter/webhook` | Givebutter webhook receiver (signature-authenticated, POST only) |
| `/admin/events` | Events CRUD |
| `/admin/news` | News articles CRUD |
| `/volunteer` | Volunteer portal (sign-ins only) |

## Features

- **Meal Delivery Signup** — Public form for requesting meal delivery with date slot availability and vegan/GF options; prevents duplicate signups for the same person and date; admins can close any upcoming delivery day early, routing new signups to the waitlist even before the 15-meal cap is reached; admins can apply more than the standard 2 meals per signup (up to 10 per meal type, 20 total) from the admin panel while the public form keeps the 1-2 meal limit; the admin Delivery Days table lists all 7 weekdays for the next 4 weeks so admins can schedule signups and driver volunteers on any day, while the public forms remain limited to Wednesdays and Thursdays (Wednesday and Thursday driver emails include the pickup location — for Wednesdays that is the Episcopal Church on the first Wednesday of the month and the UCM pickup, like Thursday, on all other Wednesdays; emails for non-Wed/Thu days use a generic pickup message since those days have no fixed schedule yet)
- **Driver Volunteer Signup** — Public form for volunteers to sign up for delivery dates and regions; new volunteers start with driver status **Active** and liability **Not Signed**; the form ends with a required **Liability Waiver** e-signature section (full waiver text, certification bullets, driver's license/vehicle/emergency-contact fields, typed signature, acknowledgment checkbox) shown only to drivers who have not signed yet — signing records a `waiver_signatures` row (migration `0034`) and sets the liability flag, and the admin Driver Volunteers table shows the signed date under the Liability badge
- **Get Involved Branches** — The `/contact` page explains the seven ways to help (general volunteering, training, neighborhood outreach, tech support, financial/resources, communication, projects/youth). Each branch card has a one-line blurb, a task list, a "good fit if" line, and a cross-link to the relevant program page where one exists; there is no per-card signup CTA, all signup happens in the "Get in Touch" section at the bottom of the page. The page also has a "these are not siloed roles" band, a 3-step "what happens after you sign up" strip, and an FAQ (experience, multiple branches, time commitment, minors, wrong branch). Signup still routes through the external Disroot form; static content only, no DB
- **Volunteer Portal** — `/volunteer` portal where signed-in volunteers view and cancel their signups, update contact info, and see assigned deliveries; accounts are auto-created from the volunteer form with an emailed temporary password and require admin approval
- **Signup Lookup** — Modal to look up existing signups by email
- **Driver Reminder Emails** — Admin dashboard action to email drivers their delivery assignments for a selected date and email the coordinator a summary; supports sending the summary email only via a checkbox
- **Events** — Public `/events` page showing upcoming events and a collapsible past events section; admin CRUD at `/admin/events`
- **News** — Public `/news` page linking to news articles that mention Purple Fireflies; admin CRUD at `/admin/news`
- **About Page** — Public `/about` page telling the Purple Fireflies story in prose: community helping community, the November 2025 founding (SNAP pause, the Link family's November Grocery Buddy feeding 150 households, and the transportation barrier that led to the Meal Program), the Pet Program origin, and the "Why the name Purple Fireflies?" section (purple as a color that belongs to no group, fireflies tied to the first Ohio summer). Linked from the Navbar (desktop and mobile, between Donate and Get Involved) and the Footer links (same position); simple prose page, no DB. Also fixed the root metadata placeholder description in `app/layout.tsx`
- **Community** — Public `/community` page listing the groups Purple Fireflies collaborates with, currently Athens County Food Info (a directory of free food programs across Athens County) and Love Light Movement (a volunteer group serving free meals across Athens and Meigs counties). Cards are rendered from a `partners` array at the top of `app/community/page.tsx`, so adding a group is appending one object; each card links to the group's own site in a new tab with `rel="noopener noreferrer"`, and the page closes with a Get Involved CTA back to `/contact`. Linked from the Navbar (desktop and mobile, between Events and Donate) and the Footer; static page, no DB
- **Legal Observers Program** — Public program page (`/programs/legal-observers`) explaining what Legal Observers do, who can become one, Know Your Rights info, and NLG resources; observer signup form and coverage request form; admin panel at `/admin/programs/legal-observers` with tabbed views for signups and requests; the Coverage Requests tab groups requester and event info like the meal tables and adds admin-only **Status** (pending/working/fulfilled/partial/unable/cancelled badge with filter) and **Internal Notes** (expandable), edited via a modal; D1 storage via migrations `0029` + `0032`
- **Community Pet Fund (admin)** - Admin roster at `/admin/programs/community-pets` for the neighbors' pet sponsorship program: a shared `DataTable` of pets with thumbnail, species, status badge, raised versus goal, spent total, published state, and owner-consent state, plus Edit, Publish/Unpublish, and Delete actions. The create/edit modal writes name, slug (auto-generated from the name), species, breed, age, sex, tagline, bio, story, dynamic needs rows (label, cost, one-time or monthly), goal, Givebutter campaign code and URL, sort order, owner consent date and note, and publish state. **Publishing is rejected server-side** unless an owner consent date and a Givebutter campaign code are both recorded, so disabling the checkbox in the UI is not the gate. Per-pet expenses (description, amount, vendor, date) can be recorded and deleted from the same modal, which is what the public page will use to show raised versus spent. Photos upload from the same modal: the browser resizes the image to a 1600px longest edge and converts it to WebP before sending, the server accepts JPEG, PNG, or WebP up to 8 MB, and objects are stored in the private `MEDIA_BUCKET` R2 bucket under `animals/<animalId>/<uuid>.<ext>`. They are served by `GET /api/media/[...key]` with `Cache-Control: public, max-age=31536000, immutable`, and removing a photo deletes both the R2 object and the row. The Sponsors tab is a read-only donor ledger. D1 storage via migration `0035`
- **Community Pet Fund sponsors tab (admin)** - The Sponsors tab at `/admin/programs/community-pets` is a donor ledger over `animal_sponsorships` joined to each pet, newest first, with date, animal, donor name, donor email, amount, recurring cadence, and status columns. A totals strip shows total raised (succeeded gifts only), the refunded total, and the gift count, so refunds stay visible in the table but are excluded from the raised figure. Filter by animal and by status. A **Refresh from Givebutter** button (shown when `GIVEBUTTER_API_KEY` is set) pulls each campaign's `raised` and `donors` into the cached `animals` columns and revalidates the admin and public pages; it fetches every campaign before writing, so a failed request leaves the last known totals intact. Donor email never leaves admin code
- **Community Pet Fund Givebutter capture** - `POST /api/givebutter/webhook` receives Givebutter webhook deliveries for `transaction.succeeded`, `refund.created`, and `plan.failed`. The only authentication is the shared signing secret Givebutter sends verbatim in a `Signature` header, compared in constant time; a missing `GIVEBUTTER_WEBHOOK_SECRET` returns 500, a missing or wrong signature 401, and malformed JSON 400. `transaction.succeeded` is attributed to a pet by its Givebutter campaign code (case-insensitive), stores the transaction as `gb_transaction_id`, converts dollars to integer cents, and only increments the supporter count when it is that donor's first gift to the pet, so a monthly plan does not add a supporter every month. A gift whose campaign code matches no pet is acknowledged and ignored rather than polluting the pet ledger. `refund.created` marks a full refund as `refunded` and subtracts it from the cached totals, or shrinks `amount_cents` for a partial refund. `plan.failed` emails `ADMIN_EMAIL` (falling back to `info@purplefireflies.org`) and does not email the donor. Every delivery is claimed in `givebutter_events` before processing, and a claim is released if processing throws so the retry still runs; `animal_sponsorships.gb_transaction_id` is UNIQUE as a second line of defence, making replays a no-op. The first gift to a pet also sends a thank-you email with the current tax-status copy and the surplus policy; mail failures are logged and never fail the webhook. Cached totals are authoritative from the next refresh.
- **Springfield Neighbors** — Public program page (`/programs/springfield-neighbors`) describing the mutual aid donation drive in Springfield: donations are collected at drop-off spots in Athens (Little Wings Thrift Store and United Campus Ministries) and a volunteer drives them to Springfield weekly. Includes the full list of shelf-stable pantry staples to donate, a Walmart eGift card purchase link (emailed to springfield_neighbors@proton.me), and an email contact CTA; static page, no DB
- **Community Pet Fund** - Public program page (`/programs/community-pets`) explaining the fund: what it is, who qualifies, the three-step flow (a neighbor applies, the board approves a vendor payment, neighbors sponsor), and a transparency block with total raised, total paid to clinics and suppliers, and how many pets have been helped, all computed from D1. The page also offers a general pet fund donation option for visitors who cannot pick just one pet, supporting food for all pets in the program and outdoor shelters for colony cats. Published pets appear in a grid with a cover photo (or an initial-letter tile), tagline or species, and progress toward the goal, and each card links to a profile at `/programs/community-pets/<slug>` with a photo gallery and alt text, bio, story, a needs list with real costs and cadence, and `AnimalProgress` (raised of goal, supporter count, raised versus spent, clamped at 100%, with an "any amount helps" state when a pet has no goal). The surplus policy is stated in its own block and the donor-privacy note appears on every pet page. Pet profiles render `generateMetadata` with a per-pet title, description, and OG image. The donation form is embedded on the pet page: `GivebutterWidget` loads Givebutter's widget library once for the org's account and renders `<givebutter-giving-form campaign="<code>">`, so a donor gives any amount, one time or monthly, without leaving the page, and the widget's own goal bar stays off because `AnimalProgress` is the source of progress. If the library is blocked or fails to register its element, the block says so and links to the campaign page instead of leaving an empty box. The donation widget is flag-gated: `COMMUNITY_PETS_DONATIONS_ENABLED` off renders a "sponsorship opens soon" block with a contact link and no donation UI, and the tax line renders from `NONPROFIT_STATUS` instead of hardcoded text. The pages read cached D1 totals, never the Givebutter API
- **Admin Panel** — JWT-authenticated dashboard with CRUD tables for meal signups, driver volunteers, events, news articles, and admin users; driver assignment management; a Delivery Days tab lists upcoming Wed/Thu dates with signup counts and Close/Reopen toggles; a read-only **Delivery Signups** tab shows each driver + delivery date (last 90 days) with the meal recipients already assigned to them, via expandable rows with name, phone, address, meals, and comments; the Waitlist tab uses the same column format as the Meal Signups table (combined requester with address, meal quantities, delivery date + weekday, status, comments, and pinned actions); admins can add waitlist entries directly via a full participant form (name, email, phone, address, delivery date, meals, contact method, comments, internal notes); all three admin tables (meal signups, driver volunteers, waitlist) support a **Duplicate** action that copies an entry to a new delivery date via a modal with date picker; the Driver Volunteers tab groups signups by person (one row per volunteer with name, email, phone, Signal status, a **Status** toggle, a **Liability** checkbox with the waiver signed date shown under the badge for in-app signatures, and a # of days count) and opens a modal listing each day they've signed up for, with per-day Edit, Duplicate, and Add Day actions (sortable columns, newest delivery date first by default); the table defaults to showing only **Active** drivers (filter can be changed to include Inactive via the Status column filter); each volunteer row also has an editable per-volunteer **Bag #** field, and **Driver Liability** (signed/not signed) and **Driver Status** (active/inactive) are stored once on the participant, not per delivery day; every Delivery column (Meal Signups, Delivery Signups, Waitlist) filters by relative preset (Today, This Week, Next Week, future or past) or by one exact date picked from a native date input, with a Clear control to reset
- **Authentication** — Email/password login with bcrypt, JWT sessions, HTTP-only cookies

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 6
- **Styling:** Tailwind CSS 4
- **Deployment:** Cloudflare Workers via OpenNext Cloudflare
- **Database:** Cloudflare D1 (SQLite)
- **Media:** Cloudflare R2 (`MEDIA_BUCKET`) for Community Pet Fund photos
- **Auth:** bcryptjs + jose (JWT)
- **Validation:** Zod
- **Tables:** @tanstack/react-table

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Environment Variables

- `SESSION_SECRET` — Required. Set in `.dev.vars` for local development.
- `SPRINGFIELD_BOXES_DELIVERED` — Running total of boxes delivered by Springfield Neighbors volunteers, shown in the hero stats strip on `/programs/springfield-neighbors`. Manually maintained — bump it in `wrangler.toml` under `[vars]` (production) and `[previews.vars]` (preview). Anything that isn't a non-negative integer renders as `0`.
- `COMMUNITY_PETS_DONATIONS_ENABLED` - `"true"` shows the Community Pet Fund sponsor block on pet pages; anything else (including a missing var) renders the "sponsorship opens soon" block with no donation UI. `false` in production, `true` in preview.
- `NONPROFIT_STATUS` - `state_only` (default) renders the "registered Ohio nonprofit corporation, gifts are not currently tax-deductible" line; `501c3` renders the deductible line. Any other value falls back to `state_only`.
- `GIVEBUTTER_API_KEY` - Givebutter API key (Settings > API). When set, the admin Sponsors tab shows **Refresh from Givebutter**, which copies campaign totals into D1. When unset the button is hidden and the rest of the site is unaffected.
- `GIVEBUTTER_WIDGET_ACCOUNT_ID` - Givebutter Widgets account ID (Dashboard > Settings > Integrations). The pet page loads Givebutter's embed library from `https://widgets.givebutter.com/latest.umd.cjs?acct=<id>&p=other` and renders `<givebutter-giving-form campaign="<code>">`, so the donation form lives on our page. Public by nature: it is visible in the script URL. When empty, or when a pet has no campaign code, the sponsor block shows the campaign link instead of an empty form. A plain `[vars]` entry, not a secret.
- `COMMUNITY_PETS_GENERAL_FUND_CAMPAIGN_CODE` - Optional. Givebutter campaign code for the general pet fund (food for all pets, outdoor shelters for colony cats). When set (and donations are enabled), the main Community Pet Fund page shows a "Donate to the general pet fund" section. Leave empty until a campaign exists.
- `COMMUNITY_PETS_GENERAL_FUND_CAMPAIGN_URL` - Optional. Givebutter campaign URL for the general pet fund, used as a fallback link.
- `GIVEBUTTER_WEBHOOK_SECRET` - Signing secret from the Givebutter webhook subscription. Givebutter sends it verbatim in a `Signature` header on every delivery; the receiver compares it in constant time. When unset the webhook returns 500 and records nothing. Worker Previews do not inherit production secrets, so set secrets twice: `npx wrangler secret put GIVEBUTTER_WEBHOOK_SECRET` for production, and `npx wrangler preview base-config secret put GIVEBUTTER_WEBHOOK_SECRET` for new previews. Base preview secrets only apply to previews created after the command; use `npx wrangler preview secret put NAME --name <branch>` to update an existing preview.
- `ADMIN_EMAIL` - Optional internal alert address for failed Givebutter plans. Falls back to `info@purplefireflies.org`.

## Deployment

This project uses Cloudflare Workers Builds. Push to `main` and Cloudflare builds with `npm run cf:build` and deploys with `npx wrangler deploy` to the production Worker. Every other branch builds a Worker Preview with `npx wrangler preview`.

Previews run on the same Worker as production, on their own branch URL, with the bindings in the `[previews]` block of `wrangler.toml`:

- D1: `purple-fireflies-db-preview`
- KV: `purple-fireflies-preview-kv`
- R2: `purple-fireflies-media-preview`

`[previews]` does not inherit the top-level config, so every binding a preview needs must also be listed there. There is no `[env.preview]`; never run `wrangler deploy --env preview`, because that is how the production Worker previously ended up bound to the preview resources.

- Build command: `npm run cf:build`
- Preview command (Workers Builds): `npx wrangler preview`
- Preview secrets: previews do not inherit production secrets. Set each one with `npx wrangler preview base-config secret put NAME`; the base config only applies to previews created afterwards, so use `npx wrangler preview secret put NAME --name <branch>` for an existing branch
- Database migrations (production): `npx wrangler d1 execute purple-fireflies-db --remote --file=migrations/XXXX_name.sql`
- Database migrations (preview): `npx wrangler d1 migrations apply PREVIEW_DB --remote --config wrangler.preview-migrations.toml`
- R2 buckets: `purple-fireflies-media` (production) and `purple-fireflies-media-preview` (preview), both bound as `MEDIA_BUCKET`. The buckets are private; images are only reachable through `GET /api/media/[...key]` on the Worker.
- Givebutter webhook: create one subscription in the Givebutter dashboard pointing at `https://<domain>/api/givebutter/webhook` with the events `transaction.succeeded`, `refund.created`, and `plan.failed`. Givebutter sends the subscription's signing secret in a `Signature` header; the same value goes on the Worker as `GIVEBUTTER_WEBHOOK_SECRET`. While the feature is on a branch, point the subscription at the preview URL, then switch the URL at launch. `transaction.succeeded` does not fire for CSV imports, so use **Refresh from Givebutter** after an import.
- Volunteer account backfill (after deploying the volunteer portal): `node scripts/backfill-volunteer-accounts.mjs --preview` generates SQL + temp passwords for recent volunteers without an account (see script header for usage; defaults to `--days 14 --status active`)

## Design Choices

### Color Palette

| Role | Color | Hex Code | Usage |
|------|-------|----------|-------|
| Background | Cream | `#faf8f0` | Page background |
| Foreground | Near Black | `#111827` | Primary text |
| Card | White | `#FFFFFF` | Card backgrounds |
| Primary | Purple | `#7C3AED` | Branding, primary actions |
| Accent | Amber | `#F59E0B` | Secondary actions |
| Text Secondary | Gray | `#6B7280` | Secondary text |
| Complementary | Green | `#43ab00` | Complementary to purple |
| Analogous 1 | Blue | `#1300ab` | Analogous to purple |
| Analogous 2 | Magenta | `#ab0098` | Analogous to purple |
| Triad 1 | Orange | `#ab6800` | Triadic with purple |
| Triad 2 | Teal | `#00ab68` | Triadic with purple |

### Typography

| Type | Font Family | Source |
|------|-------------|--------|
| Sans-serif | Geist Sans | `next/font/google` |
| Monospace | Geist Mono | `next/font/google` |
| Fallback | Arial, Helvetica, sans-serif | System |

### Design System

- **Framework:** Tailwind CSS 4 with CSS custom properties
- **Component Structure:** Next.js App Router with shared layout (Navbar, Footer)
- **Pages:** Home, Programs (meal delivery signup + volunteer signup, legal observers signup + coverage request), Donate, Contact, Admin (dashboard, users, programs)
