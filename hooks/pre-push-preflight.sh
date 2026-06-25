#!/bin/bash
# Forge Pre-Push Preflight Hook
# Warns if shipping pipeline is not ready before pushing.
# Non-blocking — provides advisory warning only.

input=$(cat)
command=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('command',''))" 2>/dev/null)

if ! echo "$command" | grep -qE 'git\s+push'; then
  echo '{"permission": "allow"}'
  exit 0
fi

# Advisory only — emit a message but allow the push
cat <<'EOF'
{
  "permission": "allow",
  "agent_message": "Forge reminder: After pushing, consider running `mcp__forge__sync_dev_activity` to update your activity tracking in Forge. If this push is for a work order, ensure the PR is linked with `mcp__forge__create_pull_request`."
}
EOF
exit 0
