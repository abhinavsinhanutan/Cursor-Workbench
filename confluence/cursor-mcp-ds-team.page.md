# Cursor: first-time MCP setup and team practices (Data Engineering)

> **Audience:** Data Engineering and analytics engineering (SQL, pipelines, code review, Jira). If you work mostly in notebooks and rarely touch shared SQL repos, you can skip the Gerrit/SQL sections.
>
> **Purpose:** One place to learn how to **configure Model Context Protocol (MCP) servers in Cursor** safely, and how our team **uses Cursor** for delivery work (context, modes, review habits).

## What is MCP in Cursor?

**MCP** lets Cursor connect to **tools** (browsers, code graphs, databases, internal APIs) through a standard protocol. Each **MCP server** runs as a subprocess and exposes capabilities the model can call when needed.

- You **choose** which servers to enable; fewer servers means fewer things to secure and update.
- **Secrets** (tokens, PATs, API keys) belong in **local config** or your vault — **not** in git.

## Where MCP configuration lives

Real configuration must live **outside** copied templates, typically:

| Location | When to use |
| --- | --- |
| `~/.cursor/mcp.json` | **User-wide** — same tools in every project on this machine. |
| `<project>/.cursor/mcp.json` | **Project-only** — different tools per repo. |
| **Cursor → Settings → MCP** | Some teams prefer UI-first setup; still keep secrets out of shared repos. |

**Important:** Cursor does **not** auto-prompt for every secret. For example, a Tableau **Personal Access Token (PAT)** is created in the Tableau Server / Cloud UI; you paste it into your private JSON or Settings **once**, then keep that file out of version control.

