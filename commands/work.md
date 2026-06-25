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

3. Call `get_next_work_order` to pick the highest-priority unstarted task.

4. Display the work order with:
   - Title and description
   - Priority and status
   - Acceptance criteria (if any)
   - Linked repositories

5. Ask the user if they want to start working on this task. If yes, call `transition_work_order` to move it to "In Progress".

6. Call `list_linked_repos` and remind the user to ensure all repos are cloned locally.
