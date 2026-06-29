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
4. Cursor parses `.cursor-plugin/marketplace.json` and should detect **1 plugin: Forge**

If the modal shows **"0 plugins"**, the repo is missing or has an invalid marketplace manifest — ensure `main` includes `.cursor-plugin/marketplace.json` with `"pluginRoot": "plugins"`, `"source": "forge"` (bare directory name, no `./` prefix), and `plugins/forge/.cursor-plugin/plugin.json`.

### 2. Configure plugin availability

| Policy | Behavior |
|--------|----------|
| **Default Off** | Available; users opt in from Customize |
| **Default On** | Auto-installed; users can disable |
| **Required** | Auto-installed and cannot be disabled |

**Recommended:** Set `forge` to **Required** for work order tracking and guard hooks.

### 3. Configure Forge MCP (each developer)

The plugin ships hooks, skills, and commands only — **not** MCP credentials. Each developer connects Forge MCP separately (user/global and/or project scope).

Each developer must connect once via Forge one-click install:

1. Log into [Forge](https://app.softwareforge.ai)
2. **Install in IDE** → **Cursor** from any of:
   - Application Context → **Connect IDE** tab
   - **Project Settings** → **Connect IDE**
   - **User Settings** → **API Tokens**
3. Accept the MCP install prompt in Cursor (writes **`~/.cursor/mcp.json`**, server usually **`user-forge`**)
4. Verify **Settings → Tools & MCP** shows Forge connected (green)

Optional: add **`.cursor/mcp.json`** in a project repo for team-scoped MCP. `/forge-status` checks both user and project config.

Developers can run **`/forge-status`** to verify the connection.

### 4. Verify installation

Developers should see:

- `forge` plugin **enabled** under **Customize** → **Plugins** (not just listed — toggle on if **Default Off**)
- **Agent** chat slash menu: type `/` then `forge` — eight commands (`/forge-connect`, `/forge-status`, `/forge-context`, `/forge-artifacts`, `/forge-orders`, `/forge-sync`, `/work`, `/start-work`)
- Forge MCP connected (green) under **Tools & MCP** — usually **`user-forge`**
- Guard hooks under **Hooks**

**Commands only register in Agent chat** (not inline Tab completions). After install, run **Developer: Reload Window** once.

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
| **"0 plugins" after import** | Repo must ship `.cursor-plugin/marketplace.json` with `"pluginRoot": "plugins"` listing `plugins/forge/` (see [Import step](#1-import-the-plugin-repository)). Delete the empty marketplace, pull latest `main`, re-import, or click **Refresh**. |
| Plugin not showing | Verify import completed; refresh Cursor |
| **Logo not loading (admin or IDE)** | See [Logo not loading](#logo-not-loading) below |
| MCP tools fail | Run `/forge-status` or `/forge-connect`; re-run **Install in IDE → Cursor** in Forge |
| Hooks not firing | Check **Settings** → **Hooks** |
| Wrong Forge instance | Re-install MCP from [app.softwareforge.ai](https://app.softwareforge.ai) |
| Token expired | Create a new token under **Connect IDE** or **User Settings** → **API Tokens**, then re-install |
| **MCPs section still lists `forge` under plugin** | Stale plugin cache — remove and reinstall plugin, or enable **Auto Refresh** after pushing latest repo |
| **`/` commands not found (`/forge-status`, etc.)** | See [Slash commands not loading](#slash-commands-not-loading) below |

### Slash commands not loading

The plugin detail page can show skills/commands from **Cursor’s remote API** even when **no files were cloned locally** — so the UI looks fine but `/forge-connect` and other commands do not appear.

**Diagnose on the developer machine:**

```bash
# Should contain plugin files (commands/, skills/, hooks/), not an empty folder
ls ~/.cursor/plugins/cache/
find ~/.cursor/plugins/cache -name 'forge-connect.md' 2>/dev/null
find ~/.cursor/plugins/cache -path '*/commands/*.md' 2>/dev/null | head
```

If cache folders exist but are **empty** (or `forge-connect.md` is missing), the install failed silently.

| Cause | Fix |
|-------|-----|
| **Private GitHub repo — auth failed** | Known Cursor bug: clone runs without credentials. Install **Cursor GitHub App** on the org, or add `~/.netrc` with a PAT (`login x-access-token`). Delete empty `~/.cursor/plugins/cache/*` and `~/.cursor/plugins/marketplaces/*`, then reinstall. |
| **Plugin not enabled** | **Customize → Plugins → Forge** — turn **on** (required if admin set **Default Off**). |
| **Wrong chat surface** | Slash commands work in **Agent** chat only — open Agent, type `/forge`. |
| **Third-party plugins disabled** | **Cursor Settings** → ensure third-party plugins/skills are allowed (org policy can hide commands). |
| **Stale empty cache** | Remove plugin → delete empty cache dirs → **Developer: Reload Window** → reinstall from team marketplace. |
| **Immediate unblock (one user)** | `git clone` repo → `cp -R forge-cursor-plugin/plugins/forge ~/.cursor/plugins/local/forge` → Reload Window. |

**Admin checklist after pushing plugin updates:**

1. Bump `"version"` in `plugins/forge/.cursor-plugin/plugin.json` and/or `metadata.version` in `.cursor-plugin/marketplace.json`
2. Push to tracked branch
3. **Dashboard → Team Marketplaces → Auto Refresh**
4. Tell developers to **Reload Window** and type `/forge-status` in Agent chat

### Logo not loading

Cursor loads the logo from `plugin.json` → `"logo"` field. Relative paths are fetched from **`raw.githubusercontent.com`** at the imported commit — **not** from the local plugin cache.

| Cause | Fix |
|-------|-----|
| **Private GitHub repo** | `raw.githubusercontent.com` for the **imported** repo returns 401/404 — use an **absolute public HTTPS URL** in `plugin.json` (this repo uses the public upstream logo URL). |
| **Relative path after install** | Installed plugins may still fetch logo from GitHub, not local cache — absolute URL avoids private-repo auth failures. |
| **SVG in admin UI** | Some Cursor surfaces (Team Marketplace admin, Customize) render PNG more reliably than SVG. This repo ships **`plugins/forge/assets/avatar.png`**. |
| **Placeholder / generic icon** | Replace `plugins/forge/assets/avatar.png` with your brand asset and bump plugin version. |
| **Not pushed yet** | Logo must exist on the **tracked branch** at import time. Push `plugins/forge/assets/avatar.png`, enable **Auto Refresh**, or re-import the marketplace. |

After fixing, admins: **Dashboard → Settings → Plugins → Team Marketplaces → Auto Refresh** (or re-import). Developers: **Developer → Reload Window**.

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
cp -R forge-cursor-plugin/plugins/forge ~/.cursor/plugins/local/forge
# Developer: Reload Window
```

Then connect Forge MCP via **Install in IDE → Cursor** and run **`/forge-status`**.
