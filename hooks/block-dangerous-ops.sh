#!/bin/bash
# Forge Dangerous Operations Guard
# Blocks force-pushes, destructive rm commands, and unreviewed prod deployments.
# failClosed: true — blocks on any error for safety.

input=$(cat)
command=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('command',''))" 2>/dev/null)

# Block force push
if echo "$command" | grep -qE 'git\s+push\s+.*--force'; then
  cat <<'EOF'
{
  "permission": "deny",
  "user_message": "Force push blocked by Forge safety guard. Force-pushing rewrites history and can break teammates' work.",
  "agent_message": "The force push was blocked by the Forge dangerous operations guard. Ask the user to confirm they really want to force-push, and if so, they should run the command manually in their terminal (not through the agent)."
}
EOF
  exit 0
fi

# Block rm -rf /
if echo "$command" | grep -qE 'rm\s+-rf\s+/'; then
  cat <<'EOF'
{
  "permission": "deny",
  "user_message": "Destructive command blocked. This would recursively delete from root.",
  "agent_message": "Blocked: attempted recursive deletion from root filesystem. This is almost certainly unintentional."
}
EOF
  exit 0
fi

# Block kubectl apply to prod without explicit approval
if echo "$command" | grep -qE 'kubectl\s+.*apply.*prod'; then
  cat <<'EOF'
{
  "permission": "ask",
  "user_message": "This command applies changes to a production namespace. Please review carefully before approving.",
  "agent_message": "A kubectl apply targeting a production namespace was intercepted. The user must explicitly approve this action."
}
EOF
  exit 0
fi

echo '{"permission": "allow"}'
exit 0
