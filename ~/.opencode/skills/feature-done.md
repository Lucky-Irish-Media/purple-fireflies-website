---
name: feature-done
description: Complete a feature branch by switching to main, pulling, and deleting the feature branch locally and remotely
---

# Feature Done Workflow

When the user indicates a feature is done (e.g., "feature is done", "done with this feature", "complete the feature"), execute the following workflow:

1. Get the current branch name:
   ```bash
   git branch --show-current
   ```

2. If on a feature branch (not main/master), proceed with:
   - Switch to main branch: `git checkout main` or `git switch main`
   - Pull latest changes: `git pull origin main`
   - Delete the local feature branch: `git branch -d <feature-branch>`
   - Delete the remote feature branch: `git push origin --delete <feature-branch>`

3. If already on main, inform the user they're already on main.

4. If the branch deletion fails (e.g., unmerged changes), warn the user and ask if they want to force delete with `-D` flag.

Important notes:
- Only delete branches that are feature branches, not main/master
- Always confirm the branch name before deleting
- Use `--delete` for remote branch deletion to avoid accidental deletes
