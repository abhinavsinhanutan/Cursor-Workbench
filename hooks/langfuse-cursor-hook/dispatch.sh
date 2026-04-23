#!/bin/bash
# Fire-and-forget wrapper: hands Cursor's hook payload to langfuse_hook.py in
# a detached background process, then returns an empty JSON ack immediately so
# Cursor never waits for network I/O.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
payload="$(cat)"

(
  printf '%s' "$payload" | "$SCRIPT_DIR/.venv/bin/python" "$SCRIPT_DIR/langfuse_hook.py" \
    >> "$SCRIPT_DIR/langfuse.log" 2>&1
) &
disown 2>/dev/null || true

echo '{}'
exit 0
