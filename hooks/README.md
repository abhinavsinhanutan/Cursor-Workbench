# Hooks

| Bundle | Description |
| --- | --- |
| [local-jsonl-log/](local-jsonl-log/) | **Optional.** Append-only local file log of hook payloads (no third-party services). See its README for merge rules if you already use hooks. |

**Design note:** this repo’s hooks are **opt-in** and **fail-open** — if a
script errors, the editor should keep working. Prefer logging over blocking
unless you have a separate security review story.
