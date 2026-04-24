# Confluence: Cursor + MCP (DE) page

The draft page body is **[cursor-mcp-ds-team.page.md](cursor-mcp-ds-team.page.md)** (markdown ready for Confluence or the MCP `content` field).

**Target (example — Data Science space home as parent):**

- Space: `DataScience`
- Parent page id: `14454653` (from  
  `https://confluence.eng.nutanix.com:8443/spaces/DataScience/pages/14454653/...`)

## One-command publish (Bearer PAT, Confluence Data Center)

If **basic authentication is disabled** on your Confluence, use a **Confluence Personal Access Token** and the REST API (Bearer), not username + API token.

From this directory, on a machine that can reach `confluence.eng.nutanix.com:8443` (VPN if required):

```bash
export CONFLUENCE_URL='https://confluence.eng.nutanix.com:8443'
export CONFLUENCE_PERSONAL_TOKEN='<!-- create in Confluence → profile / personal access tokens -->'
export CONFLUENCE_PARENT_ID='14454653'
export CONFLUENCE_SPACE_KEY='DataScience'
# If your org uses a custom CA and Python fails TLS verification:
# export CONFLUENCE_SSL_VERIFY=0
python3 publish_to_confluence.py
```

The script posts HTML converted from the markdown file and prints the new page id and URL.

## Publishing when on the corporate network / VPN

In **~/.cursor/mcp.json**, `user-atlassian-local` should use **`CONFLUENCE_URL=https://confluence.eng.nutanix.com:8443`** (not `confluence.nutanix.com` unless that host resolves in your network). For Server/DC, set **`CONFLUENCE_PERSONAL_TOKEN`** per [mcp-atlassian authentication](https://mcp-atlassian.soomiles.com/docs/authentication) if you see *Basic Authentication has been disabled*.

The **user-atlassian-local** MCP `confluence_create_page` must reach your Confluence host. If you see DNS or connection errors from a sandbox, publish from a machine on VPN or your laptop.

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
