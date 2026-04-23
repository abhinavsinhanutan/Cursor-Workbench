#!/usr/bin/env bash
# One-shot installer for the langfuse-cursor-hook.
#
# Creates a local Python virtualenv next to this script, installs the
# `langfuse` SDK into it, and seeds a `.env` from `.env.example` if one
# does not already exist.
#
# Re-running this script is safe: it upgrades langfuse in place and
# never overwrites an existing `.env`.
#
# Usage:
#   bash .cursor/hooks/install.sh
#
# Override the Python interpreter if needed:
#   PYTHON_BIN=python3.12 bash .cursor/hooks/install.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
cd "$SCRIPT_DIR"

PYTHON_BIN="${PYTHON_BIN:-python3}"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "ERROR: '$PYTHON_BIN' not found on PATH. Install Python 3.9+ or set PYTHON_BIN." >&2
  exit 1
fi

if [ ! -d ".venv" ]; then
  echo "==> Creating virtualenv at $SCRIPT_DIR/.venv"
  "$PYTHON_BIN" -m venv .venv
else
  echo "==> Reusing existing virtualenv at $SCRIPT_DIR/.venv"
fi

echo "==> Upgrading pip"
./.venv/bin/python -m pip install --quiet --upgrade pip

echo "==> Installing langfuse (>=3)"
./.venv/bin/python -m pip install --quiet --upgrade 'langfuse>=3'

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "==> Created .env from .env.example -- edit it with your real Langfuse keys."
  else
    echo "WARN: no .env.example found; you'll need to create .env manually." >&2
  fi
else
  echo "==> .env already exists; leaving it alone."
fi

chmod +x dispatch.sh langfuse_hook.py 2>/dev/null || true

echo
echo "Install complete."
echo
echo "Next steps:"
echo "  1. Edit $SCRIPT_DIR/.env with your real Langfuse credentials."
echo "  2. Restart Cursor (or open a new chat) so it reloads .cursor/hooks.json."
echo "  3. Trigger any Cursor action and watch traces appear in Langfuse."
echo
echo "Logs:    $SCRIPT_DIR/langfuse.log"
