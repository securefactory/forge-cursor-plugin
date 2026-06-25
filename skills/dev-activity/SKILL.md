---
name: dev-activity
description: >-
  Sync and validate developer activity in Forge — pull commits and PRs from
  linked repos, verify data consistency, and replay missed events. Use when the
  user wants to sync development activity, validate commit history, or recover
  from missed events.
---

# Developer Activity

## When to Use

Activate this skill when the user:
- Asks to sync their commits or PRs to Forge
- Wants to verify that activity data is up to date
- Mentions gaps in tracked activity or missing events
- Asks about commit history alignment with Forge

## Tools

| Tool | Purpose |
|------|---------|
| `sync_dev_activity` | Pull commits and PRs from linked repos into Forge |
| `validate_dev_activity_sync` | Verify activity data is consistent and complete |
| `replay_dev_activity` | Replay missed activity events for gap recovery |

## Workflow

1. Set the project context first with `set_project`.
2. Use `sync_dev_activity` to pull the latest commits and PRs.
3. If inconsistencies are suspected, run `validate_dev_activity_sync`.
4. If validation reveals gaps, use `replay_dev_activity` to recover missed events.

## Parameters

- `repo_name` — Optional scope to a specific `owner/repo`
- `since` — ISO timestamp lower bound for sync
- `forge_only` — Only treat forge-verified events as valid (default: true)
- `mode` — For replay: `missing_only`, `from_timestamp`, or `full_project`
- `dry_run` — Preview replay changes without writing data
