---
name: forge-connect
description: Install and connect the Forge MCP server (one-click install), verify auth, configure session, and select your project.
---

# Forge Connect

Set up the **live** Forge MCP connection (separate from this Cursor plugin) and select your active project.

This plugin ships hooks, skills, and commands only — **MCP is configured in user or project Cursor settings**, not bundled with the plugin.

## Step 0 — Discover Forge MCP servers

Before any Forge tool call, find which MCP server is connected. Check **both** config scopes and merge results:

| Scope | Config file |
|-------|-------------|
| **User / global** | `~/.cursor/mcp.json` |
| **Project** | `.cursor/mcp.json` in the workspace root (if present) |

Run (or equivalent):

```bash
for f in "$HOME/.cursor/mcp.json" ".cursor/mcp.json"; do
  [ -f "$f" ] && echo "=== $f ===" && jq -r '.mcpServers // {} | to_entries[] | "\(.key)\t\(.value.url // "")"' "$f" 2>/dev/null
done
```

Collect server names that match **any** of:
- name is `user-forge` or `forge`
- name contains `forge` (case-insensitive)
- `url` contains `softwareforge.ai` or ends with `/api/mcp`

Also add any **enabled Forge MCP servers** visible in this Cursor session (e.g. under **Settings → Tools & MCP**, or MCP tool descriptors whose server name/id contains `forge`).

**Try order** (dedupe, first match wins):
1. `user-forge` — Forge **Install in IDE → Cursor** (most common)
2. `forge` — manual `~/.cursor/mcp.json`
3. Any other Forge servers from user config, then project config
4. Any remaining Forge servers from the session tool list

Record the server that succeeds as **`active_forge_mcp`** — use it for all Forge tools this session (`mcp__<active_forge_mcp>__<tool>`).

## Step 1 — Test connection

Call **`list_my_projects`** on each candidate server in try order until one succeeds.

| Result | Action |
|--------|--------|
| Returns project list | Note **`active_forge_mcp`**; skip to Step 3 |
| Tool not found on all candidates | Go to Step 2 |
| 401 / auth error | Go to Step 2 |

**Never** infer connection status from UI alone — the tool call is the only truth.

## Step 2 — Guide MCP install (stop and wait)

Do **not** call Forge tools until MCP is connected. Print this to the user:

---

**Forge MCP is not connected yet.** Connect it once using Forge one-click install:

1. Open [https://app.softwareforge.ai](https://app.softwareforge.ai) and sign in.
2. Go to **Connect IDE** using any of:
   - **Application Context** → **Connect IDE** tab
   - **Project Settings** → **Connect IDE**
   - **User Settings** (avatar menu) → **API Tokens**
3. Click **Install in IDE** → choose **Cursor**.
   - Forge creates a `forge_...` API token and opens Cursor automatically.
   - Accept the MCP install prompt in Cursor.
4. Confirm **Settings → Tools & MCP** shows a Forge server connected (green) — usually **`user-forge`**.

**Alternative (same tab):** **Create an API Token** → copy token → click **Install in Cursor** under **One-Click Install**.

**Manual fallback — user/global** (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "forge": {
      "type": "streamable-http",
      "url": "https://app.softwareforge.ai/api/mcp",
      "headers": {
        "Authorization": "Bearer forge_..."
      }
    }
  }
}
```

**Manual fallback — project-only** (`.cursor/mcp.json` in repo root): same JSON shape; use when a team pins Forge MCP per project.

After installing, **reload Cursor** (Developer: Reload Window) if tools still do not appear.

Reply **"done"** or run **`/forge-connect`** again when **Settings → Tools & MCP** shows a Forge server green.

---

Wait for the user to confirm before continuing.

## Step 3 — Configure session hooks

Call `configure_repo` on **`active_forge_mcp`** with:

```json
{ "ide": "cursor", "hooks_already_present": true }
```

Use this when the Forge marketplace plugin is installed (guard hooks ship with the plugin). This unlocks work order MCP tools for the session.

Use `{ "ide": "cursor" }` without `hooks_already_present` only if the plugin is **not** installed.

## Step 4 — Select project

1. Call `list_my_projects` on **`active_forge_mcp`** and show the list.
2. Ask the user which project to use.
3. Call `set_project` with the chosen project ID.

## Step 5 — Confirm ready

Call `list_linked_repos` and report:

- MCP server: **`active_forge_mcp`**
- MCP connected: yes
- Session configured: yes
- Active project: name + ID
- Linked repos: list or "none — link repos in Forge"

Suggest **`/work`**, **`/start-work`**, **`/forge-context`**, or **`/forge-orders`** as the next step.
