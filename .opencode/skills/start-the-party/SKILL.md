---
name: start-the-party
description: Spin up the Purple Fireflies Next.js dev server locally, pointed at the preview Cloudflare bindings (D1/KV/R2), secrets, and variables. Trigger when the user says "start the party".
---

# Start the Party (Local Dev Against Preview Cloudflare)

When the user says **"start the party"**, spin up the Next.js dev server on this
machine while pointing every Cloudflare binding, secret, and variable at the
**preview** environment (not production, not local miniflare emulation).

## What "party mode" means

- Bindings (`purple_fireflies_db`, `PURPLE_FIREFLIES_KV`, `MEDIA_BUCKET`) resolve
  to the preview resources (`purple-fireflies-db-preview`,
  `purple-fireflies-preview-kv` / `88406a0a...`, `purple-fireflies-media-preview`)
  with `remote = true`, so reads/writes hit the real preview data.
- Vars come from `wrangler.preview.toml` (`[vars]`) plus any overrides in
  `.dev.vars`.
- Secrets come from `.dev.vars` (wrangler's local secret store for dev).
- Next.js process env (e.g. `SESSION_SECRET`) comes from `.env.local`.

Production (`wrangler.toml` top-level) is never touched and `wrangler deploy`
is never run.

## Preflight (run before starting)

1. Confirm wrangler is authenticated:
   ```bash
   npx wrangler whoami
   ```
2. Confirm the preview dev config exists and still points at preview resources
   with `remote = true`:
   ```bash
   grep -n "remote = true\|preview" wrangler.preview.toml
   ```
3. Ensure `.dev.vars` exists. If it is missing, seed it from the example and
   stop to let the user fill in real secrets:
   ```bash
   if [ ! -f .dev.vars ]; then cp .dev.vars.example .dev.vars; echo "created .dev.vars from example - fill in secrets"; fi
   ```
   Required keys: `SESSION_SECRET` (also mirrored in `.env.local`),
   `SPRINGFIELD_BOXES_DELIVERED`, `COMMUNITY_PETS_DONATIONS_ENABLED`,
   `NONPROFIT_STATUS`, `GIVEBUTTER_WIDGET_ACCOUNT_ID`, plus the optional
   `EMAIL_API_KEY`, `GIVEBUTTER_API_KEY`, `GIVEBUTTER_WEBHOOK_SECRET`.
4. Ensure `.env.local` exists with at least `SESSION_SECRET`. If `SESSION_SECRET`
   is missing from `.dev.vars`/`.env.local`, generate one and write it to both:
   ```bash
   if ! grep -q '^SESSION_SECRET=' .env.local 2>/dev/null; then
     SECRET=$(openssl rand -base64 32)
     printf 'SESSION_SECRET=%s\n' "$SECRET" >> .env.local
     grep -q '^SESSION_SECRET=' .dev.vars 2>/dev/null || printf 'SESSION_SECRET=%s\n' "$SECRET" >> .dev.vars
   fi
   ```
5. Make sure no stale dev server is bound to the port:
   ```bash
   pkill -f "next dev" 2>/dev/null; sleep 1
   ```

## Start the server

Run in the background and capture output so we can verify it came up:

```bash
nohup npm run dev:preview > /tmp/opencode/party.log 2>&1 &
echo "started $!"
sleep 8
cat /tmp/opencode/party.log
```

`npm run dev:preview` is equivalent to `NEXT_DEV_PREVIEW=1 next dev`, which
makes `next.config.ts` load `wrangler.preview.toml`.

## Verify it is actually on preview

The log should contain all of these:

- `Establishing remote connection...`
- `Using secrets defined in .dev.vars`
- No `No environment found in configuration with name "preview"` warning
- No `Another next dev server is already running`

Then confirm the bindings really are preview by querying through the proxy:

```bash
NEXT_DEV_PREVIEW=1 node -e "
const {getPlatformProxy}=require('wrangler');
(async()=>{const p=await getPlatformProxy({configPath:'wrangler.preview.toml'});
const r=await p.env.purple_fireflies_db.prepare('SELECT COUNT(*) c FROM participants').first();
console.log('preview participants:', r.c);
await p.dispose();})().catch(e=>{console.error(e);process.exit(1)});
"
```

A count matching the preview seed (28 by default) confirms preview data.

## Report to the user

- Local URL (from the log, usually http://localhost:3000 or the next free port)
- That it is bound to preview D1/KV/R2
- Reminder that writes during this session affect shared preview data
- How to stop: `pkill -f "next dev"`

## Safety

- Never switch this to production: do not edit `wrangler.toml` top-level bindings
  to add `remote = true`, and never run `wrangler deploy` or `wrangler deploy --env preview`.
- If the user wants local emulation instead, use `npm run dev` (no party).
