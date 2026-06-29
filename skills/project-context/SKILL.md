---
name: project-context
description: >-
  Set up and query Forge project context — select projects, list linked repos,
  manage artifacts, and configure repositories. Use when the user asks about
  project setup, linked repositories, artifacts, UX references, journey state,
  or wants to switch between projects.
---

# Project Context

All tools are MCP tools on the **`forge`** server (`mcp__forge__*`).

## When to Use

Activate this skill when the user:
- Asks "which project am I on?" or wants to switch projects
- Needs to list or link repositories
- Asks about project artifacts (PRD, BRD, architecture, RTM, work orders breakdown)
- Wants to search across project documentation
- Needs UX/design references or journey state
- Must load requirements before implementing a work order

## Tools

| Tool | Purpose |
|------|---------|
| `set_project` | Set active project for this MCP session |
| `list_my_projects` | List all accessible projects |
| `list_linked_repos` | Repos linked to the current project |
| `link_repo` | Link a new repository |
| `get_project_state` | Journey step, ref code, and project metadata |
| `configure_repo` | Register session hooks gate; optionally install per-repo hook files |
| `get_artifact` | Retrieve the **latest** version of a journey artifact |
| `list_ux_references` | UX/design reference images with download URLs |
| `search_artifacts` | Full-text search across all project artifacts |

## MCP Resources (read-only)

When a project is set, these URIs are also available as MCP resources:

- `forge://docs/introduction` — Forge overview
- `forge://docs/tools` — available MCP tools list
- `forge://project/{projectId}/intent` — latest intent profile
- `forge://project/{projectId}/prd` — latest PRD
- `forge://project/{projectId}/brd` — latest BRD
- `forge://project/{projectId}/architecture` — latest architecture doc

Prefer calling **`get_artifact`** in agent workflows; resources are useful for direct reads.

## `get_artifact` Types

The `type` parameter accepts:

| `type` value | Document |
|--------------|----------|
| `intent` | Intent profile / problem statement |
| `prd` | Product requirements document |
| `brd` | Business requirements document |
| `architecture` | Architecture options and decisions |
| `work_orders` | Full task breakdown (epics/stories) |
| `rtm` | Requirements traceability matrix |

Returns the **latest** version only. Use `search_artifacts` to find content by keyword across artifacts.

## Parameters

### `link_repo`
Provide either:
- `git_url` — HTTPS clone URL (public repos), or
- `repo_full_name` (`owner/repo`) + `connector_id` (connector-based repos)

Optional: `default_branch` (defaults to `main`).

### `search_artifacts`
- `query` — search string (minimum 2 characters)

### `get_project_state`
Returns `current_step`, `ref_code`, `metadata`, and `project_name` for the active project.

## Pre-Implementation Context Load

Before coding on a work order:

1. `get_project_state` — understand journey step and ref code
2. `get_artifact` type `intent` — goals and scope
3. `get_artifact` type `prd` — product requirements
4. `get_artifact` type `architecture` — technical decisions
5. `get_artifact` type `rtm` — traceability matrix (required for drift check before commit)
6. `search_artifacts` — when the user asks about a specific requirement by keyword
7. `list_ux_references` — design refs; entries include `download_url` paths

## RTM Drift Check (before commit)

1. Call `get_artifact` with `type: "rtm"`
2. Find RTM rows linked to the current work order (also returned by `get_work_order` as `traceability`)
3. For each row, compare implementation against linked PRD sections and architecture components
4. Record results in `update_work_order` field `rtm_drift_summary` — per Req ID: artifacts compared, drift yes/no, details, resolution. If clean: `No drift detected — all RTM rows aligned with artifacts.`

## Workflow

1. Call `configure_repo` once per MCP session before work order operations:
   - **Marketplace plugin installed**: `{ "ide": "cursor", "hooks_already_present": true }`
   - **No plugin / fresh clone**: `{ "ide": "cursor" }` — write returned hook files to the workspace
2. Call `set_project` at the start of a session if not already set.
3. After setting the project, call `list_linked_repos` to know which repos to work with.
4. Load artifacts with `get_artifact` before implementing scoped work.
5. When the user asks about design references, use `list_ux_references`.

## Important

- All subsequent tool calls use the active project unless `project_id` is overridden.
- Linked repos are the ONLY repos that should be used for commits and PRs.
- Clone all linked repos before making code changes.
