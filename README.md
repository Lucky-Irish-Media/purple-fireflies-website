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
| `/donate` | Donations page (Venmo, PayPal, Cash App, Give Butter) |
| `/contact` | Get Involved page |
| `/login` | Admin login |
| `/admin` | Admin dashboard |
| `/admin/users` | Admin user management |
| `/admin/programs` | Programs management |
| `/admin/programs/meal-delivery` | Meal delivery CRUD + driver assignment |

## Features

- **Meal Delivery Signup** — Public form for requesting meal delivery with date slot availability and vegan/GF options
- **Driver Volunteer Signup** — Public form for volunteers to sign up for delivery dates and regions
- **Signup Lookup** — Modal to look up existing signups by email
- **Admin Panel** — JWT-authenticated dashboard with CRUD tables for meal signups, driver volunteers, and admin users; driver assignment management
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
- **Pages:** Home, Programs (meal delivery signup + volunteer signup), Donate, Contact, Admin (dashboard, users, programs)
