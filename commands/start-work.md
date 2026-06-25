---
name: start-work
description: Full end-to-end workflow — select project, pick work order, implement, test, commit, push, create PR, and update status.
---

# Start Work

Complete end-to-end development workflow from task selection to PR creation.

## Steps

0. **MCP prerequisite**: Try `list_my_projects`. If the tool is unavailable or returns auth errors, **stop immediately**. Tell the user to run **`/forge-connect`** — Forge **Install in IDE → Cursor** (Application Context, Project Settings, or User Settings → API Tokens). Do not start the workflow until **`forge`** is connected under **Settings → Tools & MCP**.

1. **Configure hooks**: Call `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` (marketplace plugin hooks are already active).

2. **Select project**: Call `list_my_projects`, let the user choose, then `set_project`.

3. **Pick work order**: Call `get_next_work_order` for the highest-priority task. Show details and confirm with the user.

4. **Transition to In Progress**: Call `transition_work_order` to start the task.

5. **List repos**: Call `list_linked_repos` to identify which repos to work in. Ensure they're cloned.

6. **Implement**: Help the user write code according to the work order requirements and acceptance criteria.

7. **Test**: Run relevant tests to verify the implementation.

8. **Prepare commit**: Call `prepare_commit` to generate the commit message. Fix any scope issues flagged.

9. **Commit and push**: Commit using the `[WO-...]` message from `prepare_commit`, then push.

10. **Create PR**: Call `create_pull_request` with work order and repo details. Run the returned CLI command (e.g. `gh pr create`) or create the PR manually and pass `pr_url` / `pr_number` if needed.

11. **Sync activity**: Call `sync_dev_activity` so Forge has the merged PR data.

12. **Complete**: Call `complete_work_order` after the PR is merged and synced. If no merged PR exists, warn the user and only proceed with `user_confirmed_complete_without_merged_pr: true` after explicit confirmation.

## Important

- Always validate scope with `prepare_commit` before committing.
- Link all PRs to the work order for traceability.
- Only commit to linked repositories.
