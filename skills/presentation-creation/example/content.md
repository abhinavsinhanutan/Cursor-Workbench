---
title: "AGENT FUNDAMENTALS"
title-line-1: "AGENT"
title-line-2: "FUNDAMENTALS"
subtitle: "What every IDE-agent user should know."
presenter: "Jane Doe"
attribution: "Acme.ai"
chapters:
  - title: "BASICS"
    subtitle: "Three things to do on day one."
    accent: purple
  - title: "TIPS"
    subtitle: "Things you only learn the hard way."
    accent: cyan
final:
  headline: "Small habits compound."
  body: "Pick one tip from this deck and try it tomorrow."
  signoff: "Thanks for coming. — Jane Doe · Acme.ai"
---

## 1.0 [chapter-opener]
Subtitle: Three things to do on day one.

[toc]
- Indexing -> 1
[/toc]

## 1.1 [two-col, steps=2]
Headline: Indexing — your agent is only as smart as your index.
Body: Every retrieval the agent does runs through this index. Garbage in, garbage answers out.

### Left
> [callout]
> Title: Day-one checklist
> - Wait for the initial index to finish before asking @Codebase questions.
> - Add a .cursorignore for build artifacts and vendored code.
> - Re-index after you change .cursorignore — it does not pick it up automatically.

### Right
[image: indexing-diagram.png]

### [reveal step=1]
> [callout, orange]
> Title: One more thing
> Index custom external docs (specs, glossaries) so the agent knows your terms before reading code.

## 2.0 [chapter-opener]
Subtitle: Things you only learn the hard way.

## 2.1 [tip, num=01, tag=Prompting]
Headline: End coding prompts with "a senior engineer will review your code."
Body: One sentence at the end of your prompt. The model second-guesses itself before you see the output. Works best with frontier models.

[caveat]
Not magic. If your prompt is vague to begin with, this won't fix it.
[/caveat]

## 2.2 [code]
Headline: cursor-agent — your terminal is the new chat box.
Body: The full agent loop, headless, scriptable.

[code: bash]
# One-shot, read-only (default)
$ cursor-agent -p "What does src/auth do?"

# Let it actually edit files
$ cursor-agent -p --force "Refactor utils.js to ES6 modules"

# Structured output for scripts / CI
$ cursor-agent -p --output-format json \
    "List all TODO comments" | jq
[/code]
