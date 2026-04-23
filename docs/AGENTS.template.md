<!-- Optional: copy to project root as AGENTS.md and customize. -->
<!-- The "Learned" sections below are placeholders — replace with your repo’s facts. -->

## MCP Tools: code-review-graph

**When the code-review-graph server is enabled:** use its MCP tools **before**
default file search for exploration, impact, and review — the graph is
token-efficient and gives structural context (callers, dependents, tests)
that Grep alone does not.

### When to use graph tools first

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph does not cover what you need.

### Key tools

| Tool | Use when |
| --- | --- |
| `detect_changes` | Reviewing code changes — risk-scored analysis |
| `get_review_context` | Source snippets for review — token-efficient |
| `get_impact_radius` | Blast radius of a change |
| `get_affected_flows` | Which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | High-level structure |
| `refactor_tool` | Renames, dead code |

### Workflow (typical)

1. Keep the graph current (rebuild/refresh per your project’s code-review-graph docs).
2. For review: `detect_changes` then `get_affected_flows` / `query_graph` for tests.
3. Fall back to file tools when the graph has no data for a path or language.

## Learned user preferences (fill in for your project)

- Add team conventions the agent should remember (e.g. test commands, “never touch folder X”).

## Learned workspace facts (fill in for your project)

- Add doc paths, service names, and internal links that are safe to share in-repo.
