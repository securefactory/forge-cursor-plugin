---
name: forge-connect
description: Connect to your Opsera Forge instance — set up authentication and select your active project.
---

# Forge Connect

Set up your connection to Opsera Forge.

## Steps

1. **Check if MCP is configured**: Try calling `list_my_projects`. If it works, you're already connected.

2. **If not connected**, guide the user:
   - Ask for their Forge instance URL (e.g., `refactory.agent.opsera.dev` or `elevence.agent.opsera.dev`)
   - Direct them to `https://<tenant>.agent.opsera.dev/settings`
   - Tell them to click **Connect IDE** → **Open in Cursor** to auto-configure the MCP connection
   - Alternatively, they can set environment variables:
     - `FORGE_MCP_URL=https://<tenant>.agent.opsera.dev/api/mcp`
     - `FORGE_TOKEN=forge_...` (generated from API Tokens page)

3. **Configure hooks**: Call `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` because the Forge marketplace plugin already provides guard hooks. This unlocks work order MCP tools for the session.

4. **Once connected**: Call `list_my_projects` to show available projects, then call `set_project` with the user's chosen project ID.

5. **Confirm**: Call `list_linked_repos` to show which repositories are linked and ready for work.
