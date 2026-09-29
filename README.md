# Purple Fireflies

A community mutual-aid website for programs such as food justice in Athens County, OH, built with Next.js and deployed on Cloudflare Workers.

**Mission:** Foster an inclusive community where everyone feels safe, respected, and empowered to thrive. We work with grassroots leaders to inspire action, inform neighbors, and create lasting change.

## Pages

| Route | Description |
|---|---|
| `/` | Home page with mission and core values |
| `/programs` | Programs overview |
| `/programs/meal-delivery` | Meal Delivery program info |
| `/programs/meal-delivery/delivery-signup` | Meal recipient signup form |
| `/programs/meal-delivery/volunteer-signup` | Driver volunteer signup form |
| `/programs/legal-observers` | Legal Observers program info |
| `/programs/legal-observers/signup` | Legal Observer signup form |
| `/programs/legal-observers/request` | Coverage request form |
| `/programs/springfield-neighbors` | Springfield Neighbors donation program info (pantry staples + Walmart eGift cards) |
| `/programs/sunday-meals` | Sunday Meals program info (community cooks, 6-month commitment) |
| `/programs/sunday-meals/signup` | Sunday Meals cook commitment signup form |
| `/events` | Upcoming and past community events |
| `/news` | Articles about Purple Fireflies in the news |
| `/donate` | Donations page (Venmo, PayPal, Cash App, Give Butter) |
| `/contact` | Get Involved page — 7 volunteer branch cards, signup process, FAQ |
| `/login` | Sign in (admins and volunteers) |
| `/admin` | Admin dashboard |
| `/admin/users` | Admin user management (volunteer approval, password reset, resend invite) |
| `/admin/programs` | Programs management |
| `/admin/programs/meal-delivery` | Meal delivery CRUD + driver assignment |
| `/admin/programs/legal-observers` | Legal observer signups and coverage requests |
| `/admin/programs/sunday-meals` | Sunday Meals cook roster (availability, capacity, status, internal notes) |
| `/admin/events` | Events CRUD |
| `/admin/news` | News articles CRUD |
| `/volunteer` | Volunteer portal (sign-ins only) |

## Features

