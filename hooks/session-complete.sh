#!/bin/bash
# Forge Session Complete Hook
# Fires when the agent loop ends. Reminds to sync dev activity ONCE per conversation.
# Uses loop_count + a sentinel file so followup_message never loops infinitely.

set -euo pipefail

input=$(cat)

echo "$input" | python3 -c "
import json
import os
import sys

REMINDER = (
    'Session complete. If you made commits or created PRs during this session, '
    'consider running `sync_dev_activity` on your connected Forge MCP server (see /forge-status) to update activity tracking.'
)

def emit_empty() -> None:
    print('{}')
    sys.exit(0)

try:
    data = json.load(sys.stdin)
except json.JSONDecodeError:
    emit_empty()

status = data.get('status', 'completed')
loop_count = data.get('loop_count', 0)
conversation_id = data.get('conversation_id') or 'unknown'

# Only remind after a normal agent completion (not abort/error).
if status != 'completed':
    emit_empty()

# Cursor increments loop_count after each followup_message we emit.
if isinstance(loop_count, int) and loop_count >= 1:
    emit_empty()

# Belt-and-suspenders: dedupe if loop_count is missing or not incremented.
state_dir = os.path.join(os.path.expanduser('~'), '.cursor', 'forge-hook-state')
os.makedirs(state_dir, exist_ok=True)
sentinel = os.path.join(state_dir, f'session-reminder-{conversation_id}')

if os.path.exists(sentinel):
    emit_empty()

# Mark before emitting so a rapid re-fire cannot loop.
with open(sentinel, 'w', encoding='utf-8') as f:
    f.write('1\n')

print(json.dumps({'followup_message': REMINDER}))
"

exit 0
