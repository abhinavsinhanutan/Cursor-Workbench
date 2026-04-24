# Confluence: Cursor + MCP (DE) page

The draft page body is **[cursor-mcp-ds-team.page.md](cursor-mcp-ds-team.page.md)** (markdown ready for Confluence or the MCP `content` field).

## Publishing when on the corporate network / VPN

The **user-atlassian-local** MCP `confluence_create_page` must reach your Confluence host (e.g. `confluence.nutanix.com`). If you see DNS or connection errors from a sandbox, publish from a machine on VPN or your laptop.

1. In Cursor, ensure the Atlassian MCP is authenticated and **not** in read-only mode.
2. Call **confluence_create_page** with:
   - `space_key` — your target space (ask your Confluence admin if unsure).
   - `title` — e.g. `Cursor: first-time MCP setup and team practices (Data Engineering)`.
   - `content` — full contents of [cursor-mcp-ds-team.page.md](cursor-mcp-ds-team.page.md).
   - `content_format` — `markdown`
   - `enable_heading_anchors` — `true` (optional)
   - `parent_id` — optional parent page ID
   - `emoji` — optional, e.g. `🧭`
3. Or in the Confluence UI: **Create →** paste markdown if your Confluence version supports it, or paste and fix formatting, or use *Insert markup* if available.

A JSON payload helper is written by:

```bash
node --input-type=module -e "
import { readFileSync, writeFileSync } from 'fs';
const content = readFileSync('confluence/cursor-mcp-ds-team.page.md', 'utf8');
const args = {
  space_key: 'YOUR_SPACE_KEY',
  title: 'Cursor: first-time MCP setup and team practices (Data Engineering)',
  content, content_format: 'markdown', enable_heading_anchors: true, emoji: '🧭'
};
writeFileSync('confluence/last-payload.json', JSON.stringify(args));
console.log('Wrote confluence/last-payload.json');
"
```

Then use your client or MCP to POST the payload to Confluence; **do not commit** `last-payload.json` if you add real space metadata beyond the public draft (this repo is public).

## Files

| File | Purpose |
| --- | --- |
| `cursor-mcp-ds-team.page.md` | Full Confluence body (source of truth). |
| `README.md` | This file. |
