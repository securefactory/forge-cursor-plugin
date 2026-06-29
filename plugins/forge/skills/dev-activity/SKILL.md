---
name: dev-activity
description: >-
  Sync and validate developer activity in Forge — pull commits and PRs from
  linked repos, verify data consistency, and replay missed events. Use when the
  user wants to sync development activity, validate commit history, or recover
  from missed events.
---

# Developer Activity

All tools are MCP tools on your **connected Forge MCP server** (discover via `/forge-status` — typically `user-forge` or `forge`; tools as `mcp__<server>__*`).

## When to Use

Activate this skill when the user:
- Asks to sync their commits or PRs to Forge
- Wants to verify that activity data is up to date
- Mentions gaps in tracked activity or missing events
- Asks about commit history alignment with Forge
- Is about to call `complete_work_order` and needs merged PR data synced

## Tools

| Tool | Purpose |
|------|---------|
| `sync_dev_activity` | Pull commits and PRs from linked repos, then replay projected events |
| `validate_dev_activity_sync` | Verify activity data is consistent and complete |
| `replay_dev_activity` | Replay missed activity events for gap recovery |

## Lifecycle Placement

| When | Tool |
|------|------|
| After push or PR creation | `sync_dev_activity` |
| Before `complete_work_order` | `sync_dev_activity` (ensure merged PR is visible) |
| Suspected missing events | `validate_dev_activity_sync`, then `replay_dev_activity` |
| Agent session ends | Plugin hook reminds to `sync_dev_activity` |

`update_work_order` records commit/PR details at commit time; `sync_dev_activity` keeps Forge's repo-level view current for completion checks.

## Workflow

1. Call `configure_repo` and `set_project` before dev-activity tools.
2. After push/PR: `sync_dev_activity` (optional: `repo_name`, `mode`, `from_timestamp`, `dry_run`).
3. If inconsistencies are suspected: `validate_dev_activity_sync` (optional: `repo_name`, `since`, `forge_only`).
4. For gap recovery: `replay_dev_activity` (`mode`: `missing_only`, `from_timestamp`, or `full_project`).

## Parameters

**`sync_dev_activity`**
- `repo_name` — optional `owner/repo` scope
- `mode` — `missing_only`, `from_timestamp`, or `full_project` (replay phase)
- `from_timestamp` — ISO lower bound when `mode=from_timestamp`
- `forge_only` — only treat forge-verified events as valid (default: true)
- `dry_run` — preview replay changes without writing data

**`validate_dev_activity_sync`**
- `repo_name` — optional `owner/repo` scope
- `since` — ISO timestamp lower bound
- `forge_only` — apply forge-only validity policy (default: true)

**`replay_dev_activity`**
- `repo_name`, `mode`, `from_timestamp`, `forge_only`, `include_unverified`, `dry_run`, `max_rows`
