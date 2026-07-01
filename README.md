# Forge — Cursor Plugin

Work order management, developer activity tracking, and project context for AI-assisted development workflows in [Forge](https://app.softwareforge.ai).

## Features

| Feature | Description |
|---------|-------------|
| **Work Orders** | Manage tasks through their full lifecycle — pick, implement, commit, PR, complete |
| **Dev Activity** | Sync commits and PRs from linked repos, validate consistency, replay gaps |
| **Project Context** | Set active project, list repos, search artifacts, access requirements |
| **Pre-commit Guard** | Enforces Forge pre-commit checklist for `[WO-]` / `[TASK-]` commits (tests, acceptance criteria, activity report) |
| **Destructive Command Guard** | Blocks force-pushes and `rm -rf /`; prompts before prod `kubectl apply` |
| **Pre-push Reminder** | Reminds to sync activity and link PRs (non-blocking) |
| **Sensitive File Warning** | Warns when reading files with sensitive names (`.env`, `*.pem`, etc.) — filename only, not content scan |
| **Session End Reminder** | Reminds to sync activity when agent session ends |

## Documentation

Full usage and feature guide (customer-facing): **[docs/forge-plugin-guide.html](docs/forge-plugin-guide.html)**

Open in a browser or share with your team. For enterprise admin setup, see [docs/team-marketplace-setup.md](docs/team-marketplace-setup.md).

## Install

### Team Marketplace (enterprise)

Import this repository in Cursor **Team Marketplace** (see [docs/team-marketplace-setup.md](docs/team-marketplace-setup.md)).

Repository: [securefactory/forge-cursor-plugin](https://github.com/securefactory/forge-cursor-plugin)

### Public marketplace (after approval)

Submit or install from the [Cursor Marketplace](https://cursor.com/marketplace) once listed. Plugin ID: **`forge`**, display name: **Forge**.

Until listed, use Team Marketplace import or [local install](#local-development) below.

### Pre-submit / pre-release checklist

```bash
node scripts/validate-plugin.mjs
```

Then verify MCP: Forge **Install in IDE → Cursor**, confirm a Forge server is green under **Settings → Tools & MCP** (usually **`user-forge`**), run **`/forge-status`** in **Agent** chat.

**Slash commands not showing?** Plugin must be **enabled** in Customize → Plugins, and commands only appear in **Agent** chat (`/forge-connect`, `/forge-status`, …). If the plugin page lists commands but `/` does not, the local plugin cache is likely empty (common with private repos) — see [docs/team-marketplace-setup.md](docs/team-marketplace-setup.md#slash-commands-not-loading).

## Connect MCP (required)

Forge MCP is **separate from this plugin**. The plugin ships workflow (hooks, skills, commands) only — each developer connects MCP once via user or project Cursor config.

### Preferred — one-click install from Forge UI

Forge generates a personal `forge_...` token and writes to **`~/.cursor/mcp.json`** (user/global scope).

1. Log into [Forge](https://app.softwareforge.ai)
2. Use any of these entry points:
   - **Application Context** → open a project → **Connect IDE** tab → **Install in IDE** → **Cursor**
   - **Project Settings** → **Connect IDE** section → **Install in IDE** → **Cursor**
   - **User Settings** (avatar menu) → **API Tokens** → **Install in IDE** → **Cursor**
3. Accept the MCP install prompt in Cursor when it opens.
4. Confirm under **Settings → Tools & MCP** that a Forge server is connected (green) — typically **`user-forge`**.

On the **Connect IDE** tab you can also **Create an API Token**, then click **Install in Cursor** under **One-Click Install**.

**Note:** **Open in IDE** on a work order card launches that task in your editor — it is not the MCP install flow.

### Alternative — manual user/global `~/.cursor/mcp.json`

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

### Alternative — project `.cursor/mcp.json`

Same JSON shape in **`.cursor/mcp.json`** at the repo root for team-scoped MCP (merged with user config). `/forge-status` and `/forge-connect` check **both** files.

Run **`/forge-connect`** for step-by-step MCP install guidance. Use **`/forge-status`** to discover the active server and diagnose connection issues.

## First session

After MCP is connected, call `configure_repo` once per session:

```json
{ "ide": "cursor", "hooks_already_present": true }
```

This registers the session with Forge and unlocks work order tools.

## Commands

| Command | Description |
|---------|-------------|
| `/forge-connect` | **Start here** — MCP install, verify connection, configure session, select project |
| `/forge-status` | **Validate MCP** — readiness report; install steps if disconnected |
| `/forge-context` | Load journey state, linked repos, and key artifacts (intent, PRD, architecture, RTM) |
| `/forge-artifacts` | Fetch one artifact by type or `search_artifacts` by keyword |
| `/forge-orders` | Browse work orders — stats, filters, details, comments, clarifications |
| `/forge-sync` | Sync commits/PRs to Forge (`sync_dev_activity`); validate or replay if needed |
| `/work` | Pick or show the next work order |
| `/start-work` | Full workflow: context → implement → commit → PR → complete |

## MCP tools reference

All tools live on your **connected Forge MCP server** (discovered via `/forge-status` — typically **`user-forge`** or **`forge`**, tools as `mcp__<server>__<tool>`). Skills document workflows and parameters in detail.

### Project context (9)

| Tool | Purpose |
|------|---------|
| `set_project` | Set active project for the session |
| `list_my_projects` | List accessible projects |
| `list_linked_repos` | Repos linked to the project |
| `link_repo` | Link a repository (`git_url` or `repo_full_name` + `connector_id`) |
| `get_project_state` | Journey step, ref code, metadata |
| `configure_repo` | Session hooks gate (required before work order tools) |
| `get_artifact` | Latest artifact: `intent`, `prd`, `brd`, `architecture`, `work_orders`, `rtm` |
| `list_ux_references` | UX images with download URLs |
| `search_artifacts` | Full-text search across artifacts |

### Work orders (15)

| Tool | Purpose |
|------|---------|
| `list_work_orders` | List tasks (filter by `status`, `priority`) |
| `get_work_order` | Full details by UUID |
| `get_next_work_order` | Pick next backlog task (auto-transitions) |
| `update_work_order` | Post-commit dev activity report |
| `transition_work_order` | Manual stage transition |
| `complete_work_order` | Mark done (requires synced merged PR) |
| `get_workflow_stages` | Stage definitions and transitions |
| `get_work_order_stats` | Status distribution |
| `prepare_commit` | Generate `[WO-...]` commit message |
| `create_pull_request` | Generate PR title/body + CLI command |
| `ask_question` | Post clarification (Forge UI) |
| `get_clarifications` | List clarification Q&A |
| `comment_on_work_order` | WO comment thread (`wo_id`, e.g. `WO-001`) |
| `reply_to_work_order_comment` | Reply to WO comment |
| `get_work_order_comments` | List WO comments |

### Developer activity (3)

| Tool | Purpose |
|------|---------|
| `sync_dev_activity` | Sync commits/PRs from linked repos |
| `validate_dev_activity_sync` | Verify activity consistency |
| `replay_dev_activity` | Replay missed events |

### MCP resources (read-only)

- `forge://docs/introduction`, `forge://docs/tools`
- `forge://project/{projectId}/intent|prd|brd|architecture`

## Safety Hooks

| Hook | Event | Behavior |
|------|-------|----------|
| Pre-commit | `git commit` | Blocks `[WO-]` / `[TASK-]` commits until Forge pre-commit checklist is complete |
| Pre-push | `git push` | Reminder to sync activity and link PRs (non-blocking) |
| Destructive command guard | `git push --force`, `rm -rf /`, prod `kubectl apply` | Blocks force-push and `rm -rf /`; asks for approval on prod kubectl |
| Sensitive file warning | File reads | Warns on sensitive filenames (`.env`, `*.pem`, etc.) — does not scan content |
| Session end reminder | Agent stops | One-time reminder to `sync_dev_activity` (no infinite loop) |

## Repository structure

```
forge-cursor-plugin/               → repo root (multi-plugin team marketplace)
├── .cursor-plugin/
│   └── marketplace.json           → Team marketplace manifest (pluginRoot: plugins)
├── plugins/
│   └── forge/                     → Forge plugin bundle
│       ├── .cursor-plugin/plugin.json
│       ├── agents/forge-agent.md
│       ├── skills/                → work-orders, dev-activity, project-context
│       ├── commands/              → forge-connect, forge-status, forge-context, …
│       ├── hooks/                 → Guard hooks
│       ├── rules/forge-conventions.mdc
│       └── assets/avatar.png
├── docs/                          → Enterprise setup, add-a-plugin guide
└── scripts/validate-plugin.mjs    → Pre-push validation (all marketplace plugins)
```

MCP is **not** bundled — developers connect via **`~/.cursor/mcp.json`** (user/global) and/or **`.cursor/mcp.json`** (project).

## Local Development

1. Clone and open this repo in Cursor
2. Connect MCP via Forge **Install in IDE → Cursor** (user `~/.cursor/mcp.json`) or add `.cursor/mcp.json` / manual config
3. Run `node scripts/validate-plugin.mjs`
4. Optional: copy the plugin bundle to `~/.cursor/plugins/local/forge` and **Developer: Reload Window**
5. Run `/forge-status` then `/forge-connect`

To test plugin hooks in isolation, copy to the local plugins folder:

```bash
rm -rf ~/.cursor/plugins/local/forge
cp -R plugins/forge ~/.cursor/plugins/local/forge
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

Apache-2.0 — see [LICENSE](LICENSE).
