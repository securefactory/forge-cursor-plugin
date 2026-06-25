---
name: forge-connect
description: Install and connect the Forge MCP server (one-click deeplink), verify auth, configure session, and select your project.
---

# Forge Connect

Set up the live Forge MCP connection and select your active project.

## Important — plugin vs live MCP

The Forge plugin declares MCP metadata in `mcp.json`. That is **not** enough to call tools.

The user must have a **live** MCP server named **`forge`** under **Settings → Tools & MCP** (green/connected). If only **Settings → Plugins → MCPs** shows Forge but tools fail, MCP is not connected yet.

## Step 1 — Test connection

Try calling `list_my_projects`.

- **Success** → skip to Step 3.
- **Tool not found** (`mcp__forge__*`) → MCP server missing or wrong name. Go to Step 2.
- **401 / auth error** → token missing or expired. Go to Step 2.

## Step 2 — Guide MCP install (stop and wait)

Do **not** call Forge tools until MCP is connected. Print this to the user:

---

**Forge MCP is not connected yet.** Connect it once using Forge one-click install:

1. Open [https://app.softwareforge.ai](https://app.softwareforge.ai) and sign in.
2. Go to **Connect IDE** using either:
   - **Projects** page → scroll to **Connect IDE**
   - Open a project → **Connect IDE** tab
3. Click **Install in IDE** → choose **Cursor**.
   - Forge creates a `forge_...` API token and opens Cursor automatically.
   - Accept the MCP install prompt in Cursor.
4. Confirm **Settings → Tools & MCP** shows **`forge`** connected (green).

**Alternative (same tab):** **Create an API Token** → copy token → click **Install in Cursor** under **One-Click Install**.

**Manual fallback:** add to `~/.cursor/mcp.json` — server name must be **`forge`**:

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

After installing, **reload Cursor** (Developer: Reload Window) if tools still do not appear.

Reply **"done"** or run **`/forge-connect`** again when **Settings → Tools & MCP** shows `forge` connected.

---

Wait for the user to confirm before continuing.

## Step 3 — Configure session hooks

Call `configure_repo` with:

```json
{ "ide": "cursor", "hooks_already_present": true }
```

Use this when the Forge marketplace plugin is installed (guard hooks ship with the plugin). This unlocks work order MCP tools for the session.

Use `{ "ide": "cursor" }` without `hooks_already_present` only if the plugin is **not** installed.

## Step 4 — Select project

1. Call `list_my_projects` and show the list.
2. Ask the user which project to use.
3. Call `set_project` with the chosen project ID.

## Step 5 — Confirm ready

Call `list_linked_repos` and report:

- MCP connected: yes
- Session configured: yes
- Active project: name + ID
- Linked repos: list or "none — link repos in Forge"

Suggest **`/work`** or **`/start-work`** as the next step.
