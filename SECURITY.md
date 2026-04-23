# Security

## GitHub: enable secret scanning (repository owner)

Secret scanning and related options are turned on in the **GitHub web UI** (this
cannot be done by committing a file in the repo).

1. Open **Repository** → **Settings** → **Code security and analysis**  
   `https://github.com/abhinavsinhanutan/Cursor-Workbench/settings/security_analysis`
2. Under **Secret scanning**: turn **on** (for public repositories this is
   often available; for private org repos, your org’s plan and policies apply).
3. If available, enable **push protection** for secrets to block risky pushes
   before they land on the default branch.
4. Periodically **review** the **Security** tab (and any Dependabot/secret
   scanning alerts) and rotate credentials if a finding is real.

## Never copy your real workspace `mcp.json` into this kit repository

The file that Cursor uses on your machine, for example:

- `~/.cursor/mcp.json` (user-wide), or  
- a **parent** monorepo path such as `.../Documents/GitHub/.cursor/mcp.json`  

can contain **live** Personal Access Tokens, API keys, and internal server URLs
for **your** org.

**Do not** copy that file into **Cursor-Workbench** or add its contents in a
commit. This repository is meant to be **shareable**; only
**[config/mcp.json.example](config/mcp.json.example)** (placeholders) belongs
in git.

- Use the example file and [config/MCP.md](config/MCP.md) to reproduce the
  *shape* of your MCP config locally.
- Keep real values on your machine or in your org’s secret store.

## If a secret is exposed

1. **Revoke/rotate** the credential at the source (Tableau, Langfuse, etc.).
2. If it was committed, remove it from **history** (BFG, `git filter-repo`) or
   work with your security team; GitHub may also flag it after enabling secret
   scanning.
3. Prefer reporting sensitive issues through **GitHub → Security →
   Advisories** (private) if the project uses them.

## What this repo commits on purpose

- `*.example` and `mcp.json.example` with obvious placeholders.
- [hooks/langfuse-cursor-hook/.env.example](hooks/langfuse-cursor-hook/.env.example)
  with `pk-lf-xxxxxxxx` / `sk-lf-xxxxxxxx` style **dummy** values.

## `.gitignore` in this repository

[.gitignore](.gitignore) is configured to reduce accidental adds of local MCP
config. If you add new paths that might hold secrets, update `.gitignore` and
this document.
