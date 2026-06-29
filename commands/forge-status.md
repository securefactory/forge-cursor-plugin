---
name: forge-status
description: Validate Forge MCP connection and print a readiness status report — includes install steps if disconnected.
---

# Forge Status

Validate the **live** Forge MCP connection and print a status report.

## Critical rule — tool call is the only truth

**Never** mark MCP connected or disconnected based on:
- **Settings → Plugins → MCPs** (bundled plugin metadata only)
- A server showing **errored** under **Settings → Tools & MCP** for the **plugin** entry (`plugin-forge-forge`)
- Missing `mcp__forge__*` if tools exist under another server name

**Always** decide pass/fail by **calling `list_my_projects`** on a Forge MCP server that exposes Forge tools.

Cursor may register the working server under different names:

| UI / internal name | Typical source |
|--------------------|----------------|
| `user-forge` | Forge **Install in IDE → Cursor** (one-click; `~/.cursor/mcp.json`) — **most common when connected** |
| `forge` | Manual `~/.cursor/mcp.json` or env-based install |
| `plugin-forge-forge` | Plugin-bundled `mcp.json` using `${env:FORGE_MCP_URL}` / `${env:FORGE_TOKEN}` |

It is **normal** for `plugin-forge-forge` to be **errored** while `user-forge` is **green** — the plugin entry needs env vars; one-click install does not use that path.

### How to find the live server

1. Look for any MCP server that exposes Forge tools (`list_my_projects`, `get_artifact`, `sync_dev_activity`, etc.).
2. Call **`list_my_projects`** on the first available Forge server.
3. Record the **actual server name** that succeeded (e.g. `user-forge`) in the status report.

Do **not** stop after reading a server STATUS file or seeing `plugin-forge-forge` errored — try the tool call on `user-forge` or `forge` before reporting failure.

## Validation sequence

Run these checks in order. Record pass/fail for each.

### 1. MCP tool availability

Call **`list_my_projects`** (try `user-forge`, then `forge`, then any server listing Forge tools).

| Result | Status | Meaning |
|--------|--------|---------|
| Returns project list | **pass** | Live Forge MCP connected and authenticated |
| Tool not found on all Forge servers | **fail** | No working Forge MCP under **Settings → Tools & MCP** |
| 401 / unauthorized | **fail** | Token missing, invalid, or expired |

If **fail**, skip remaining checks. Print install steps (see below) and the status report with overall **Not ready**.

If **pass** but `plugin-forge-forge` still shows errored, add a note: *Plugin MCP entry errored (env vars unset) — ignore if `user-forge` works.*

### 2. Session hooks gate (only if Step 1 passed)

Try calling `get_work_order_stats` or `list_work_orders` on the **same server that worked in Step 1**.

| Result | Status |
|--------|--------|
| Returns data | **pass** — session configured |
| Error mentioning `configure_repo` | **fail** — run `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` then re-check |

Do not call `configure_repo` automatically unless the user asks — report **needed** in the status table.

### 3. Active project (only if Step 1 passed)

From `list_my_projects` response, read `current_project` if present; otherwise call `get_project_state`.

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
2. Accept the MCP install prompt in Cursor
3. Confirm **Settings → Tools & MCP** shows a Forge server **green** (`user-forge` or `forge`)
4. Run **`/forge-status`** again

If only **plugin-forge-forge** is errored but **user-forge** is green, you are connected — re-run status; the agent must call tools, not read plugin error state.

---

## Status report (always print this)

After validation, print a concise report like this:

```
Forge Status
────────────
MCP connection      ✅ Connected  |  ❌ Not connected  |  ⚠️ Auth failed
MCP server used     user-forge  (or forge — whichever answered list_my_projects)
Plugin MCP entry    ⚠️ errored (env vars) / ✅ ok / n/a  — optional note only
API endpoint        https://app.softwareforge.ai/api/mcp
Projects accessible ✅ N projects  |  ❌
Session configured  ✅ / ⚠️ Needed / ❓ Unknown
Active project      <name + ref or "not set">
Plugin hooks        ✅ Installed (marketplace) / ❓ Check Settings → Hooks

Overall             ✅ Ready for /work  |  ⚠️ Almost ready  |  ❌ Not ready

Next step           /work  |  /forge-context  |  /forge-connect  |  Install MCP (steps above)
```

Use plain text if emoji are not appropriate. **Only mark Connected if `list_my_projects` succeeded** — not because the user said "it's working" and not because the plugin page lists MCP.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Plugin MCP errored, user says connected | Call `list_my_projects` on **user-forge** — ignore plugin-forge-forge error if tool succeeds |
| Plugin page shows Forge MCP but tools fail | Connect under **Settings → Tools & MCP**, not the plugin metadata page |
| `mcp__forge__*` not found but `user-forge` tools exist | Use **user-forge** — connection is fine; tool prefix differs by server name |
| Work orders blocked after MCP ok | Run `configure_repo` with `hooks_already_present: true` |
| plugin-forge-forge errored, no user-forge | Forge → **Install in IDE → Cursor**, or set `FORGE_MCP_URL` + `FORGE_TOKEN` and reload |
| Token expired | Forge → **Connect IDE** → new token → reinstall in Cursor |
