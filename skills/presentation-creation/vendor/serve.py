#!/usr/bin/env python3
"""Minimal static file server for local slide deck preview.

Default port 9090. Override with PORT=8080 in the environment.
Serves the current working directory. Run from the folder that contains
index.html, styles.css, and app.js.
"""
from __future__ import annotations

import http.server
import os
import socketserver

PORT = int(os.environ.get("PORT", "9090"))


def main() -> None:
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving http://127.0.0.1:{PORT}/  (Ctrl+C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
