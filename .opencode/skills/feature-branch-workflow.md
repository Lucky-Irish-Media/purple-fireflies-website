# Feature Branch Workflow Skill

## Description
Complete feature branch workflow: create branch, implement feature, build, commit, push, create PR, and clean up after merge.

## When to use
Use this skill when the user wants to:
- Start a new feature with proper branching
- Complete and merge a feature branch
- Follow a structured git workflow for features

## Workflow Steps

### 1. Create Feature Branch
Ask the user what feature they're working on, then create a branch:
```bash
git checkout -b feature/<feature-name>
```

### 2. Implement the Feature
- Make necessary code changes
- Add new files, components, pages as needed
- Follow existing code conventions

### 3. Verify Build
Always run build to verify changes compile:
```bash
npm run build
```

### 4. Commit Changes
```bash
git add <files>
git commit -m "<type>: <description>"
```

Commit message guidelines:
- Use imperative mood ("Add" not "Added")
- Keep first line under 50 characters if possible
- Types: Add, Update, Fix, Refactor, Docs

### 5. Push Feature Branch
```bash
git push -u origin feature/<feature-name>
```

### 6. Create Pull Request
If `gh` CLI is authenticated:
```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
- <bullet points of changes>

## Changes
- <files changed>

## Notes
- <any relevant notes>
EOF
)"
```

If `gh` CLI is not authenticated, provide the URL:
```
https://github.com/<owner>/<repo>/pull/new/feature/<feature-name>
```

### 7. After PR is Merged
Once the PR is merged and remote branch deleted:

```bash
# Switch to main
git checkout main

# Delete local branch
git branch -d feature/<feature-name>

# Pull latest changes
git pull origin main

# Clean up stale remote tracking references
git remote prune origin
```

## Important Notes

### Deployment Rules
- NEVER manually deploy using `npm run cf:deploy` or `wrangler deploy`
- ALL deployments MUST go through Cloudflare Workers Builds connected to GitHub
- Only push code to GitHub; Cloudflare will automatically build and deploy from `main` branch

### Next.js Considerations
- This project uses Next.js 16+ with breaking changes from training data
- Read `node_modules/next/dist/docs/` before writing any code
- Heed deprecation notices

## Example Session

**User**: "let's create a feature branch for adding a navbar and donate page"

**Assistant**:
1. Creates branch: `git checkout -b feature/navbar-donate-page`
2. Implements navbar component in `components/Navbar.tsx`
3. Adds donate page at `app/donate/page.tsx`
4. Updates layout to include navbar
5. Runs `npm run build` to verify
6. Commits: `git commit -m "Add navbar and donate page with QR codes"`
7. Pushes: `git push -u origin feature/navbar-donate-page`
8. Creates PR with summary of changes

**After PR merged**:

**User**: "the PR has been merged, delete the local branch"

**Assistant**:
1. `git checkout main`
2. `git branch -d feature/navbar-donate-page`
3. `git pull origin main`
4. `git remote prune origin`
5. Confirms cleanup is complete
