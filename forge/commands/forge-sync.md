---
name: forge-sync
description: Sync commits and PRs from linked repos to Forge — run after push or before completing a work order.
---

# Forge Sync

Sync developer activity from linked repositories into Forge.

## MCP prerequisite

Try `list_my_projects`. If unavailable or auth fails, **stop** and tell the user to run **`/forge-connect`**.

1. Call `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` if not done this session.
2. Ensure a project is set (`set_project`); if not, run **`/forge-connect`** first.

## Steps

1. Call `sync_dev_activity` (optional: `repo_name` as `owner/repo`, `mode`: `missing_only` | `from_timestamp` | `full_project`).
2. If the user reports missing events or stale data, call `validate_dev_activity_sync`.
3. If validation shows gaps, call `replay_dev_activity` with `mode: missing_only` (or `from_timestamp` if they give a date).

## Report

Print a short summary:
- Repos synced (or scoped repo)
- Whether validation passed
- Whether replay was needed
- Reminder: run again after the next push or before `complete_work_order`

## When to use

- After `git push` or creating a PR
- Before `complete_work_order` (merged PR must be visible in Forge)
- When Forge activity looks out of date
