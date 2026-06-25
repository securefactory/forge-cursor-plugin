# Opsera Forge — Cursor Plugin

Work order management, developer activity tracking, and project context for AI-assisted development workflows.

Standalone Cursor plugin repository. Opsera DevSecOps is a separate product: [opsera-agents/opsera-cursor](https://github.com/opsera-agents/opsera-cursor).

## Features

| Feature | Description |
|---------|-------------|
| **Work Orders** | Manage tasks through their full lifecycle — pick, implement, commit, PR, complete |
| **Dev Activity** | Sync commits and PRs from linked repos, validate consistency, replay gaps |
| **Project Context** | Set active project, list repos, search artifacts, access requirements |
| **Pre-commit Guard** | Validates commit scope against the active work order before allowing commits |
| **Dangerous Ops Guard** | Blocks force-pushes, destructive commands, and unreviewed prod deployments |
| **Session Tracking** | Reminds to sync activity when agent session ends |

## Install

Install from the [Cursor Marketplace](https://cursor.com/marketplace) or import this repository in **Team Marketplace** (see [docs/team-marketplace-setup.md](docs/team-marketplace-setup.md)).

Update the `repository` URL in `.cursor-plugin/plugin.json` if it changes — currently [securefactory/forge-cursor-plugin](https://github.com/securefactory/forge-cursor-plugin).

## Connect MCP (required)

The plugin declares an MCP server named **`forge`** in `mcp.json` using environment variables. Each developer must connect once:

**Preferred — Forge UI deeplink**

1. Log into your Forge instance (e.g. `https://<tenant>.agent.opsera.dev`)
2. Go to **Settings** → **Connect IDE**
3. Click **Open in Cursor** — installs global `forge` MCP with your token

**Alternative — manual `~/.cursor/mcp.json`**

Server name must be **`forge`** so tools resolve as `mcp__forge__*`.

**Alternative — environment variables**

```bash
export FORGE_MCP_URL="https://<tenant>.agent.opsera.dev/api/mcp"
export FORGE_TOKEN="forge_..."
open -a Cursor   # launch from terminal so env vars are inherited
```

Run **`/forge-connect`** or **`/forge-status`** in Cursor for guided setup and health checks.

## First session

After MCP is connected, call `configure_repo` once per session:

```json
{ "ide": "cursor", "hooks_already_present": true }
```

This registers the session with Forge and unlocks work order tools.

## Commands

| Command | Description |
|---------|-------------|
| `/forge-connect` | Connect to Forge, configure hooks, and select your project |
| `/forge-status` | Verify MCP connection, hooks, and session readiness |
| `/work` | Show current work order or pick the next one |
| `/start-work` | Full workflow: pick task → implement → commit → PR → complete |

## Guard Hooks

| Hook | Event | Behavior |
|------|-------|----------|
| Pre-commit | `git commit` | Validates commit aligns with active work order |
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
2. Connect MCP: Forge UI deeplink **or** add `forge` to `~/.cursor/mcp.json`
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
