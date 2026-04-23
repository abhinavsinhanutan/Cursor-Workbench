# Local log hook (optional)

**What it does:** appends each hook invocation’s **stdin** (JSON from Cursor) to
`$CURSOR_WB_LOG_DIR/events.log` (default: `~/.cursor/cursor-workbench-logs/`).
**Fail-open:** never blocks the editor; errors are ignored.

**Disable without uninstalling:** `touch ~/.cursor/cursor-workbench-logs/disabled`

## Install in a project

1. **Back up** any existing `.cursor/hooks.json` in that project.
2. From the **project root**:

```bash
cp -R /path/to/cursor-workbench/hooks/local-jsonl-log/.cursor .
chmod +x .cursor/hooks/local_log.sh
```

3. If you **already** have a `hooks.json`, **merge** the `sessionStart` and
   `afterAgentResponse` entries from this bundle’s
   [hooks.json](.cursor/hooks.json) into your file — do not blind overwrite
   if you use other hooks (e.g. MCP guardrails).
4. Restart Cursor.

**Environment**

| Variable | Default | Meaning |
| --- | --- | --- |
| `CURSOR_WB_LOG_DIR` | `~/.cursor/cursor-workbench-logs` | Where `events.log` is written. |

**Security:** the log can contain prompt text and tool payloads. **Do not**
commit this directory. Your repo should list `/cursor-workbench-logs/` or
similar in `.gitignore` if you ever point `CURSOR_WB_LOG_DIR` inside the
project (not the default).
