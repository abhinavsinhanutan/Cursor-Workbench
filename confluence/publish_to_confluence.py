#!/usr/bin/env python3
"""
Create or update a Confluence page under a parent, using a Confluence Data Center
Personal Access Token (Bearer). Basic username/password API tokens often fail when
basic auth is disabled — use a PAT from your Confluence profile.

Usage (from repo root or this directory):
  export CONFLUENCE_PERSONAL_TOKEN='your-confluence-pat'
  export CONFLUENCE_URL='https://confluence.eng.nutanix.com:8443'   # optional
  export CONFLUENCE_PARENT_ID='14454653'
  export CONFLUENCE_SPACE_KEY='DataScience'
  python3 publish_to_confluence.py

Requires: pip install markdown (for table support)
"""
from __future__ import annotations

import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path

try:
    import markdown
except ImportError as e:
    print("Install markdown: pip install markdown", file=sys.stderr)
    raise SystemExit(1) from e

HERE = Path(__file__).resolve().parent
MD_FILE = HERE / "cursor-mcp-ds-team.page.md"


def main() -> None:
    token = os.environ.get("CONFLUENCE_PERSONAL_TOKEN", "").strip()
    if not token:
        print("Set CONFLUENCE_PERSONAL_TOKEN to your Confluence PAT (Bearer).", file=sys.stderr)
        raise SystemExit(2)

    base = os.environ.get("CONFLUENCE_URL", "https://confluence.eng.nutanix.com:8443").rstrip("/")
    parent_id = os.environ.get("CONFLUENCE_PARENT_ID", "14454653")
    space_key = os.environ.get("CONFLUENCE_SPACE_KEY", "DataScience")
    title = os.environ.get(
        "CONFLUENCE_PAGE_TITLE",
        "Cursor: first-time MCP setup and team practices (Data Engineering)",
    )

    md = MD_FILE.read_text(encoding="utf-8")
    html = markdown.markdown(
        md,
        extensions=["tables", "fenced_code", "nl2br", "sane_lists"],
    )

    payload: dict = {
        "type": "page",
        "title": title,
        "ancestors": [{"id": str(parent_id)}],
        "space": {"key": space_key},
        "body": {"storage": {"value": html, "representation": "storage"}},
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/rest/api/content",
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    ctx = ssl.create_default_context()
    if os.environ.get("CONFLUENCE_SSL_VERIFY", "1") == "0":
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code}: {err}", file=sys.stderr)
        raise SystemExit(1) from e

    out = json.loads(body)
    page_id = out.get("id", "?")
    webui = (out.get("_links") or {}).get("webui", "")
    print(f"Created page id={page_id}")
    if webui:
        print(f"URL: {base}{webui}")


if __name__ == "__main__":
    main()
