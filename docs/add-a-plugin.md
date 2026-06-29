# Add a plugin

Add a new plugin under `plugins/` and register it in `.cursor-plugin/marketplace.json`.

## 1. Create plugin directory

Create a new folder:

```text
plugins/my-new-plugin/
```

Add the required manifest:

```text
plugins/my-new-plugin/.cursor-plugin/plugin.json
```

Example manifest:

```json
{
  "name": "my-new-plugin",
  "displayName": "My New Plugin",
  "version": "0.1.0",
  "description": "Describe what this plugin does",
  "author": {
    "name": "Forge",
    "email": "hi@softwareforge.ai"
  },
  "logo": "assets/avatar.png",
  "category": "developer-tools",
  "tags": ["forge"]
}
```

Fastest start: copy `plugins/forge/` as a template and rename manifest fields, commands, and skills.

## 2. Add plugin components

Add only the components you need:

- `rules/` with `.mdc` files (YAML frontmatter required: `description`)
- `skills/<skill-name>/SKILL.md` (frontmatter: `name`, `description`)
- `agents/*.md` (frontmatter: `name`, `description`)
- `commands/*.(md|mdc|markdown|txt)` (frontmatter: `name`, `description`)
- `hooks/hooks.json` and hook scripts for automation
- `assets/avatar.png` for marketplace display

Paths in `plugin.json` are relative to the plugin folder, not the repo root.

## 3. Register in marketplace manifest

Edit `.cursor-plugin/marketplace.json` and append a new entry:

```json
{
  "name": "my-new-plugin",
  "source": "my-new-plugin",
  "description": "Describe your plugin"
}
```

Rules:

- `"pluginRoot": "plugins"` in `metadata` — all `source` values resolve under `plugins/`
- `"source"` must be a **bare directory name** (e.g. `"forge-shipping"`), not `"./plugins/forge-shipping"`
- Bump `metadata.version` when adding or changing plugins

## 4. Validate

```bash
node scripts/validate-plugin.mjs
```

Fix all reported errors before committing.

The validator runs marketplace checks for every listed plugin. Forge-specific MCP tool doc checks apply only to the `forge` plugin.

## 5. Push and refresh team marketplace

1. Commit and push to the tracked branch
2. **Dashboard → Team Marketplaces → Refresh** (or re-import if the new plugin does not appear)
3. Set install policy per plugin (**Default Off / Default On / Required**)
4. Developers: **Developer → Reload Window**

Adding a **brand-new** plugin may require re-importing the repo URL — Auto Refresh updates existing plugins but may not discover new entries automatically.

## Example: forge-shipping

```text
plugins/forge-shipping/
├── .cursor-plugin/plugin.json
├── commands/
├── skills/
└── assets/avatar.png
```

```json
{
  "plugins": [
    { "name": "forge", "source": "forge", "description": "..." },
    { "name": "forge-shipping", "source": "forge-shipping", "description": "Release and deploy workflows" }
  ]
}
```

## Common pitfalls

- Plugin `name` not kebab-case or not unique across the marketplace
- `source` in marketplace.json does not match the folder name under `plugins/`
- Missing `.cursor-plugin/plugin.json` in the plugin folder
- Missing frontmatter keys in skills, agents, or commands
- Mixing repo-root plugin folders with `pluginRoot: "plugins"` — keep all plugins under `plugins/`
