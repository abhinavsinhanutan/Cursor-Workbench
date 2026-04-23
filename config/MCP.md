# MCP servers (safe setup — no secrets in git)

This folder ships **[mcp.json.example](mcp.json.example)** with **placeholders
only. Your **real** config must live in:

- `~/.cursor/mcp.json` (user-wide), and/or
- `<project>/.cursor/mcp.json` (project-only),

or be added in **Cursor Settings → MCP**, depending on how you manage tools.

**Cursor does not automatically “prompt” for every secret** (e.g. a Tableau PAT
may need to be created in your server’s UI, then **you** paste it into the JSON
or Settings once). After that, keep the file with secrets **out of git** (this
repo’s [.gitignore](../.gitignore) lists `.cursor/mcp.json` for local clones
that use that path).

## Quick reference

| Server | You must provide (sensitive) | You must provide (non-secret) | Typical install |
| --- | --- | --- | --- |
| `tableau` | PAT name + **PAT secret**; often **site** URL and server URL | Absolute path to `tableau-mcp-server` on disk | Clone server repo, `node` + `args` in JSON |
| `code-review-graph` | Usually none (local `uvx`) | `uv`/`uvx` and Python on PATH | `uvx code-review-graph serve` |
| `charlotte` | None in template | Network for `npx` first run | `npx -y @ticktockbent/charlotte` |
| `playwright` | None in template | Network for `npx` first run | `npx -y @playwright/mcp@latest` |

Use **[.env.example](.env.example)** as a **local worksheet**: fill values in
that file (or your password manager), then copy the same keys into the `env`
object for `tableau` in your private `mcp.json`. **Do not commit** a filled
`.env`.

---

## `code-review-graph`

- **What it is:** Codebase knowledge-graph MCP (see your `AGENTS` / project docs
  for when to use graph tools first).
- **Secrets:** None in the default example; ensure `uvx` can run.
- **Configure:** Copy the `code-review-graph` block from [mcp.json.example](mcp.json.example)
  into your real `mcp.json`. If `uvx` is missing, install [uv](https://github.com/astral-sh/uv)
  (your org may standardize a version).

---

## `charlotte` (browser MCP)

- **What it is:** Lighter browser automation; good for first-pass page recon.
- **Secrets:** None in template.
- **Configure:** The `npx` stanza in [mcp.json.example](mcp.json.example) is
  enough for many setups; first run may download packages (needs network).

---

## `playwright` (Playwright MCP)

- **What it is:** Heavier browser MCP (a11y snapshots, code execution, etc.).
- **Secrets:** None in template.
- **Configure:** As in [mcp.json.example](mcp.json.example). Pin a version in
  `args` if you need reproducibility across machines.

---

## `tableau` (optional; org-specific)

- **What it is:** Tableau Server REST / workbook flows via a Node entrypoint
  (path in `args[0]` must be **your** clone of the server package).
- **Non-secret / structural:**
  - `args[0]`: absolute path to the server’s `index.js` (dev machine path will
    differ from teammates — **do not** commit a path that only works on one
    machine unless the repo is private and everyone agrees).
  - `TABLEAU_SERVER_URL`: HTTPS URL of your Tableau Server or Cloud (no secret).
  - `TABLEAU_SITE_CONTENT_URL`: often `""` for default site; set if your org uses
    non-default site slug.
- **Secret (you create in Tableau):**
  - `TABLEAU_PAT_NAME` — name of a **Personal Access Token** in Tableau.
  - `TABLEAU_PAT_SECRET` — the token string shown **once** when you create the
    PAT; store in your private `mcp.json` or paste from a vault — **never** push
    to GitHub.
- **Configure:**
  1. Create a PAT in Tableau’s UI (site settings / personal access tokens).
  2. Copy [mcp.json.example](mcp.json.example) to your private `mcp.json`.
  3. Set `args[0]`, `TABLEAU_SERVER_URL`, and the `env` fields. Replace
     placeholders; do not commit the result.
  4. **Rotate** the PAT if it was ever leaked (chat, log, or accidental commit).

---

## Verification (before you commit any repo)

- [ ] No `mcp.json` with real keys in a **shared** or **public** branch.
- [ ] [mcp.json.example](mcp.json.example) in **this** repo only has placeholders.
- [ ] Filled [`.env.example`](.env.example) worksheets live only on disk, **gitignored** if
      you name them `.env` (root [.gitignore](../.gitignore) covers `.env`).

## Related: Langfuse hook secrets

MCP and hooks are separate. **Langfuse** public/secret keys for
`hooks/langfuse-cursor-hook` belong in **`.cursor/hooks/.env`** (see
[../hooks/langfuse-cursor-hook/.env.example](../hooks/langfuse-cursor-hook/.env.example)),
not in this `config/.env` template unless you explicitly unify them (unusual).
