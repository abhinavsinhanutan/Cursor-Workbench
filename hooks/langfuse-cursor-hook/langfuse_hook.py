#!/usr/bin/env python3
"""Cursor hook -> Langfuse bridge.

Runs as a single Python process per hook invocation. Reads a JSON payload
from stdin (the Cursor hook event), derives a deterministic Langfuse
trace id from the Cursor session id, and ships the event as a Langfuse
observation. Designed to fail open: any error is logged and swallowed so
Cursor is never blocked.
"""

from __future__ import annotations

import contextlib
import json
import os
import pathlib
import sys
import traceback
from datetime import datetime, timezone

_nullcontext = contextlib.nullcontext

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
LOG_FILE = SCRIPT_DIR / "langfuse.log"
ENV_FILE = SCRIPT_DIR / ".env"


def log(message: str) -> None:
    try:
        with LOG_FILE.open("a", encoding="utf-8") as f:
            ts = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
            f.write(f"[{ts}] {message}\n")
    except Exception:
        pass


def load_env_file(path: pathlib.Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), value)


def first_present(d: dict, *keys, default=None):
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return default


def derive_session_id(payload: dict) -> str:
    return first_present(
        payload,
        "conversation_id",
        "session_id",
        "sessionId",
        "cursorSessionId",
        default="cursor-unknown-session",
    )


def build_event_io(event_name: str, payload: dict) -> tuple[object, object, str]:
    """Return (input, output, as_type) for the given Cursor hook event."""
    as_type = "span"
    input_data = None
    output_data = None

    if event_name == "beforeSubmitPrompt":
        input_data = first_present(payload, "prompt", "user_prompt", "content")
    elif event_name == "afterAgentResponse":
        output_data = first_present(payload, "response", "content", "message", "text")
        as_type = "generation"
    elif event_name == "afterAgentThought":
        output_data = first_present(
            payload, "thought", "thinking", "reasoning", "content", "text"
        )
        as_type = "generation"
    elif event_name in ("preToolUse", "postToolUse"):
        input_data = first_present(payload, "tool_input", "input", "arguments")
        if event_name == "postToolUse":
            output_data = first_present(payload, "tool_output", "output", "result")
    elif event_name == "postToolUseFailure":
        input_data = first_present(payload, "tool_input", "input", "arguments")
        output_data = first_present(payload, "error", "failure", "output")
    elif event_name in ("beforeShellExecution", "afterShellExecution"):
        input_data = first_present(payload, "command", "cmd")
        if event_name == "afterShellExecution":
            output_data = {
                "output": first_present(payload, "output", "stdout"),
                "stderr": payload.get("stderr"),
                "exit_code": first_present(payload, "exit_code", "exitCode", "status"),
            }
    elif event_name in ("beforeMCPExecution", "afterMCPExecution"):
        input_data = {
            "server": first_present(payload, "server", "mcp_server"),
            "tool": first_present(payload, "tool_name", "tool"),
            "arguments": first_present(payload, "arguments", "tool_input", "input"),
        }
        if event_name == "afterMCPExecution":
            output_data = first_present(payload, "output", "result", "tool_output")
    elif event_name in ("sessionStart", "sessionEnd"):
        input_data = {
            "cwd": first_present(payload, "cwd", "workspace", "workspace_root"),
            "session_id": derive_session_id(payload),
        }
    elif event_name in ("beforeReadFile", "afterFileEdit"):
        input_data = first_present(payload, "file_path", "path", "tool_input")
        output_data = first_present(payload, "result", "tool_output", "diff")
    elif event_name == "stop":
        output_data = first_present(payload, "reason", "stop_reason")

    return input_data, output_data, as_type


def main() -> int:
    load_env_file(ENV_FILE)

    public_key = os.environ.get("LANGFUSE_PUBLIC_KEY")
    secret_key = os.environ.get("LANGFUSE_SECRET_KEY")
    host = (
        os.environ.get("LANGFUSE_HOST")
        or os.environ.get("LANGFUSE_BASE_URL")
    )

    if not (public_key and secret_key and host):
        log("missing LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_HOST; skipping")
        return 0

    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError as e:
        log(f"stdin is not valid JSON ({e}); raw={raw[:200]!r}")
        return 0

    event_name = first_present(
        payload, "hook_event_name", "event", "eventName", default="unknown"
    )
    session_id = derive_session_id(payload)

    try:
        from langfuse import Langfuse
    except Exception as e:
        log(f"langfuse import failed: {e}")
        return 0

    try:
        client = Langfuse(
            public_key=public_key,
            secret_key=secret_key,
            host=host,
            flush_at=1,
            flush_interval=0.1,
            timeout=5,
        )
    except Exception as e:
        log(f"Langfuse client init failed: {e}")
        return 0

    try:
        from langfuse import propagate_attributes
    except Exception as e:
        log(f"cannot import propagate_attributes: {e}")
        propagate_attributes = None

    try:
        trace_id = client.create_trace_id(seed=f"cursor-session::{session_id}")
        input_data, output_data, as_type = build_event_io(event_name, payload)

        tool_label = first_present(payload, "tool_name", "tool", "mcp_server")
        name = event_name + (f":{tool_label}" if tool_label else "")

        cursor_model = first_present(payload, "model")
        user_email = first_present(payload, "user_email", "user")
        workspace = first_present(
            payload, "cwd", "workspace", "workspace_root"
        )
        workspace_roots = payload.get("workspace_roots") or []
        if not workspace and workspace_roots:
            workspace = workspace_roots[0]
        workspace_tag = (
            pathlib.Path(workspace).name if workspace else "cursor-workspace"
        )

        metadata = {
            "hook_event_name": event_name,
            "session_id": session_id,
            "workspace": workspace,
            "cursor_version": first_present(payload, "cursor_version"),
            "cursor_model": cursor_model,
            "generation_id": first_present(payload, "generation_id"),
            "tool_use_id": first_present(payload, "tool_use_id"),
            "raw": payload,
        }

        propagated_attrs = {
            "session_id": str(session_id)[:200],
            "trace_name": "Cursor Session",
            "tags": [t for t in ["cursor", workspace_tag] if t],
        }
        if user_email:
            propagated_attrs["user_id"] = str(user_email)[:200]

        ctx = (
            propagate_attributes(**propagated_attrs)
            if propagate_attributes is not None
            else _nullcontext()
        )

        with ctx:
            if as_type == "generation":
                gen = client.start_observation(
                    trace_context={"trace_id": trace_id},
                    name=name,
                    as_type="generation",
                    input=input_data,
                    output=output_data,
                    metadata=metadata,
                    model=cursor_model or "cursor-agent",
                )
                gen.end()
            else:
                client.create_event(
                    trace_context={"trace_id": trace_id},
                    name=name,
                    input=input_data,
                    output=output_data,
                    metadata=metadata,
                )

        client.flush()
        log(
            f"sent event={event_name} session={session_id[:24]} "
            f"trace={trace_id[:12]} as_type={as_type}"
        )
    except Exception:
        log(f"exception while sending {event_name}:\n{traceback.format_exc()}")
    finally:
        try:
            client.shutdown()
        except Exception:
            pass

    return 0


if __name__ == "__main__":
    sys.exit(main())
