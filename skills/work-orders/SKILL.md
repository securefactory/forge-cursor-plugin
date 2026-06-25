---
name: work-orders
description: >-
  Manage Forge work orders — list, pick, update, transition, and complete
  development tasks. Use when the user asks about their current task, next work
  item, wants to update progress, create PRs, prepare commits, or manage
  workflow stages.
---

# Work Orders

## When to Use

Activate this skill when the user:
- Asks "what should I work on next?" or "what's my current task?"
- Wants to update a work order status or add notes
- Is ready to commit and wants a formatted commit message
- Wants to create a PR linked to their work order
- Asks about workflow stages or work order statistics

## Tools

| Tool | Purpose |
|------|---------|
| `list_work_orders` | List tasks (filter by status, assignee) |
| `get_work_order` | Full details of a specific task |
| `get_next_work_order` | Pick highest-priority unstarted task |
| `update_work_order` | Update fields (status, estimate, notes) |
| `transition_work_order` | Move through workflow stages |
| `complete_work_order` | Mark done (with optional PR link) |
| `get_workflow_stages` | Available stages for the project |
| `get_work_order_stats` | Summary statistics |
| `prepare_commit` | Generate formatted `[WO-...]` commit message for the work order |
| `create_pull_request` | Create PR linked to work order |
| `ask_question` | Ask clarifying question about a work order |
| `get_clarifications` | Get pending clarifications |
| `comment_on_work_order` | Add a comment |
| `reply_to_work_order_comment` | Reply to existing comment |
| `get_work_order_comments` | List all comments |

## Workflow

1. Ensure a project is set (`set_project`) before querying work orders.
2. Use `get_next_work_order` to pick a task, or `list_work_orders` to browse.
3. Before committing, call `prepare_commit` to get the commit message; plugin hooks enforce the pre-commit checklist.
4. After pushing, call `create_pull_request` to link the PR back to the work order.
5. When done, call `complete_work_order` to close the task (requires synced merged PR unless user explicitly overrides).
