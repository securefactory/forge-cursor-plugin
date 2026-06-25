#!/bin/bash
# Forge Secret Redaction Hook
# Scans file content for common secret patterns before it's sent to the LLM.
# Non-blocking — logs a warning but allows the read.

input=$(cat)

# Extract the file path from the hook input
file_path=$(echo "$input" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('path', d.get('file_path', '')))
" 2>/dev/null)

# Skip if no file path or if it's a common safe file type
if [ -z "$file_path" ]; then
  echo '{"permission": "allow"}'
  exit 0
fi

# Check if the file is a known secrets file
case "$file_path" in
  *.env|*.env.*|*credentials*|*secrets*|*.pem|*.key|*id_rsa*|*id_ed25519*)
    cat <<EOF
{
  "permission": "allow",
  "user_message": "Warning: Reading a file that may contain secrets ($file_path). Sensitive values may be visible to the AI model."
}
EOF
    exit 0
    ;;
esac

echo '{"permission": "allow"}'
exit 0
