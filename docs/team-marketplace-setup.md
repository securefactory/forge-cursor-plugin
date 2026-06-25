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

Each developer must connect once:

1. Log into their Forge instance
2. **Settings** → **Connect IDE** → **Open in Cursor**

Or distribute manual `~/.cursor/mcp.json` instructions (server name must be `forge`).

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
| MCP tools fail | Run `/forge-status` or `/forge-connect`; use Forge UI deeplink |
| Hooks not firing | Check **Settings** → **Hooks** |
| Wrong Forge tenant | Re-run deeplink from correct Forge instance |
| Token expired | Generate new token in Forge **Settings** → **API Tokens** |

## Using with Opsera DevSecOps

DevSecOps is a separate Cursor plugin in [opsera-agents/opsera-cursor](https://github.com/opsera-agents/opsera-cursor). Import both repositories separately if your team uses both products.
