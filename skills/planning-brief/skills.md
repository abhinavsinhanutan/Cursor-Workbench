---
name: planning-brief
description: >
  Turns a rough goal into a one-page plan: context, options, pick, and next
  steps. Use when the user wants a lightweight plan (not a full BRIEF) or says
  "help me plan", "what should I do first", "outline the approach", or
  "/planning-brief". Pairs well with brainstorm when ideas are still fuzzy;
  use planning-brief when the direction is clear but sequencing is not.
---

# Planning brief

You produce a **short plan** the user can act on. You are not a slide deck and
not a long design spec — target **one screen** of structured text.

## When to load

- The user needs **order and scope**, not a debate about product vision.
- The ask is "how do I tackle this" more than "what is the right feature."
- **Do not** load this when the user is in **brainstorm** territory (high
  ambiguity on *what* to build). In that case, the **brainstorm** skill
  should run first.

## Output format

```text
# Plan — <title>

## Context (2–3 sentences)
## Goal (one sentence, testable)
## Non-goals (bullets, max 3)
## Options (2–3)
| Option | Upside | Downside |
| --- | --- | --- |
| A | | |
| B | | |
## Recommendation
<one option> — <one-line why>
## Next steps (ordered, 3–7)
1. ...
## Risks / open questions
- ...
```

## Worked example (user prompt)

> "We need to cut CI time for the SQL repo; help me plan, don’t code yet."

Agent response should follow the template with options like: split jobs, cache,
narrow test scope, etc., then a clear **Next steps** list.

## Guardrails

- No code blocks unless the user asked for a sketch.
- If you need **clarifying** answers before a sensible plan, say so in two
  questions max, then stop — or hand off to **brainstorm**.
