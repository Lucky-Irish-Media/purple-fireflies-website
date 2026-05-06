# Purple Fireflies

A simple one-page website built with Next.js and deployed on Cloudflare Workers.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project uses Cloudflare Workers Builds for deployment. Simply push to the `main` branch and Cloudflare will automatically build and deploy.

- Build command: `npm run cf:build`
- Deploys automatically from the `main` branch

## Design Choices

### Color Palette

| Role | Color | Hex Code | Usage |
|------|-------|----------|-------|
| Background | Cream | `#faf8f0` | Page background |
| Foreground | Near Black | `#111827` | Primary text color |
| Card | White | `#FFFFFF` | Card backgrounds |
| Primary | Purple | `#7C3AED` | Primary actions, branding (matches "Purple Fireflies" theme) |
| Accent | Amber | `#F59E0B` | Accent elements, secondary actions |
| Text Secondary | Gray | `#6B7280` | Secondary text, descriptions |
| Complementary | Green | `#43ab00` | Complementary to primary purple |
| Analogous 1 | Blue | `#1300ab` | Analogous to primary purple |
| Analogous 2 | Magenta | `#ab0098` | Analogous to primary purple |
| Triad 1 | Orange | `#ab6800` | Triadic with primary purple |
| Triad 2 | Teal | `#00ab68` | Triadic with primary purple |

### Typography

| Type | Font Family | Source |
|------|-------------|--------|
| Sans-serif | Geist Sans | `next/font/google` |
| Monospace | Geist Mono | `next/font/google` |
| Fallback | Arial, Helvetica, sans-serif | System fallback |

### Design System

- **Framework**: Tailwind CSS with CSS custom properties
- **Component Structure**: Next.js App Router with shared layout
- **Navigation**: Navbar component shared across all pages
- **Pages**: Home, Programs (with meal delivery sub-page), Donate
