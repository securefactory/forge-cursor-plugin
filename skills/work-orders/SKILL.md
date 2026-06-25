---
name: work-orders
description: >-
  Manage Forge work orders — list, pick, update, transition, and complete
  development tasks. Use when the user asks about their current task, next work
  item, wants to update progress, create PRs, prepare commits, or manage
  workflow stages.
---

# Work Orders

## When to Use

Activate this skill when the user:
- Asks "what should I work on next?" or "what's my current task?"
- Wants to update a work order status or add notes
- Is ready to commit and wants a formatted commit message
- Wants to create a PR linked to their work order
- Asks about workflow stages or work order statistics

## Tools

| Tool | Purpose |
|------|---------|
| `list_work_orders` | List tasks (filter by status, assignee) |
| `get_work_order` | Full details of a specific task |
| `get_next_work_order` | Pick highest-priority unstarted task |
| `update_work_order` | Update fields (status, estimate, notes) |
| `transition_work_order` | Move through workflow stages |
| `complete_work_order` | Mark done (requires synced merged PR, or `user_confirmed_complete_without_merged_pr: true`) |
| `get_workflow_stages` | Available stages for the project |
| `get_work_order_stats` | Summary statistics |
| `prepare_commit` | Generate `[WO-...]` commit message (requires `work_order_id`) |
| `create_pull_request` | Generate PR title/body, record activity, return CLI command — does not open the PR on the host for you |
| `ask_question` | Ask clarifying question about a work order |
| `get_clarifications` | Get pending clarifications |
| `comment_on_work_order` | Add a comment |
| `reply_to_work_order_comment` | Reply to existing comment |
| `get_work_order_comments` | List all comments |

## Workflow

0. Call `configure_repo` once per session before any work order tool:
   - **Marketplace plugin installed**: `{ "ide": "cursor", "hooks_already_present": true }`
   - **No plugin**: `{ "ide": "cursor" }` — write returned hook files to the workspace
1. Ensure a project is set (`set_project`) before querying work orders.
2. Use `get_next_work_order` to pick a task, or `list_work_orders` to browse.
3. Before committing, call `prepare_commit` with `work_order_id` (and optional `summary`) to get the `[WO-...]` message; plugin hooks enforce the pre-commit checklist.
4. After pushing, call `create_pull_request` with `work_order_id`, `branch_name`, `changes_summary`, and repo details — it generates the PR title/body, records activity, and returns a provider CLI command (e.g. `gh pr create`); run that command or create the PR manually, then pass `pr_url` / `pr_number` if already created.
5. Sync activity with `sync_dev_activity`, then call `complete_work_order` — requires a synced merged PR unless the user explicitly confirms `user_confirmed_complete_without_merged_pr: true`.
