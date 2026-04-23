# Styles and server for full slide builds

The `skills.md` workflow **copies** these into each generated deck output folder:

- `styles.css` — full deck stylesheet (large; not all orgs redistribute it).
- `serve.py` — optional static server for local preview.

## What this repository includes

| File | Location in this repo |
|------|------------------------|
| `serve.py` (minimal) | [`vendor/serve.py`](vendor/serve.py) — copy into the output folder or run from `vendor/`. |
| `styles.css` | **Not bundled** — add a compatible sheet that matches the class names in `layouts.md`, or supply your org’s house theme. |

## What to do

1. Obtain or write a `styles.css` that implements the class contract in `layouts.md` (dark theme, scene/chapter model, etc.).
2. Place `serve.py` next to `index.html` (copy from `vendor/serve.py` during generation) or use any static server: `python3 -m http.server 9090`.
3. Until `styles.css` exists, the skill is still useful for **structure and layout** (`layouts.md`, `app.js`, `example/`) — generated HTML will not match the final look without CSS.
