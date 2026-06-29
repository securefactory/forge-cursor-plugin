# Team Marketplace Setup Guide

How enterprise customers deploy the Forge Cursor plugin to their development team.

## Prerequisites

- Cursor **Teams** ($20/user/mo) or **Enterprise** plan
- Admin access to Cursor team settings
- GitHub access to [securefactory/forge-cursor-plugin](https://github.com/securefactory/forge-cursor-plugin) (public or private fork)

## Setup steps

### 1. Import the plugin repository

1. Open Cursor → **Dashboard** → **Settings** → **Plugins**
2. Under **Team Marketplaces**, click **Add Marketplace** → **Import from Repo**
3. Enter: `https://github.com/securefactory/forge-cursor-plugin`
4. The `forge` plugin is detected automatically

### 2. Configure plugin availability

| Policy | Behavior |
|--------|----------|
| **Default Off** | Available; users opt in from Customize |
| **Default On** | Auto-installed; users can disable |
| **Required** | Auto-installed and cannot be disabled |

**Recommended:** Set `forge` to **Required** for work order tracking and guard hooks.

### 3. Configure Forge MCP (each developer)

The plugin ships hooks, skills, commands, and an env-based `mcp.json` — **not** tenant credentials.

Each developer must connect once via Forge one-click install:

1. Log into [Forge](https://app.softwareforge.ai)
2. **Install in IDE** → **Cursor** from any of:
   - Application Context → **Connect IDE** tab
   - **Project Settings** → **Connect IDE**
   - **User Settings** → **API Tokens**
3. Accept the MCP install prompt in Cursor
4. Verify **Settings → Tools & MCP** shows `forge` connected

Developers can run **`/forge-status`** to verify the connection.

### 4. Verify installation

Developers should see:

- `forge` plugin active under **Customize** → **Plugins**
- Global `forge` MCP connected (green) under **Tools & MCP**
- Guard hooks under **Hooks**

## Private repository support

For a private fork:

1. Install the **Cursor GitHub App** on your organization
2. Grant access to the private repository
3. Import as normal — Cursor authenticates via the GitHub App

Enable **Auto Refresh** to pick up pushes to your tracked branch.

## Enterprise hooks (additional)

Enterprise admins can push org-wide hooks via **Team Settings** → **Hooks** alongside plugin hooks.

## Auto-updates

Team Marketplace refreshes from the tracked Git branch when **Auto Refresh** is enabled (requires Cursor GitHub App on the repo).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Plugin not showing | Verify import completed; refresh Cursor |
| MCP tools fail | Run `/forge-status` or `/forge-connect`; re-run **Install in IDE → Cursor** in Forge |
| Hooks not firing | Check **Settings** → **Hooks** |
| Wrong Forge instance | Re-install MCP from [app.softwareforge.ai](https://app.softwareforge.ai) |
| Token expired | Create a new token under **Connect IDE** or **User Settings** → **API Tokens**, then re-install |

## Public marketplace (optional)

For listing on the public [Cursor Marketplace](https://cursor.com/marketplace) (all Cursor users):

1. Ensure `node scripts/validate-plugin.mjs` passes on the repo
2. Submit at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)
3. Provide repo URL: `https://github.com/securefactory/forge-cursor-plugin`
4. Plugin ID: **`forge`**, display name: **Forge**
5. Wait for Cursor team review

Team Marketplace import works **without** public listing — use this guide for enterprise rollout first.

## Local install (any Cursor plan)

For individual testing without Team Marketplace:

```bash
git clone https://github.com/securefactory/forge-cursor-plugin.git
cp -R forge-cursor-plugin ~/.cursor/plugins/local/forge
# Developer: Reload Window
```

Then connect Forge MCP via **Install in IDE → Cursor** and run **`/forge-status`**.
