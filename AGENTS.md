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
<!-- END:deployment-rules -->

<!-- BEGIN:skills -->
# Local Skills

- At the START of every session, run `ls ~/.opencode/skills/` to check for skill files
- READ every skill file found there and be ready to execute its workflow
- The `skill` tool may report "no skills available" even when files exist — ALWAYS verify by listing the directory directly
- When a user says a task is done (or similar phrasing), re-check this directory for any post-feature workflow
<!-- END:skills -->
