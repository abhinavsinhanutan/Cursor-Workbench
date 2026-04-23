#!/bin/bash
# MCP Governance Hook - requires confirmation for write operations on prod, Jira, and Atlassian
# Registered via Cursor Settings > cursor.hooks.beforeMCPExecution

SERVER="$MCP_SERVER_NAME"
TOOL="$MCP_TOOL_NAME"

case "$TOOL" in
  *get*|*search*|*list*|*read*|*find*|*query*|*fetch*)
    echo '{"decision": "allow"}'
    exit 0
    ;;
esac

case "$SERVER" in
  prod)
    echo '{"decision": "ask", "message": "PROD WRITE: '"$TOOL"' on prod database. Confirm?"}'
    exit 0
    ;;
  jira)
    echo '{"decision": "ask", "message": "JIRA WRITE: '"$TOOL"' will modify Jira (jira-mcp-server-pro). Confirm?"}'
    exit 0
    ;;
  atlassian|atlassian-local)
    # v0.21.0+ write paths (non-exhaustive; anything not matching *get*|*search*|... above still prompts):
    # jira_update_issue, jira_add_comment, jira_edit_comment, jira_transition_issue, jira_delete_issue,
    # jira_add_watcher, jira_remove_watcher, jira_add_issues_to_sprint, jira_update_proforma_form_answers,
    # confluence_create_page, confluence_update_page, confluence_delete_page, confluence_move_page,
    # confluence_add_comment, confluence_reply_to_comment, confluence_upload_attachment(s), confluence_delete_attachment, ...
    echo '{"decision": "ask", "message": "ATLASSIAN WRITE: '"$TOOL"' will modify Jira/Confluence. Confirm?"}'
    exit 0
    ;;
  notion)
    echo '{"decision": "ask", "message": "NOTION WRITE: '"$TOOL"' will modify Notion content. Confirm?"}'
    exit 0
    ;;
  salesforce)
    echo '{"decision": "ask", "message": "SFDC WRITE: '"$TOOL"' will modify Salesforce records. Confirm?"}'
    exit 0
    ;;
  airflow)
    echo '{"decision": "ask", "message": "AIRFLOW: '"$TOOL"' may trigger DAG runs or modify state. Confirm?"}'
    exit 0
    ;;
  gerrit)
    case "$TOOL" in
      *submit*|*review*|*comment*|*draft*|*label*|*abandon*|*restore*)
        echo '{"decision": "ask", "message": "GERRIT WRITE: '"$TOOL"' will modify a code review. Confirm?"}'
        exit 0
        ;;
    esac
    ;;
  *slack*)
    case "$TOOL" in
      *send*|*post*|*update*|*delete*|*react*|*upload*)
        echo '{"decision": "ask", "message": "SLACK WRITE: '"$TOOL"' will send/modify a Slack message. Confirm?"}'
        exit 0
        ;;
    esac
    ;;
esac

echo '{"decision": "allow"}'
