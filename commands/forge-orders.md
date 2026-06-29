---
name: forge-orders
description: Browse Forge work orders — stats, filtered list, task details, comments, and clarifications.
---

# Forge Orders

Browse and inspect work orders without starting full implementation.

## MCP prerequisite

Try `list_my_projects`. If unavailable or auth fails, **stop** and tell the user to run **`/forge-connect`**.

1. Call `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` if not done this session.
2. Ensure a project is set (`set_project`).

## Steps

1. Call `get_work_order_stats` — show status distribution.
2. Call `get_workflow_stages` — show valid status keys for filtering.
3. Call `list_work_orders`:
   - Apply `status` and/or `priority` filters if the user specified them
   - Otherwise show all accessible work orders (assigned to user, or all if admin)
4. If the user named a specific work order, call `get_work_order` with `work_order_id` (UUID).
5. Optional — comments and clarifications:
   - WO thread: `get_work_order_comments` with `wo_id` (e.g. `WO-001`, not UUID)
   - Post comment: `comment_on_work_order` with `wo_id`, `content`, optional `trigger_ai: false`
   - Team Q&A: `get_clarifications` or `ask_question`

## Output

- Stats summary table
- Filtered work order list (title, status, priority, id)
- Full details + RTM traceability when a specific WO was requested
- Comment thread summary if requested

## Next steps

- Start work on a task → **`/work`** or **`/start-work`**
- Load requirements → **`/forge-context`** or **`/forge-artifacts`**
- Sync after commits → **`/forge-sync`**
