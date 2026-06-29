# Cursor Automation Templates

Pre-built automation templates that use Forge MCP tools. These run as Cursor Cloud Agents triggered by events.

## Prerequisites

- Forge plugin installed and global `forge` MCP connected
- Cursor Teams or Enterprise plan

## Templates

### 1. Code health on PR

**Trigger:** Pull request opened or updated

```yaml
name: forge-pr-activity-sync
trigger: pull_request
description: Sync PR to Forge and validate work order alignment

steps:
  - tool: mcp__forge__set_project
    args:
      project_id: "${PROJECT_ID}"

  - tool: mcp__forge__sync_dev_activity
    args:
      repo_name: "${REPO_FULL_NAME}"
      mode: from_timestamp
      from_timestamp: "${PR_CREATED_AT}"

  - tool: mcp__forge__validate_dev_activity_sync
    args:
      project_id: "${PROJECT_ID}"
      repo_name: "${REPO_FULL_NAME}"
```

### 2. Work order progress on merge

**Trigger:** Pull request merged

```yaml
name: forge-auto-complete-on-merge
trigger: pull_request_merged
description: Complete work order when linked PR is merged

steps:
  - tool: mcp__forge__set_project
    args:
      project_id: "${PROJECT_ID}"

  - tool: mcp__forge__sync_dev_activity
    args:
      repo_name: "${REPO_FULL_NAME}"

  - tool: mcp__forge__complete_work_order
    args:
      work_order_id: "${WORK_ORDER_ID}"
      pr_url: "${PR_URL}"
```

### 3. Weekly activity report

**Trigger:** Weekly schedule (Monday 9am)

```yaml
name: forge-weekly-sync
trigger: schedule
cron: "0 9 * * 1"
description: Weekly activity sync and progress report

steps:
  - tool: mcp__forge__set_project
    args:
      project_id: "${PROJECT_ID}"

  - tool: mcp__forge__sync_dev_activity
    args: {}

  - tool: mcp__forge__validate_dev_activity_sync
    args:
      project_id: "${PROJECT_ID}"

  - tool: mcp__forge__get_work_order_stats
    args: {}
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `PROJECT_ID` | Forge project UUID |
| `REPO_FULL_NAME` | Repository `owner/name` |
| `PR_CREATED_AT` | PR creation timestamp |
| `PR_URL` | Pull request URL |
| `WORK_ORDER_ID` | Work order ID from PR or branch |

Configure `FORGE_TOKEN` and MCP URL in automation settings — not in this repository.
