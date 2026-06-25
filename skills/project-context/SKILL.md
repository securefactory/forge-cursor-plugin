---
name: project-context
description: >-
  Set up and query Forge project context — select projects, list linked repos,
  manage artifacts, and configure repositories. Use when the user asks about
  project setup, linked repositories, artifacts, UX references, or wants to
  switch between projects.
---

# Project Context

## When to Use

Activate this skill when the user:
- Asks "which project am I on?" or wants to switch projects
- Needs to list or link repositories
- Asks about project artifacts (PRD, BRD, architecture docs)
- Wants to search across project documentation
- Needs UX/design references

## Tools

| Tool | Purpose |
|------|---------|
| `set_project` | Set active project for this session |
| `list_my_projects` | List all accessible projects |
| `list_linked_repos` | Repos linked to the current project |
| `link_repo` | Link a new repository |
| `get_project_state` | Current project state and configuration |
| `configure_repo` | Register session hooks gate; optionally install per-repo hook files |
| `get_artifact` | Retrieve a project artifact |
| `list_ux_references` | List UX/design references |
| `search_artifacts` | Search across all project artifacts |

## Workflow

1. Call `configure_repo` once per MCP session before work order operations:
   - **Marketplace plugin installed**: `{ "ide": "cursor", "hooks_already_present": true }`
   - **No plugin / fresh clone**: `{ "ide": "cursor" }` — write returned hook files to the workspace
2. Call `set_project` at the start of a session if not already set.
3. After setting the project, call `list_linked_repos` to know which repos to work with.
4. Use `get_artifact` to retrieve requirements or architecture docs for context.
5. When the user asks about design references, use `list_ux_references`.

## Important

- All subsequent tool calls use the active project unless overridden.
- Linked repos are the ONLY repos that should be used for commits and PRs.
- Clone all linked repos before making code changes.
