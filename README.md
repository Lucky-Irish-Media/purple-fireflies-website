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
| `/events` | Upcoming and past community events |
| `/news` | Articles about Purple Fireflies in the news |
| `/donate` | Donations page (Venmo, PayPal, Cash App, Give Butter) |
| `/contact` | Get Involved page |
| `/login` | Sign in (admins and volunteers) |
| `/admin` | Admin dashboard |
| `/admin/users` | Admin user management (volunteer approval, password reset, resend invite) |
| `/admin/programs` | Programs management |
| `/admin/programs/meal-delivery` | Meal delivery CRUD + driver assignment |
| `/admin/programs/legal-observers` | Legal observer signups and coverage requests |
| `/admin/events` | Events CRUD |
| `/admin/news` | News articles CRUD |
| `/volunteer` | Volunteer portal (sign-ins only) |

## Features

- **Meal Delivery Signup** — Public form for requesting meal delivery with date slot availability and vegan/GF options; prevents duplicate signups for the same person and date; admins can close any upcoming delivery day early, routing new signups to the waitlist even before the 15-meal cap is reached; admins can apply more than the standard 2 meals per signup (up to 10 per meal type, 20 total) from the admin panel while the public form keeps the 1-2 meal limit; the admin Delivery Days table lists all 7 weekdays for the next 4 weeks so admins can schedule signups and driver volunteers on any day, while the public forms remain limited to Wednesdays and Thursdays (emails for non-Wed/Thu days use a generic pickup message since those days have no fixed schedule yet)
- **Driver Volunteer Signup** — Public form for volunteers to sign up for delivery dates and regions
- **Volunteer Portal** — `/volunteer` portal where signed-in volunteers view and cancel their signups, update contact info, and see assigned deliveries; accounts are auto-created from the volunteer form with an emailed temporary password and require admin approval
- **Signup Lookup** — Modal to look up existing signups by email
- **Driver Reminder Emails** — Admin dashboard action to email drivers their delivery assignments for a selected date and email the coordinator a summary; supports sending the summary email only via a checkbox
- **Events** — Public `/events` page showing upcoming events and a collapsible past events section; admin CRUD at `/admin/events`
- **News** — Public `/news` page linking to news articles that mention Purple Fireflies; admin CRUD at `/admin/news`
- **Legal Observers Program** — Public program page (`/programs/legal-observers`) explaining what Legal Observers do, who can become one, Know Your Rights info, and NLG resources; observer signup form and coverage request form; admin panel at `/admin/programs/legal-observers` with tabbed views for signups and requests; D1 storage via migration `0029`
- **Admin Panel** — JWT-authenticated dashboard with CRUD tables for meal signups, driver volunteers, events, news articles, and admin users; driver assignment management; a Delivery Days tab lists upcoming Wed/Thu dates with signup counts and Close/Reopen toggles; the Waitlist tab uses the same column format as the Meal Signups table (combined requester with address, meal quantities, delivery date + weekday, status, comments, and pinned actions); admins can add waitlist entries directly via a full participant form (name, email, phone, address, delivery date, meals, contact method, comments, internal notes); all three admin tables (meal signups, driver volunteers, waitlist) support a **Duplicate** action that copies an entry to a new delivery date via a modal with date picker; the Driver Volunteers tab groups signups by person (one row per volunteer with name, email, phone, and a # of days count) and opens a modal listing each day they've signed up for, with per-day Edit, Duplicate, and Add Day actions; each volunteer row also has an editable per-volunteer **Bag #** field (stored once on the participant, not per delivery day)
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
