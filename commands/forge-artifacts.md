---
name: forge-artifacts
description: Fetch or search Forge journey artifacts — PRD, BRD, architecture, RTM, work orders breakdown, or keyword search.
---

# Forge Artifacts

Retrieve or search project artifacts from Forge.

## MCP prerequisite

Try `list_my_projects`. If unavailable or auth fails, **stop** and tell the user to run **`/forge-connect`**.

Ensure a project is set (`set_project`).

## Usage

If the user did not specify what they want, ask:
- **Type** — `intent`, `prd`, `brd`, `architecture`, `work_orders`, or `rtm`
- **Or search** — keywords to run `search_artifacts`

## Steps

### Fetch by type

Call `get_artifact` with the requested `type`:

| Type | Document |
|------|----------|
| `intent` | Intent profile |
| `prd` | Product requirements |
| `brd` | Business requirements |
| `architecture` | Architecture options |
| `work_orders` | Task breakdown |
| `rtm` | Requirements traceability matrix |

Return markdown content. Summarize long docs unless the user asked for the full document.

### Search

Call `search_artifacts` with `query` (min 2 characters). Show matching snippets and artifact types.

### UX references

If the user asks for design refs, call `list_ux_references` (includes download URLs).

## Note

`get_artifact` returns the **latest** version only. There is no version picker in MCP today.
