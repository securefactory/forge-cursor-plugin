---
name: forge-status
description: Validate Forge MCP connection and print a readiness status report — includes install steps if disconnected.
---

# Forge Status

Validate the **live** Forge MCP connection and print a status report.

This plugin does **not** bundle MCP. Forge connects via **user/global** (`~/.cursor/mcp.json`) and/or **project** (`.cursor/mcp.json`) config — discover both before testing.

## Critical rule — tool call is the only truth

**Never** mark MCP connected or disconnected based on:
- **Settings → Plugins** (plugin hooks/skills only — no MCP credentials)
- A red/errored row in **Settings → Tools & MCP** without trying a tool call
- Assuming tools must be named `mcp__forge__*` when they may be `mcp__user-forge__*`

**Always** discover servers from config + session, then **call `list_my_projects`** until one succeeds.

## Discover Forge MCP servers

Check **both** scopes and merge server names:

| Scope | Config file | Typical server name |
|-------|-------------|---------------------|
| User / global | `~/.cursor/mcp.json` | `user-forge` (one-click) or `forge` (manual) |
| Project | `.cursor/mcp.json` (workspace root) | team-defined name, often `forge` |

```bash
for f in "$HOME/.cursor/mcp.json" ".cursor/mcp.json"; do
  [ -f "$f" ] && echo "=== $f ===" && jq -r '.mcpServers // {} | to_entries[] | "\(.key)\t\(.value.url // "")"' "$f" 2>/dev/null
done
```

Include a server if:
- name is `user-forge`, `forge`, or contains `forge`, OR
- `url` contains `softwareforge.ai` or `/api/mcp`

Also include enabled Forge MCP servers visible in this session (MCP tool list / **Settings → Tools & MCP**).

**Try order:** `user-forge` → `forge` → other user-config servers → project-config servers → session-only servers.

First server where **`list_my_projects`** succeeds = **`active_forge_mcp`**.

## Validation sequence

Run these checks in order. Record pass/fail for each.

### 1. MCP tool availability

Call **`list_my_projects`** on each candidate in try order.

| Result | Status | Meaning |
|--------|--------|---------|
| Returns project list | **pass** | Live Forge MCP connected and authenticated |
| Tool not found on all candidates | **fail** | No Forge MCP in user/project config or session |
| 401 / unauthorized | **fail** | Token missing, invalid, or expired |

If **fail**, skip remaining checks. Print install steps (see below) and the status report with overall **Not ready**.

### 2. Session hooks gate (only if Step 1 passed)

Try `get_work_order_stats` or `list_work_orders` on **`active_forge_mcp`**.

| Result | Status |
|--------|--------|
| Returns data | **pass** — session configured |
| Error mentioning `configure_repo` | **fail** — run `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` then re-check |

Do not call `configure_repo` automatically unless the user asks — report **needed** in the status table.

### 3. Active project (only if Step 1 passed)

From `list_my_projects` response, read `current_project` if present; otherwise call `get_project_state` on **`active_forge_mcp`**.

| Result | Status |
|--------|--------|
| Project name/ID available | **pass** |
| No project set | **warn** — user should run `/forge-connect` to select a project |

## If MCP validation failed — install steps

Print this and stop further validation:

---

**Forge MCP is not connected.**

1. [https://app.softwareforge.ai](https://app.softwareforge.ai) → **Install in IDE** → **Cursor**
   - Application Context → **Connect IDE**, **Project Settings** → **Connect IDE**, or **User Settings** → **API Tokens**
2. Accept the MCP install prompt in Cursor (writes to **`~/.cursor/mcp.json`**)
3. Confirm **Settings → Tools & MCP** shows a Forge server **green** (`user-forge` or `forge`)
4. Run **`/forge-status`** again

**Project-scoped alternative:** add `.cursor/mcp.json` in the repo with the same Forge server JSON (see `/forge-connect`).

---

## Status report (always print this)

After validation, print a concise report like this:

```
Forge Status
────────────
MCP connection      ✅ Connected  |  ❌ Not connected  |  ⚠️ Auth failed
MCP server used     user-forge  (active_forge_mcp — whichever answered list_my_projects)
Config sources      user: ~/.cursor/mcp.json  |  project: .cursor/mcp.json (present/absent)
API endpoint        https://app.softwareforge.ai/api/mcp
Projects accessible ✅ N projects  |  ❌
Session configured  ✅ / ⚠️ Needed / ❓ Unknown
Active project      <name + ref or "not set">
Plugin (workflow)   ✅ Installed (marketplace) / ❓ Check Settings → Plugins → Forge

Overall             ✅ Ready for /work  |  ⚠️ Almost ready  |  ❌ Not ready

Next step           /work  |  /forge-context  |  /forge-connect  |  Install MCP (steps above)
```

Use plain text if emoji are not appropriate. **Only mark Connected if `list_my_projects` succeeded** on a discovered server.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| No Forge server in user or project mcp.json | Forge → **Install in IDE → Cursor** (user/global) |
| Project mcp.json exists but tools missing | Reload Cursor; confirm server URL is `https://app.softwareforge.ai/api/mcp` |
| `mcp__forge__*` not found but `user-forge` tools exist | Use **user-forge** — connection is fine; prefix follows server name |
| User says connected but tool fails | Re-run discovery on both mcp.json files; call `list_my_projects` — do not trust UI alone |
| Work orders blocked after MCP ok | Run `configure_repo` with `hooks_already_present: true` on **active_forge_mcp** |
| Token expired | Forge → **Connect IDE** → new token → reinstall in Cursor |
