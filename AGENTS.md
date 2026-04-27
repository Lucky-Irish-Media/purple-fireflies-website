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