Reference template (placeholders only): [Cursor-Workbench `config/mcp.json.example`](https://github.com/abhinavsinhanutan/Cursor-Workbench/blob/main/config/mcp.json.example) and the companion [MCP.md](https://github.com/abhinavsinhanutan/Cursor-Workbench/blob/main/config/MCP.md).

---

## First-time MCP setup (checklist)

### 1) Read the server list

Understand **what is sensitive** vs **non-secret** for each server you plan to enable. Example pattern (your org’s servers may differ — confirm with platform or security):

| Server (example) | Typically sensitive | Typically non-secret | Prereqs |
| --- | --- | --- | --- |
| `tableau` (optional) | PAT name and **PAT secret**; sometimes site | Server URL, absolute path to server `index.js` on **your** machine | Node, org Tableau access |
| `code-review-graph` | Usually none | `uv` / `uvx` on PATH | [uv](https://github.com/astral-sh/uv) |
| `charlotte` (browser) | None in template | Network for first `npx` download | Node / npm |
| `playwright` (browser) | None in template | Network for first `npx` download | Node / npm |

### 2) Use a local worksheet (optional)

For env-style keys, use a **local** `.env` worksheet if your team provides one, then copy values into the `env` object of the right server in **private** `mcp.json`. **Do not commit** a filled `.env`.

### 3) Copy the example, then edit locally

1. Start from your team’s **committed example only** (e.g. `mcp.json.example`), not from someone’s full personal file.
2. Copy to `~/.cursor/mcp.json` and/or `<project>/.cursor/mcp.json`.
3. Replace **placeholders** (paths, URLs, PATs). Machine-specific paths (e.g. absolute path to a Node server) should not be committed as “the” path unless the repo is private and the team agrees.

### 4) Tableau PAT (only if you use that server)

1. Create a PAT in the Tableau UI (Personal Access Tokens).
2. Set server URL, site content URL, PAT name, and PAT **secret** in your **private** config. The secret is shown **once** at creation.
3. If a PAT is ever exposed (chat, log, screenshot, accidental commit), **rotate** it in Tableau and update your local config.

### 5) Restart and verify

1. **Restart Cursor** after changing MCP config.
2. Open the MCP / tools panel and confirm each enabled server is **connected** (or read the error — often missing `uvx`, wrong path, or network).

### 6) Before you `git commit`

- [ ] No real `mcp.json` on a **public** or **shared** branch.
- [ ] Committed examples contain **only** placeholders.
- [ ] You have not pasted production credentials into a ticket, paste bin, or Confluence page.

**Related (optional):** telemetry hooks and Langfuse keys for hook bundles belong in their **own** local `.env` (e.g. under `.cursor/hooks/`) — not mixed into `mcp.json` unless your team standardizes that way.

---

## Best practices: Cursor for Data Engineering work

These habits align with team rules for **SQL, DDL, pipelines, Jira, and Gerrit**-style review.

### Context: give the model the real file

- If you ask about a **SQL or migration** file, **open it** in the editor or reference it with **`@path/to/file.sql`**. Pasting a fragment is OK for a quick question, but `@` is better so nothing important is left out.
- For multi-step work on the **same object**, keep the **same chat** when possible so review → tests → doc updates stay in one thread.

### Ask mode vs Agent mode

| You want to… | Suggested mode |
| --- | --- |
| **Explain, review, “what breaks if …”** | **Ask** — avoids accidental repo edits. |
| **Build, create, fix, generate, alter, migrate** | **Agent** — so the assistant can apply patches. |
| Mix both | Start in Ask for design review, then switch to Agent to implement. |

### Workflow nudges (order matters)

- **Before DDL or migrations:** Check **downstream impact** (lineage, consumers, breaking changes). Use your team’s **lineage/impact** skill or process.
- **Before code review (e.g. Gerrit):** Prefer a **review pass** on SQL/migrations; catch ownership, schema, and idempotency issues early.
- **Gerrit / review branches:** For teams using Gerrit, push to **`refs/for/<target-branch>`** for review instead of pushing directly to the shared branch, unless your runbook says otherwise.
- **After new tables/functions:** Plan **data quality tests** and **documentation** (even short) so the next person knows assumptions and edge cases.
- **After an incident fix:** Add a **regression test** or check and a short **prevention** note (runbook, alert, or ticket).
- **After performance work:** Re-run **EXPLAIN ANALYZE** (or your standard harness) to prove the win.

### SQL habits the team looks for (examples)

- **Schema-qualify** object names: `schema.table` — avoid ambiguous resolution.
- Avoid **`SELECT *`** in views, functions, and long-lived production queries; list columns.
- For **plpgsql** and similar, include **Jira / ticket** references in the header or modification history, per your SQL standards.
- Be careful with **date/time**: avoid bare `::date` casts on timestamps without a documented timezone policy; avoid hard-coded fiscal cutovers where a **dimension table** is the source of truth.
- For new **DDL** in managed repos, ensure **object owner** matches your runbook (e.g. `ALTER ... OWNER TO` **schema role** where required) before review.

**Note:** Orgs have different ECO/approval and naming rules — when in doubt, follow your **internal SQL style guide** Confluence page and ask your DBA or platform team.

### Optional: Cursor “skills” (if installed)

Skills are packaged prompts and workflows. Examples that often help DE work (install and names vary by workspace):

- **sql-code-reviewer** — structured review before push.
- **data-lineage-impact-analyzer** — who depends on this object?
- **pg-ddl-migration-generator** — align DDL with your migration style.
- **data-quality-test-generator** — quick checks after schema changes.
- **pipeline-incident-debugger** — post-incident structure.
- **pg-performance-tuner** — EXPLAIN and index suggestions.

Name the skill in chat when you use it so the team can reproduce the same workflow.

### Slack and outreach

For **Slack** messages on behalf of work (DMs, announcements): follow your team’s runbook. At minimum, **do not guess** a recipient; **confirm identity** and **message text** before anything sends. See your team’s **Slack / comms** documentation if a longer checklist applies.

### MCP for databases (if your workspace offers them)

- **Confirm environment** (dev / stage / prod) before running **read** diagnostics via MCP.
- **No destructive writes to prod** without explicit confirmation and an approved process.

### Jira and delivery

- Do **not** set **story points**, **due dates/ETA**, or **sprint** on Jira items **the assistant creates** unless a human explicitly asked for that field to be set.
- Keep **automation / deployment** tickets and **code review** links consistent with your **pg-metadata** (or SQL repo) runbook, including any separate **Deployment** or **Automation** Jira.
- If multiple Jira integrations exist in Cursor, **say which** your team should use for a given action to avoid split records.

---

## Quick glossary

| Term | Meaning |
| --- | --- |
| **MCP** | Model Context Protocol — tool bridge for the assistant. |
| **PAT** | Personal access token (e.g. Tableau); treat like a password. |
| `refs/for/...` | Gerrit’s review push ref (convention; exact branch names follow your org). |

---

## Related links

- [Cursor-Workbench (rules, skills, MCP example)](https://github.com/abhinavsinhanutan/Cursor-Workbench) — public kit; your org may use an **internal fork** with approved servers.
- [Cursor](https://cursor.com) product documentation.
- *Internal (add your org):* link to Gerrit / Git review guide, Jira project guide, and **Data Engineering SQL standards** Confluence space.

---

*This page is guidance, not a substitute for your org’s security, access, and change-management policies. Update server names and links when your team standardizes an approved MCP list.*
