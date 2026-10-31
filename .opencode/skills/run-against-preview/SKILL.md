---
name: run-against-preview
description: Run the Purple Fireflies website locally (Next.js dev server or built worker) while pointing Cloudflare bindings (D1, KV, R2) at the preview environment. Use when the user wants to test against preview data/services without deploying.
---

# Run Locally Against Preview Cloudflare Bindings

This project's Cloudflare bindings (D1 `purple_fireflies_db`, KV `PURPLE_FIREFLIES_KV`, R2 `NEWSLETTER_IMAGES`) default to **local miniflare emulation** during dev. To point them at the **remote preview** resources instead, use the remote-bindings feature.

## Prerequisites

- Authenticated wrangler session: `npx wrangler whoami`
- Preview bindings in `wrangler.toml` (`[env.preview.*]`) must have `remote = true` (already set for D1, KV, R2).

## Next.js dev server

```bash
npm run dev:preview
# equivalent to:
NEXT_DEV_WRANGLER_ENV=preview npm run dev
```

- Code runs on your machine; bindings hit preview D1/KV/R2.
- `SESSION_SECRET` etc. still come from `.env.local` / process env (Next.js loads it). Wrangler loads `.dev.vars` for vars.
- Top-level (production) bindings do NOT have `remote = true`, so default `npm run dev` stays local/emulated and never touches production.

## Built worker (OpenNext)

```bash
npm run cf:build
npx opennextjs-cloudflare preview --env preview
```

Pass `--env preview` so wrangler selects the preview database IDs and remote bindings.

## How it works

- `initOpenNextCloudflareForDev()` in `next.config.ts` calls `getPlatformProxy({ environment, remoteBindings: true })`.
- `NEXT_DEV_WRANGLER_ENV` selects the wrangler environment (`preview`).
- Each preview binding has `remote = true`, so miniflare proxies that binding to the real preview resource over the network.

## Safety

- Preview data is shared with the deployed preview Worker. Writes during local dev affect preview data.
- Never add `remote = true` to the top-level (production) bindings, and never run against production (`--env` omitted / production) for testing.
- Production migrations/changes require explicit user authorization per `d1-migration-safety`.

## Verification

```bash
NEXT_DEV_WRANGLER_ENV=preview node -e "const {getPlatformProxy}=require('wrangler'); (async()=>{const p=await getPlatformProxy({environment:'preview'}); console.log(await p.env.purple_fireflies_db.prepare('SELECT COUNT(*) c FROM participants').first()); await p.dispose();})()"
```
