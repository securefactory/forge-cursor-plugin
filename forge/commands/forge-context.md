---
name: forge-context
description: Load Forge project context — journey state, linked repos, and key journey artifacts (intent, PRD, architecture, RTM).
---

# Forge Context

Load project context before implementing work or answering requirements questions.

## MCP prerequisite

Try `list_my_projects`. If unavailable or auth fails, **stop** and tell the user to run **`/forge-connect`**.

1. Call `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` if not done this session.
2. Ensure a project is set; if not, call `list_my_projects`, let the user choose, then `set_project`.

## Steps

1. Call `get_project_state` — show journey step, ref code, project name.
2. Call `list_linked_repos` — list repos to clone/work in.
3. Load artifacts (latest versions):
   - `get_artifact` type `intent`
   - `get_artifact` type `prd`
   - `get_artifact` type `architecture`
   - `get_artifact` type `rtm` (summarize row count / key requirements; full doc if user asks)
4. If the user asked about a specific topic, also call `search_artifacts` with their keywords.

## Output

Present a concise briefing:
- Active project and journey step
- Linked repos
- One-paragraph summary per artifact loaded (not full dumps unless requested)
- Suggested next step: **`/work`**, **`/start-work`**, or **`/forge-artifacts`** for a specific doc type

## Optional

- `list_ux_references` if the user mentions design or UI
- `link_repo` only if the user explicitly asks to link a new repository
