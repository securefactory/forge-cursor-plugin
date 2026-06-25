---
name: forge-status
description: Check Forge MCP connection, plugin hooks, and session readiness.
---

# Forge Status

Verify that Forge is connected and ready for work order operations.

## Steps

1. **MCP server name**: Confirm the global MCP server is named **`forge`** (not `forge-refactory` or other aliases). Tools must resolve as `mcp__forge__*`.

2. **Connection test**: Call `list_my_projects`.
   - If it succeeds, MCP auth is working.
   - If it fails with 401, guide the user to Forge **Settings** → **Connect IDE** → **Open in Cursor**, or add `forge` to `~/.cursor/mcp.json`.

3. **Session hooks gate**: If work order tools return a `configure_repo` warning, call:
   ```json
   { "ide": "cursor", "hooks_already_present": true }
   ```
   (Use `hooks_already_present: false` only when the Forge plugin is not installed.)

4. **Plugin hooks**: Remind the user to check **Settings** → **Hooks** for Forge guard hooks (pre-commit, pre-push, dangerous ops, secrets, session complete).

5. **Environment variables** (optional fallback when deeplink is not used):
   - `FORGE_MCP_URL=https://<tenant>.agent.opsera.dev/api/mcp`
   - `FORGE_TOKEN=forge_...`
   - Launch Cursor from a terminal if using env vars so they are inherited.

6. **Report status** to the user:
   - MCP connected: yes/no
   - Projects accessible: yes/no
   - Session configured (`configure_repo`): yes/no/unknown
   - Suggested next step: `/forge-connect` or `/work`

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Plugin page shows MCP but tools missing | Connect under **Settings** → **Tools & MCP**, not just the plugin metadata page |
| `mcp__forge__*` not found | Rename MCP server to `forge` in `~/.cursor/mcp.json` |
| Work orders blocked | Run `configure_repo` with `hooks_already_present: true` |
| Env vars not applied | Restart Cursor from terminal after `export FORGE_MCP_URL` / `FORGE_TOKEN` |
