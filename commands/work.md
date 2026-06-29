---
name: work
description: Show your current work order or pick the next one — quickly see what to work on.
---

# Work

Show the current work order or pick the next available task.

## Steps

0. **MCP prerequisite**: Try `list_my_projects`. If the tool is unavailable or returns auth errors, **stop immediately**. Tell the user to run **`/forge-connect`** — or use Forge **Install in IDE → Cursor** at [app.softwareforge.ai](https://app.softwareforge.ai), then confirm **`forge`** is green under **Settings → Tools & MCP**. Do not proceed until MCP works.

1. Call `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` if not already done this session (required before work order tools work).

2. Ensure a project is set. If not, call `list_my_projects` and ask the user to choose one, then call `set_project`.

3. **Pick or browse:**
   - Default: call `get_next_work_order` for the highest-priority backlog task (auto-transitions).
   - Browse: call `get_workflow_stages`, then `list_work_orders` with `status` / `priority` filters, then `get_work_order` with `work_order_id` (UUID).

4. Optionally call `get_work_order_stats` for a project summary.

5. Display the work order with:
   - Title and description
   - Priority and status
   - Acceptance criteria (if any)
   - RTM traceability (from `get_work_order` response when available)
   - Linked repositories

6. Offer context loading: `get_artifact` (`intent`, `prd`, `architecture`, `rtm`) or `get_work_order_comments` if the user wants discussion history.

7. Ask the user if they want to start working. If yes and the task is not already in progress:
   - If you used `get_next_work_order`, it may already be transitioned.
   - Otherwise call `get_workflow_stages`, then `transition_work_order` with the valid next `status`.

8. Call `list_linked_repos` and remind the user to ensure all repos are cloned locally.

9. Suggest **`/start-work`** for the full implement → commit → PR workflow.

## Clarifications and comments

- WO comments: `get_work_order_comments` with `wo_id` (e.g. `WO-001`)
- Post comment: `comment_on_work_order` with `wo_id`, `content`, optional `trigger_ai: false`
- Team Q&A: `ask_question` or `get_clarifications`
