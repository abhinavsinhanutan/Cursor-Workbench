# Installing Cursor-Workbench pieces in a project

Use this when you want **rules**, **MCP config**, and **hooks** from this repo
on a real workspace. **Never commit** API keys, PATs, or Langfuse secrets.

## 1. Rules (`.cursor/rules/`)

```bash
cd /path/to/your/project
mkdir -p .cursor/rules
cp -R /path/to/cursor-workbench/rules/* .cursor/rules/
```

Cursor loads rules from `.cursor/rules/` (see Cursor docs for `*.mdc` rules).
If you already have rules, **merge** by filename — do not overwrite custom
files without a diff.

## 2. Skills and subagents (optional)

```bash
mkdir -p .cursor/skills .cursor/subagents
cp -R /path/to/cursor-workbench/skills/* .cursor/skills/
cp -R /path/to/cursor-workbench/subagents/* .cursor/subagents/
```

## 3. MCP configuration (no secrets in git)

1. Read **[config/MCP.md](../config/MCP.md)** — it lists each server, what is
   **sensitive** vs not, and that **Cursor may not prompt** for every token
   (you usually paste into your private `mcp.json` or **Settings → MCP** once).

2. Optionally use **[config/.env.example](../config/.env.example)** as a
   **worksheet** for Tableau values, then copy the same keys into the `env`
   block in your real config. **Do not commit** a filled `.env`.

3. Copy the **JSON example** only — edit locally with your paths and keys:

   ```bash
   cp /path/to/cursor-workbench/config/mcp.json.example /path/to/your-home/.cursor/mcp.json
   # or, for a single project:
   # cp .../mcp.json.example .cursor/mcp.json
   ```

4. Edit `mcp.json` and set:
   - **Tableau** (if used): absolute path to the Tableau MCP server, org URL,
     PAT name, and secret from your server’s **Personal Access Tokens** UI.
   - **Other servers**: per [MCP.md](../config/MCP.md) and their upstream docs;
     keep tokens out of version control.

5. **Rotate** any credential that was ever committed or pasted into a shared doc.

## 4. Hooks

### 4a Langfuse + MCP guard (from `hooks/langfuse-cursor-hook/`)

1. Copy scripts into `.cursor/hooks/`:

   ```bash
   cp /path/to/cursor-workbench/hooks/langfuse-cursor-hook/dispatch.sh .cursor/hooks/
   cp /path/to/cursor-workbench/hooks/langfuse-cursor-hook/langfuse_hook.py .cursor/hooks/
   cp /path/to/cursor-workbench/hooks/langfuse-cursor-hook/mcp-guard.sh .cursor/hooks/
   cp /path/to/cursor-workbench/hooks/langfuse-cursor-hook/install.sh .cursor/hooks/
   cp /path/to/cursor-workbench/hooks/langfuse-cursor-hook/.env.example .cursor/hooks/
   cd .cursor/hooks && bash install.sh
   ```

2. Edit `.cursor/hooks/.env` with Langfuse keys (file is gitignored by the
   bundle’s `.gitignore` if you copy that too).

3. **Merge** [hooks.json.example](hooks.json.example) into your project’s
   `.cursor/hooks.json` (start from that example if you have no hooks yet).

### 4b Local JSONL log (from `hooks/local-jsonl-log/`)

Optional second bundle for **append-only** file logging. **Merge** its
`hooks.json` stanzas with the Langfuse `hooks.json`: add the
`local_log.sh` command to the same events you want **both** behaviors, or
only a subset. Order within an event array usually does not matter for
read-only side effects; test both hooks after install.

**Example:** keep `afterAgentResponse` as Langfuse `dispatch.sh` and add
`local-jsonl-log`’s script as an additional entry in the same array if you
want dual logging.

## 5. AGENTS.md (optional)

Copy [AGENTS.template.md](AGENTS.template.md) to your repo root as
`AGENTS.md` and fill in project-specific learnings.

## Verification

- [ ] `git status` does not list `.cursor/mcp.json` with secrets if this repo
      is public — use a private clone or `mcp.json` with env-only references per
      your org.
- [ ] `rg 'sk-lf-|REPLACE_WITH|pk-lf-'` in the **committed** tree of this
      template repo should only hit placeholder examples.
