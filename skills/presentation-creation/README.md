# presentation-creation

A Cursor skill that turns a structured **markdown content document** into a
runnable static slide deck: plain `index.html` + `app.js` + `styles.css` +
`serve.py` — no build step, no framework.

## What you get

| Triggers (examples) | "create a presentation", "build a deck", "make slides" |
| --- | --- |
| Input | Markdown with YAML front-matter and per-slide sections (see `skills.md`) |
| Output | A folder you can open with a static server (see `vendor/serve.py` and [ASSETS_FOR_DECKS.md](ASSETS_FOR_DECKS.md) for `styles.css`) |

## One-line install (with this repo)

```bash
mkdir -p .cursor/skills
cp -R /path/to/cursor-workbench/skills/presentation-creation .cursor/skills/
```

## Worked example (agent)

Use a prompt like:

> Use the **presentation-creation** skill. Build a deck from
> `docs/talk-content.md` into `out/my-deck/`. Use **ambiguous-only** question
> mode. Summarize the plan before writing files.

Then run (after `styles.css` is in place, per [ASSETS_FOR_DECKS.md](ASSETS_FOR_DECKS.md)):

```bash
cd out/my-deck
python3 serve.py
# open http://127.0.0.1:9090
```

## Files in this folder

| File | Role |
| --- | --- |
| `skills.md` | Full contract for the agent (layouts, front-matter, checklists) |
| `layouts.md` | HTML snippets and layout names |
| `app.js` | Runtime (dynamic chapter/slide counts) |
| `example/content.md` | Small reference content file |
| `example/index.html` | Example generated HTML (needs `styles.css` to look correct) |
| `vendor/serve.py` | Minimal local static server you can copy into the deck folder |

## Limitation

A full **visual** theme for all layouts is not shipped here (file size and
licensing vary by org). You supply `styles.css` to match `layouts.md`, or use
the skill for structure and HTML only.
