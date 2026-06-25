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

1. Call `configure_repo` and `set_project` before dev-activity tools.
2. Use `sync_dev_activity` to pull latest commits/PRs from linked repos and replay projected events (optional: `repo_name`, `mode`, `from_timestamp`, `dry_run`).
3. If inconsistencies are suspected, run `validate_dev_activity_sync` (optional: `repo_name`, `since`, `forge_only`).
4. For gap recovery without a full sync, use `replay_dev_activity` directly (`mode`: `missing_only`, `from_timestamp`, or `full_project`).

## Parameters

**`sync_dev_activity`**
- `repo_name` — Optional `owner/repo` scope
- `mode` — `missing_only`, `from_timestamp`, or `full_project` (replay phase)
- `from_timestamp` — ISO lower bound when `mode=from_timestamp`
- `forge_only` — Only treat forge-verified events as valid (default: true)
- `dry_run` — Preview replay changes without writing data

**`validate_dev_activity_sync`**
- `repo_name` — Optional `owner/repo` scope
- `since` — ISO timestamp lower bound
- `forge_only` — Apply forge-only validity policy (default: true)

**`replay_dev_activity`**
- `repo_name`, `mode`, `from_timestamp`, `forge_only`, `include_unverified`, `dry_run`, `max_rows`
