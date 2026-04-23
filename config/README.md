# Config (MCP — secrets stay local)

| File | Purpose |
| --- | --- |
| [mcp.json.example](mcp.json.example) | **Commit-safe** template: same server *names* as the kit; replace placeholders in a **private** `mcp.json`. |
| [MCP.md](MCP.md) | Per-server notes: what is secret vs not, and where to paste or type values. |
| [.env.example](.env.example) | Optional **worksheet** for Tableau `env` keys — copy to a local untracked `.env` and transcribe into JSON, or use only as a checklist. |

**Never commit** a real `mcp.json` with PATs/keys. See the root [README](../README.md) and [docs/SETUP.md](../docs/SETUP.md).
