---
name: forge-connect
description: Install and connect the Forge MCP server (one-click install), verify auth, configure session, and select your project.
---

# Forge Connect

Set up the live Forge MCP connection and select your active project.

## Important — plugin vs live MCP

The Forge plugin declares MCP metadata in `mcp.json` (often shown as **`plugin-forge-forge`**). That entry uses `${env:FORGE_MCP_URL}` and `${env:FORGE_TOKEN}` and is often **errored** even when Forge works.

The **live** connection is usually **`user-forge`** after Forge **Install in IDE → Cursor** (one-click), or **`forge`** if added manually to `~/.cursor/mcp.json`.

**Test connection by calling `list_my_projects`** — not by reading plugin MCP status or assuming server name must be `forge`.

If **Settings → Plugins → MCPs** shows Forge but tools fail, MCP is not connected yet.

## Step 1 — Test connection

Call **`list_my_projects`** on any Forge MCP server that exposes Forge tools (try **`user-forge`** first, then **`forge`**).

- **Success** → note which server name worked; skip to Step 3.
- **Tool not found** on all Forge servers → go to Step 2.
- **401 / auth error** → go to Step 2.

Do **not** treat `plugin-forge-forge` errored as disconnected until `list_my_projects` fails on **user-forge** / **forge** too.

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
4. Confirm **Settings → Tools & MCP** shows a Forge server connected (green) — usually **`user-forge`** or **`forge`**.

**Note:** **`plugin-forge-forge`** may stay errored; that is OK if **`user-forge`** is green and `list_my_projects` works.

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

Suggest **`/work`**, **`/start-work`**, **`/forge-context`**, or **`/forge-orders`** as the next step.
