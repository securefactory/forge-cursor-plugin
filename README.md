# Forge — Cursor Plugin

Work order management, developer activity tracking, and project context for AI-assisted development workflows in [Forge](https://app.softwareforge.ai).

## Features

| Feature | Description |
|---------|-------------|
| **Work Orders** | Manage tasks through their full lifecycle — pick, implement, commit, PR, complete |
| **Dev Activity** | Sync commits and PRs from linked repos, validate consistency, replay gaps |
| **Project Context** | Set active project, list repos, search artifacts, access requirements |
| **Pre-commit Guard** | Enforces Forge pre-commit checklist for `[WO-]` / `[TASK-]` commits (tests, acceptance criteria, activity report) |
| **Dangerous Ops Guard** | Blocks force-pushes, destructive commands, and unreviewed prod deployments |
| **Session Tracking** | Reminds to sync activity when agent session ends |

## Install

Import this repository in Cursor **Team Marketplace** (see [docs/team-marketplace-setup.md](docs/team-marketplace-setup.md)).

Repository: [securefactory/forge-cursor-plugin](https://github.com/securefactory/forge-cursor-plugin)

## Connect MCP (required)

The plugin declares an MCP server named **`forge`** in `mcp.json` using environment variables. Each developer must connect once.

### Preferred — one-click install from Forge UI

Forge generates a personal `forge_...` token and opens Cursor with the MCP server pre-configured.

1. Log into [Forge](https://app.softwareforge.ai)
2. Use any of these entry points:
   - **Application Context** → open a project → **Connect IDE** tab → **Install in IDE** → **Cursor**
   - **Project Settings** → **Connect IDE** section → **Install in IDE** → **Cursor**
   - **User Settings** (avatar menu) → **API Tokens** → **Install in IDE** → **Cursor**
3. Accept the MCP install prompt in Cursor when it opens.
4. Confirm under **Settings → Tools & MCP** that **`forge`** is connected (green).

On the **Connect IDE** tab you can also **Create an API Token**, then click **Install in Cursor** under **One-Click Install**.

**Note:** **Open in IDE** on a work order card launches that task in your editor — it is not the MCP install flow.

### Alternative — manual `~/.cursor/mcp.json`

Server name must be **`forge`** so tools resolve as `mcp__forge__*`.

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

Create a token under **Connect IDE** → **Create an API Token**, or in **User Settings** → **API Tokens**.

### Alternative — environment variables

```bash
export FORGE_MCP_URL="https://app.softwareforge.ai/api/mcp"
export FORGE_TOKEN="forge_..."
open -a Cursor   # launch from terminal so env vars are inherited
```

Run **`/forge-connect`** for step-by-step one-click MCP install guidance (the command stops and waits until you confirm `forge` is connected). Use **`/forge-status`** to diagnose connection issues.

## First session

After MCP is connected, call `configure_repo` once per session:

```json
{ "ide": "cursor", "hooks_already_present": true }
```

This registers the session with Forge and unlocks work order tools.

## Commands

| Command | Description |
|---------|-------------|
| `/forge-connect` | **Start here** — guides Forge one-click MCP install, verifies Tools & MCP, configures session, selects project |
| `/forge-status` | **Validate MCP** — calls Forge tools, prints a readiness status report; shows install steps if not connected |
| `/work` | Show current work order or pick the next one (redirects to `/forge-connect` if MCP not connected) |
| `/start-work` | Full workflow: pick task → implement → commit → PR → complete (requires MCP first) |

## Guard Hooks

| Hook | Event | Behavior |
|------|-------|----------|
| Pre-commit | `git commit` | Blocks `[WO-]` / `[TASK-]` commits until Forge pre-commit checklist is complete |
| Pre-push | `git push` | Advisory reminder to sync activity and link PRs |
| Block dangerous ops | `git push --force`, `rm -rf /`, prod deploys | Blocks with explanation |
| Redact secrets | File reads | Warns when reading files that may contain secrets |
| Session complete | Agent stops | Reminds to sync activity |

## Repository structure

```
forge-cursor-plugin/               → repo root (single-plugin layout)
├── .cursor-plugin/plugin.json     → Plugin manifest
├── mcp.json                       → Forge MCP config (env-var based, no secrets)
├── agents/forge-agent.md          → Forge subagent
├── skills/                        → work-orders, dev-activity, project-context
├── commands/                      → forge-connect, forge-status, work, start-work
├── hooks/                         → Guard hooks
├── rules/forge-conventions.mdc    → Shipped workflow conventions
├── docs/                          → Enterprise setup, automation templates
└── scripts/validate-plugin.mjs    → Pre-push validation
```

## Local Development

1. Clone and open this repo in Cursor
2. Connect MCP via Forge **Install in IDE → Cursor** or add `forge` to `~/.cursor/mcp.json`
3. Run `node scripts/validate-plugin.mjs`
4. Optional: copy repo to `~/.cursor/plugins/local/forge` and **Developer: Reload Window**
5. Run `/forge-status` then `/forge-connect`

To test plugin hooks in isolation, copy to the local plugins folder:

```bash
rm -rf ~/.cursor/plugins/local/forge
cp -R . ~/.cursor/plugins/local/forge
# Developer: Reload Window
```

Cleanup:

```bash
rm -rf ~/.cursor/plugins/local/forge
# Or Uninstall from Settings → Plugins → Forge Local
```

## Validation

```bash
node scripts/validate-plugin.mjs
```

## License

Apache-2.0
