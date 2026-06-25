#!/bin/bash
#
# Forge pre-commit hook for Cursor Agent (plugin version).
#
# Only activates for work-order commits (message contains [TASK-] or [WO-]).
# Regular commits pass through unblocked.
#
# If the project-level Forge hook (.cursor/hooks/forge-pre-commit.sh) is already
# installed via `configure_repo`, this plugin hook defers to it to avoid duplicate gating.
#
# Protocol: receives JSON on stdin, writes JSON to stdout.

input=$(cat)

# Only gate work-order commits
if ! echo "$input" | grep -qE '\[(TASK|WO)-'; then
  echo '{"permission": "allow"}'
  exit 0
fi

PROJECT_DIR="${CURSOR_PROJECT_DIR:-.}"

# Defer if project-level Forge hook already exists (installed via configure_repo MCP tool)
if [ -f "$PROJECT_DIR/.cursor/hooks/forge-pre-commit.sh" ]; then
  echo '{"permission": "allow"}'
  exit 0
fi

MARKER="$PROJECT_DIR/.forge-commit-ready"

# If checklist was already completed, allow the commit
if [ -f "$MARKER" ]; then
  echo '{"permission": "allow"}'
  exit 0
fi

# Block and instruct the agent to complete the Forge pre-commit checklist
cat << 'DENY'
{
  "permission": "deny",
  "user_message": "Forge pre-commit checklist must be completed before committing.",
  "agent_message": "FORGE PRE-COMMIT CHECKLIST — You must complete ALL steps below before the commit can proceed.\n\n## Step 1 — Unit Tests\n1. Run `git diff --cached --name-only` to get the list of staged files.\n2. For each staged source file, determine whether a corresponding unit test file exists.\n3. If a test file is MISSING, auto-generate a unit test file for it.\n4. Run the full test suite for all affected test files.\n5. If any test FAILS, attempt to auto-fix. If fix requires production logic changes, ask user consent.\n\n## Step 2 — Acceptance Criteria Validation\n1. Call `mcp__forge__get_work_order` to retrieve the full work order with acceptance criteria.\n2. For each criterion, determine: pass / partial / fail.\n3. If any criterion is NOT fully satisfied, ask the user how to proceed.\n\n## Step 3 — Report to Forge\nCall `mcp__forge__update_work_order` with commit_summary, test_summary, repo details, and metrics.\n\n## Step 4 — Mark Ready\nCreate `.forge-commit-ready` file in the project root (write 'ready' to it), then retry the git commit command."
}
DENY
exit 0
