#!/bin/bash
# Forge Session Complete Hook
# Fires when the agent session ends. Provides a reminder to sync activity.
# Non-blocking informational hook.

input=$(cat)

# Extract session info if available
session_info=$(echo "$input" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(json.dumps({'event': d.get('hook_event_name', 'stop')}))
" 2>/dev/null || echo '{}')

# Return a follow-up message reminding to sync activity
cat <<'EOF'
{
  "followup_message": "Session complete. If you made commits or created PRs during this session, consider running `mcp__forge__sync_dev_activity` to update Forge's activity tracking."
}
EOF
exit 0
