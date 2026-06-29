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

3. **Pick work order**: Call `get_next_work_order` for the highest-priority backlog task (auto-transitions to next stage). Call `get_work_order` for full details and RTM traceability. Confirm with the user.

4. **Load project context**: Call `get_project_state`, then load artifacts as needed:
   - `get_artifact` type `intent`, `prd`, `architecture`, `rtm`
   - `search_artifacts` if the user asks about a specific requirement by keyword
   - `list_ux_references` if design refs are relevant

5. **List repos**: Call `list_linked_repos` to identify which repos to work in. Ensure they're cloned.

6. **Implement**: Help the user write code according to the work order requirements and acceptance criteria.

7. **Test**: Run relevant tests to verify the implementation.

8. **RTM drift check**: Call `get_artifact` type `rtm`. Compare implementation against RTM rows linked to this work order. Prepare `rtm_drift_summary` for `update_work_order`.

9. **Prepare commit**: Call `prepare_commit` with `work_order_id` to generate the commit message. Fix any scope issues flagged.

10. **Commit**: Commit using the `[WO-...]` message from `prepare_commit`.

11. **Report dev activity**: Call `update_work_order` with `work_order_id` and full dev-activity fields (`commit_summary`, `test_summary`, `rtm_drift_summary`, repo/branch/commit stats, test counts).

12. **Push**: Push the branch to the remote.

13. **Create PR**: Call `create_pull_request` with `work_order_id`, `branch_name`, `changes_summary`, and repo details. Run the returned CLI command (e.g. `gh pr create`) or create the PR manually and pass `pr_url` / `pr_number`.

14. **Sync activity**: Call `sync_dev_activity` so Forge has the latest commit/PR data.

15. **Complete**: Call `complete_work_order` after the PR is merged and synced. If no merged PR exists, warn the user and only proceed with `user_confirmed_complete_without_merged_pr: true` after explicit confirmation.

## Comments and clarifications (optional)

- WO thread: `get_work_order_comments` → `comment_on_work_order` (param `wo_id`, e.g. `WO-001`)
- Team Q&A: `ask_question` → `get_clarifications`

## Important

- `get_next_work_order` auto-transitions; use `get_workflow_stages` + `transition_work_order` only for manual stage changes.
- Always validate scope with `prepare_commit` before committing.
- Call `update_work_order` after commit — do not skip straight to PR creation.
- Link all PRs to the work order for traceability.
- Only commit to linked repositories.