- **Meal Delivery Signup** — Public form for requesting meal delivery with date slot availability and vegan/GF options; prevents duplicate signups for the same person and date; admins can close any upcoming delivery day early, routing new signups to the waitlist even before the 15-meal cap is reached; admins can apply more than the standard 2 meals per signup (up to 10 per meal type, 20 total) from the admin panel while the public form keeps the 1-2 meal limit; the admin Delivery Days table lists all 7 weekdays for the next 4 weeks so admins can schedule signups and driver volunteers on any day, while the public forms remain limited to Wednesdays and Thursdays (Wednesday and Thursday driver emails include the pickup location — for Wednesdays that is the Episcopal Church on the first Wednesday of the month and the UCM pickup, like Thursday, on all other Wednesdays; emails for non-Wed/Thu days use a generic pickup message since those days have no fixed schedule yet)
- **Driver Volunteer Signup** — Public form for volunteers to sign up for delivery dates and regions; new volunteers start with driver status **Active** and liability **Not Signed**
- **Get Involved Branches** — The `/contact` page explains the seven ways to help (general volunteering, training, neighborhood outreach, tech support, financial/resources, communication, projects/youth). Each branch card has a one-line blurb, a task list, a "good fit if" line, and a cross-link to the relevant program page where one exists; there is no per-card signup CTA, all signup happens in the "Get in Touch" section at the bottom of the page. The page also has a "these are not siloed roles" band, a 3-step "what happens after you sign up" strip, and an FAQ (experience, multiple branches, time commitment, minors, wrong branch). Signup still routes through the external Disroot form; static content only, no DB
- **Volunteer Portal** — `/volunteer` portal where signed-in volunteers view and cancel their signups, update contact info, and see assigned deliveries; accounts are auto-created from the volunteer form with an emailed temporary password and require admin approval
- **Signup Lookup** — Modal to look up existing signups by email
- **Driver Reminder Emails** — Admin dashboard action to email drivers their delivery assignments for a selected date and email the coordinator a summary; supports sending the summary email only via a checkbox
- **Events** — Public `/events` page showing upcoming events and a collapsible past events section; admin CRUD at `/admin/events`
- **News** — Public `/news` page linking to news articles that mention Purple Fireflies; admin CRUD at `/admin/news`
- **Legal Observers Program** — Public program page (`/programs/legal-observers`) explaining what Legal Observers do, who can become one, Know Your Rights info, and NLG resources; observer signup form and coverage request form; admin panel at `/admin/programs/legal-observers` with tabbed views for signups and requests; the Coverage Requests tab groups requester and event info like the meal tables and adds admin-only **Status** (pending/working/fulfilled/partial/unable/cancelled badge with filter) and **Internal Notes** (expandable), edited via a modal; D1 storage via migrations `0029` + `0032`
- **Springfield Neighbors** — Public program page (`/programs/springfield-neighbors`) describing the mutual aid donation drive in Springfield: donations are collected at drop-off spots in Athens (currently Little Wings Thrift Store) and a volunteer drives them to Springfield weekly. Includes the full list of shelf-stable pantry staples to donate, a Walmart eGift card purchase link (emailed to springfield_neighbors@proton.me), and an email contact CTA; static page, no DB
- **Sunday Meals** — Public program page (`/programs/sunday-meals`) for the community kitchen program: a cook signs up once and commits to cooking **once a month for six months**, making **15 individually served plates** each month. Cooks declare which Sunday of the month generally works (1st through 5th, or any) rather than booking a date; an admin confirms the actual date out of band. The signup form also collects what kind of food the cook makes, which dietary needs they can accommodate, their realistic plate capacity, and free-text notes, and repeats the six-month/15-plate commitment directly above the submit button. Cook-only: there is no signup for people who come to eat. Admin roster at `/admin/programs/sunday-meals` lists one row per cook with availability badges, servings, expandable cooking/dietary/internal notes, and a **Status** (active/paused/finished/cancelled badge with filter) editable via a modal. Flat `sunday_meal_cooks` table via migration `0033`; deliberately does not join `participants`/`users` because Sunday cooks never deliver and never receive a meal. The commitment is declared but not tracked — nothing records that a cook actually cooked in a given month
- **Admin Panel** — JWT-authenticated dashboard with CRUD tables for meal signups, driver volunteers, events, news articles, and admin users; driver assignment management; a Delivery Days tab lists upcoming Wed/Thu dates with signup counts and Close/Reopen toggles; a read-only **Delivery Signups** tab shows each driver + delivery date (last 90 days) with the meal recipients already assigned to them, via expandable rows with name, phone, address, meals, and comments; the Waitlist tab uses the same column format as the Meal Signups table (combined requester with address, meal quantities, delivery date + weekday, status, comments, and pinned actions); admins can add waitlist entries directly via a full participant form (name, email, phone, address, delivery date, meals, contact method, comments, internal notes); all three admin tables (meal signups, driver volunteers, waitlist) support a **Duplicate** action that copies an entry to a new delivery date via a modal with date picker; the Driver Volunteers tab groups signups by person (one row per volunteer with name, email, phone, Signal status, a **Status** toggle, a **Liability** checkbox, and a # of days count) and opens a modal listing each day they've signed up for, with per-day Edit, Duplicate, and Add Day actions (sortable columns, newest delivery date first by default); the table defaults to showing only **Active** drivers (filter can be changed to include Inactive via the Status column filter); each volunteer row also has an editable per-volunteer **Bag #** field, and **Driver Liability** (signed/not signed) and **Driver Status** (active/inactive) are stored once on the participant, not per delivery day
- **Authentication** — Email/password login with bcrypt, JWT sessions, HTTP-only cookies

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 6
- **Styling:** Tailwind CSS 4
- **Deployment:** Cloudflare Workers via OpenNext Cloudflare
- **Database:** Cloudflare D1 (SQLite)
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

## Deployment

This project uses Cloudflare Workers Builds. Push to `main` and Cloudflare automatically builds and deploys.

- Build command: `npm run cf:build`
- Database migrations: `wrangler d1 execute purple-fireflies-db --file=migrations/XXXX_name.sql`
- Volunteer account backfill (after deploying the volunteer portal): `node scripts/backfill-volunteer-accounts.mjs --env preview` — generates SQL + temp passwords for recent volunteers without an account (see script header for usage; defaults to `--days 14 --status active`)

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
