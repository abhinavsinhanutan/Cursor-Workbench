#!/usr/bin/env bash
# cursor-workbench: append hook stdin to a local log. Fail-open (never blocks Cursor).
# Optional: touch $CURSOR_WB_LOG_DIR/disabled to turn logging off.
: "${CURSOR_WB_LOG_DIR:=$HOME/.cursor/cursor-workbench-logs}"
if [[ -f "${CURSOR_WB_LOG_DIR}/disabled" ]]; then
  exit 0
fi
mkdir -p "$CURSOR_WB_LOG_DIR" 2>/dev/null || exit 0
log_file="${CURSOR_WB_LOG_DIR}/events.log"
{
  printf '%s\n' "---- $(date -Iseconds 2>/dev/null || date) ----"
  cat
  printf '\n'
} >>"$log_file" 2>/dev/null || true
exit 0
