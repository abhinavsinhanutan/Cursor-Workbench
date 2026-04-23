# Langfuse Cursor hook (optional telemetry)

**What it does:** forwards Cursor hook event JSON to [Langfuse](https://langfuse.com) in a
background process so the editor does not block. **Fail open:** errors are logged
to `langfuse.log` and ignored for Cursor.

**This bundle does not include a virtualenv** — run the installer on your machine.

## Install (project hooks)

1. Copy these files into your project (merge with existing `hooks.json` if any):

   ```bash
   mkdir -p .cursor/hooks
   cp dispatch.sh install.sh langfuse_hook.py mcp-guard.sh .env.example /path/to/your/project/.cursor/hooks/
   cd .cursor/hooks
   bash install.sh
   ```

2. Edit `.env` with your Langfuse keys (created from `.env.example` if missing).

3. Add or merge hook commands in `.cursor/hooks.json` — see
   [../../docs/SETUP.md](../../docs/SETUP.md) for
   [hooks.json.example](../../docs/hooks.json.example) and how to merge with
   [local-jsonl-log](../local-jsonl-log).

4. Restart Cursor.

## Never commit

- `.env` (API keys)
- `.venv/`
- `langfuse.log`
- `state/`

`install.sh` creates `.venv` and can copy `.env.example` to `.env` once; it will not
overwrite an existing `.env`.
