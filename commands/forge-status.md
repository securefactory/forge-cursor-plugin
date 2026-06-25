---
name: forge-status
description: Validate Forge MCP connection and print a readiness status report — includes install steps if disconnected.
---

# Forge Status

Validate the live Forge MCP connection and print a status report. Use this anytime to check whether Forge is ready before `/work` or `/start-work`.

## Validation sequence

Run these checks in order. Record pass/fail for each.

### 1. MCP tool availability

Try calling `list_my_projects`.

| Result | Status | Meaning |
|--------|--------|---------|
| Returns project list | **pass** | Live `forge` MCP connected and authenticated |
| Tool not found | **fail** | No `forge` server under **Settings → Tools & MCP** (or wrong server name) |
| 401 / unauthorized | **fail** | Token missing, invalid, or expired |

If **fail**, skip remaining checks. Print install steps (see below) and the status report with overall **Not ready**.

**Common false positive:** Plugin page (**Settings → Plugins → MCPs**) shows Forge — that is bundled metadata only. Validation requires a successful MCP tool call.

### 2. Session hooks gate (only if Step 1 passed)

Try calling `get_work_order_stats` or `list_work_orders`.

| Result | Status |
|--------|--------|
| Returns data | **pass** — session configured |
| Error mentioning `configure_repo` | **fail** — run `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` then re-check |

Do not call `configure_repo` automatically unless the user asks — report **needed** in the status table.

### 3. Active project (only if Step 1 passed)

From `list_my_projects` response, note whether a project appears to be active, or call `get_project_state` if available.

| Result | Status |
|--------|--------|
| Project context available | **pass** |
| No project set | **warn** — user should run `/forge-connect` to select a project |

## If MCP validation failed — install steps

Print this and stop further validation:

---

**Forge MCP is not connected.**

1. [https://app.softwareforge.ai](https://app.softwareforge.ai) → **Connect IDE**
2. **Install in IDE** → **Cursor**
3. Confirm **Settings → Tools & MCP** → **`forge`** is green
4. Run **`/forge-status`** again

Server name must be **`forge`** (not `forge-refactory`). Re-install from Forge if unsure.

---

## Status report (always print this)

After validation, print a concise report like this:

```
Forge Status
────────────
MCP connection     ✅ Connected  |  ❌ Not connected  |  ⚠️ Auth failed
MCP server name    forge (required)
API endpoint       https://app.softwareforge.ai/api/mcp
Projects accessible ✅ / ❌
Session configured  ✅ / ⚠️ Needed / ❓ Unknown
Active project      <name or "not set">
Plugin hooks        ✅ Installed (marketplace) / ❓ Check Settings → Hooks

Overall             ✅ Ready for /work  |  ⚠️ Almost ready  |  ❌ Not ready

Next step           /work  |  /forge-connect  |  Install MCP (steps above)
```

Use plain text if emoji are not appropriate. Be factual — only mark **Connected** if `list_my_projects` succeeded.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Plugin MCP shows Forge but validation fails | Connect under **Settings → Tools & MCP**, not the plugin metadata page |
| `mcp__forge__*` not found | Forge → **Install in IDE → Cursor**, or rename server to `forge` in `~/.cursor/mcp.json` |
| Work orders blocked after MCP ok | Run `configure_repo` with `hooks_already_present: true` |
| Env vars not applied | `export FORGE_MCP_URL` + `FORGE_TOKEN`, launch Cursor from terminal |
| Installed but still failing | Developer: Reload Window; confirm URL is `https://app.softwareforge.ai/api/mcp` |
