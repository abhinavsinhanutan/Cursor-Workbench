---
name: presentation-creation
description: >
  Scaffolds a static HTML slide deck (vanilla HTML/CSS/JS, no build) from
  a slide-by-slide markdown content doc. Uses the layout catalog and
  `app.js` in this skill folder, plus a `styles.css` the user or org
  provides (see ASSETS_FOR_DECKS.md). Supports dark theme, multi-step
  reveals, code/IDE-style mocks, SVG flowcharts, and per-chapter accents
  (1–6) driven by the content doc. Triggers: "create a presentation", "build
  a deck", "make slides", "turn this outline into slides", or a path to
  a content doc.
---

# Build a static HTML slide deck (presentation-creation)

You produce a runnable static deck under a fresh folder, given a markdown
content doc that follows the convention in this skill. The deck’s **structure
and behavior** are defined by `app.js` and `layouts.md` in this folder, and
its **look** by `styles.css` (user-supplied — see [ASSETS_FOR_DECKS.md](ASSETS_FOR_DECKS.md)).
The title, presenter, chapter count, accents, and slide copy come from the
input doc.

You do NOT generate React, a build step, or a framework. The output is
plain `index.html` + `styles.css` + `app.js` + `serve.py`.

## Source files referenced by this skill (this repo)

All paths are relative to the `presentation-creation` skill folder
(`.cursor/skills/presentation-creation/` in the user’s project, or
`cursor-workbench/skills/presentation-creation/` in this repository).

| Path | What it is | How the skill uses it |
|---|---|---|
| `styles.css` | Full stylesheet for every layout class. | **Not included** in this repo. User/org adds a file that matches the contract in `layouts.md`. **Copy** into the new deck folder. Do not invent partial CSS unless the user asks for a minimal theme. |
| `vendor/serve.py` | Small static file server. | **Copy** into the new deck folder, or the user can run `python3 -m http.server`. |
| `app.js` | Dynamic chapter/slide counts (reads structure from the DOM). | **Copied verbatim** into the new deck folder. |
| `layouts.md` | Per-layout HTML reference with snippets for 12+ slide layouts. | **Read on demand** when emitting a slide. |
| `example/content.md` | A short example content doc. | **Read on demand** for the markdown convention. |
| `example/index.html` | Example generated output. | **Read on demand** to see how `content.md` maps to HTML. |

---

## Workflow

Copy this checklist when starting and tick items as you go:

```
- [ ] Step 1 — Locate the user's content doc and the target output folder
- [ ] Step 2 — Pick a question mode (ASK the user, do not assume)
- [ ] Step 3 — Parse the YAML front-matter into a presentation header
- [ ] Step 4 — For each slide section, resolve layout + body
- [ ] Step 5 — Run the design-question loop per the chosen mode
- [ ] Step 6 — Confirm the resolved plan with the user (one short summary)
- [ ] Step 7 — Scaffold the output folder (copy files, generate index.html)
- [ ] Step 8 — Tell the user how to run it (`python3 serve.py`)
```

### Step 1 — Locate inputs and outputs

Ask the user explicitly for:
- The path to the content doc (markdown).
- The output folder path. If they don't specify, propose a sibling folder
  next to the content doc, named after the deck title (kebab-cased), and
  confirm before creating.
- Whether an `assets/` folder already exists with media they intend to
  reference. Note its path.

Do not start parsing until both paths are confirmed.

### Step 2 — Pick a question mode

ASK the user which of these three modes they want for this run. This is
non-negotiable — the skill exists partly to ask design questions, and the
user controls how aggressive that questioning is.

Use the `AskQuestion` tool (single question, three options):

- **`per-slide`** — For every slide, surface the inferred layout +
  reveal-step count + accent + asset choices, and confirm before emitting.
  Best for first-time decks where the user wants tight control.
- **`ambiguous-only`** — Infer everything you can from the content doc.
  Only stop and ask when a slide's layout, reveal count, asset placement,
  or callout variant is genuinely ambiguous (e.g., the body is long enough
  for either a `two-col` or a `tip-slide`; or there's no `Asset:` line but
  the body says "show the demo video"). End with one consolidated
  "here's what I plan" summary.
- **`upfront`** — Ask all global questions in one batch up front (theme
  overrides, default layout, default accent, asset folder), then generate
  everything in one pass. Stop again only on hard ambiguity. Best for
  fast iteration when the user has already nailed the content doc.

### Step 3 — Parse the YAML front-matter

The content doc starts with a `---` fenced YAML block. Required keys:

```yaml
title: "AGENT FUNDAMENTALS"        # appears on landing
title-line-1: "AGENT"             # optional split for the gradient title
title-line-2: "FUNDAMENTALS"      # optional split
subtitle: "What every IDE-user should know."
presenter: "Your Name"
attribution: "Your org"
chapters:
  - title: "BASICS"
    subtitle: "Get oriented."
    accent: purple                 # purple | cyan | pink | green | orange | <hex>
  - title: "EXTENDING"
    subtitle: "Customize the setup."
    accent: cyan
final:
  headline: "Invest in your setup. It compounds."
  body: "Opinionated defaults and clear specs beat one-off heroics."
  signoff: "Thanks — {presenter} · {attribution}"   # or override literally
```

Defaults if a key is missing:
- `title-line-1` / `title-line-2`: split `title` on the first space.
- `subtitle`: empty (the `<p>` is omitted).
- `accent`: rotate through `purple → cyan → pink → green → orange` per
  chapter index.
- `final.signoff`: `"Thanks for coming. — {presenter} · {attribution}"`.

Special case — **no chapters** (`chapters: []` or key omitted):
- Treat the whole deck as a single chapter named after `title`.
- Render the landing with one part-card whose `data-part="1"`.
- The skill MUST still emit `<div id="chapter-1">` so the dynamic app.js
  picks it up.

### Step 4 — Parse each slide section

After the front-matter, every slide is one section beginning with a level-2
heading of this exact shape:

```
## <slide-id> [<layout>, <key>=<value>, ...]
```

- `<slide-id>` is the `data-slide` attribute (e.g. `1.0`, `1.4.1`, `3.3`).
  The chapter number is the integer before the first dot. Use it to assign
  the slide to its chapter.
- `<layout>` is one of the named layouts (see Layout Catalog below).
- Optional modifiers in brackets: `steps=N` (multi-step reveal),
  `accent=<color>` (override the chapter accent for this slide only),
  `class=<extra-class>` (additional CSS class on `<section class="slide">`).

Slide body is everything until the next `## ` heading. Within a slide body,
the following sub-conventions apply:

| Marker | Meaning |
|---|---|
| `Headline: <text>` | Becomes `<h2 class="slide-headline">`. |
| `Subtitle: <text>` | Becomes `<p class="slide-subtitle">`. |
| `Body: <text>` (or `Body:` followed by an indented block) | Becomes `<p class="slide-body stagger-item">`. |
| `### Left` / `### Right` | Splits the slide into a `.two-col` (only valid for `two-col` and similar layouts). |
| `> [callout, <variant>]\n> Title: <title>\n> - bullet\n> - bullet` | A `.callout`. Variants: `default`, `orange`, `purple`, `danger`. See layouts.md. |
| `[video: <path>]` | Embeds a `<video>` referencing `assets/<path>`. |
| `[image: <path>]` | Embeds an `<img>`. |
| `[svg: <description>]` | YOU generate an inline SVG matching the description, styled like `cmd-flow-svg` in the existing deck. See "SVG generation" below. |
| `[code: <lang>]\n... lines ...\n[/code]` | A single-tab `code-container`. For multi-tab, use `[code-tabs]\n[tab: name]\n...\n[/tab]\n[tab: name]\n...\n[/tab]\n[/code-tabs]`. |
| `[ide: <filename>]\n...\n[/ide]` | Renders an `ide-mock` tab + line-numbered editor. |
| `[explorer]\n- <path> [tag]\n...\n[/explorer]` | Renders an `explorer-panel` (file-tree mock). Items prefixed with `! ` get the `noise` class. |
| `[reveal step=N]` (anywhere in body) | Wraps the following block in `.substep.substep-N` so it appears at sub-step N of the slide's reveal sequence. |
| `[toc]\n- Indexing -> 1\n- Rules -> 3\n[/toc]` | Renders TOC tiles with `data-target="<n>"` (only valid in `chapter-opener`). |

If the user's body uses a marker not listed here, ASK before guessing.

### Step 5 — Run the design-question loop

In `per-slide` mode, for each slide present an `AskQuestion` with at most
3 questions covering ONLY the genuinely ambiguous dimensions for THAT
slide. Do not ask about things the content doc clearly specifies. Examples
of dimensions worth asking about:

- Layout choice when the body could fit two layouts (e.g., `two-col`
  vs `tip-slide`).
- Reveal step count when the body has 3+ distinct ideas (offer `1` /
  `len(ideas)` as options).
- Asset placement for `two-col` (left vs right of text).
- Accent override when the slide's tone differs from the chapter (e.g.,
  a danger callout in a "USING IT" chapter).

In `ambiguous-only` mode, only ask when at least one of these is true:
- The layout cannot be inferred (no layout in the heading + body has
  multiple plausible templates).
- An `[svg: ...]` description is too vague to render meaningfully.
- A required asset is referenced but missing AND the slide's purpose
  depends on it (e.g., a `caveman-compare` with no videos).

In `upfront` mode, batch these into one `AskQuestion` at the start:
- Default fallback layout for slides with no `[layout]` declared.
- Whether to fall back to placeholders for missing assets, or hard-error.
- Whether to split body paragraphs into reveal steps automatically when
  there are 3+ paragraphs.

### Step 6 — Confirm the plan

Before writing any file, output a tight summary:

```
Deck: "<title>" • <N> chapters • <total> slides
Output: <output-folder>/
Files to write:
  index.html      (~<n> KB, generated)
  app.js          (copied from skill)
  styles.css      (user/org theme; see ASSETS_FOR_DECKS.md)
  serve.py        (copy from this skill’s vendor/serve.py, or use http.server)
Assets folder: <path or "none">
Missing assets: <list, or "none">
```

Pause for the user to confirm or adjust. Do not write files until the user
says "go" / "ship" / equivalent.

### Step 7 — Scaffold the output

Create the output folder. Copy the four files listed above. Generate the
new `index.html` by:

1. Emitting the document head with theme overrides (CSS custom properties)
   for the requested chapter accents:

   ```html
   <style>
     :root {
       --part1-accent: <hex>;
       --part2-accent: <hex>;
       /* ... up to N ... */
     }
     /* For chapters beyond 3, also emit per-part rules: */
     .part-card[data-part="4"] .part-num { color: var(--part4-accent); }
     .part-card[data-part="4"]::before { background: linear-gradient(135deg, rgba(<r>,<g>,<b>,0.12), transparent 60%); }
   </style>
   ```

   Color name → hex map (should match the `:root` tokens in your `styles.css`):
   - `purple` → `#7c6aef`
   - `cyan` → `#38bdf8`
   - `pink` → `#f472b6`
   - `green` → `#4ade80`
   - `orange` → `#fb923c`

2. Emitting the landing block (`<div id="landing" class="scene active">`)
   with one `.part-card[data-part="N"]` per chapter.

3. For each chapter, emitting `<div id="chapter-N" class="chapter">` with
   each slide rendered per its layout (consult `layouts.md`).

4. Emitting the final slide (`<div id="final-slide" class="scene">`) with
   the headline/body/signoff from `final:` front-matter.

5. Emitting the four overlay elements at the end: `.wipe-overlay`,
   `.chapter-curtain-top`, `.chapter-curtain-bottom`, `.progress-bar`,
   `.kb-help` (the keyboard help dl).

6. Loading `<script src="app.js"></script>` last.

### Step 8 — Tell the user how to run it

End with:

```
Done. Deck written to <output-folder>/

To run:
    cd <output-folder>
    python3 serve.py
    open http://localhost:9090

Dev mode (asset zone outlines): http://localhost:9090/?dev=1
Keyboard: → / Space (next), ← (prev), Esc (back), 1..N (jump to chapter), ? (help)
```

---

## Layout catalog

For HTML snippets and exact class names, **read** `layouts.md` in this
skill folder. It has a section per layout. The summary below is just for
selection — do not try to write HTML from this table alone.

| Layout name | When to use | Key features |
|---|---|---|
| `chapter-opener` | First slide of each chapter. | Big chapter number, headline, subtitle, optional TOC tiles. |
| `two-col` | Text on one side, visual (image/video/diagram/code) on the other. Most common layout. | `.two-col` grid; left/right slots. |
| `code` | Code-only slide or text + code panel. | `.code-container` with one or more tabs (`.code-tab`). |
| `code-tabs` | Multi-language / multi-file code comparison. | Same as `code` but multiple tabs (auto-activates first). |
| `ide-mock` | Show a config file or short snippet styled as an editor. | `.ide-mock` with `.ide-tab-bar` + `.ide-editor`. Use `.ide-mock-tabbed` when comparing two files. |
| `explorer` | File-tree mock that highlights "noisy" files (e.g. for `.cursorignore` discussion). | `.explorer-panel` with `.ex-row`/`.noise` rows. |
| `callout-only` | A single big callout slide (rare). | `.callout` with one of 4 variants. |
| `card-grid` | Grid of feature cards (MCP fleet, scope cards, slash-cmd cards). | `.mcp-grid`, `.scope-grid`, or `.cmd-grid`. |
| `demo` | "Paste this prompt into Cursor" moment. | `.demo-prompt-box` with copy-to-clipboard button. |
| `caution` | Single-purpose warning slide with hero icon. | `.caution-slide`, big `&#9888;` icon, multi-step reveal. |
| `tip` | Single-tip slides (numbered, tagged). | `.tip-slide`, `.tip-num`, `.tip-headline`, `.tip-tag`. |
| `tip-split` | Tip slide with chart/visual on the right. | `.tip-slide.tip-split` with `.tip-split-row`. |
| `caveman-compare` | Side-by-side video comparison synced via x2 button. | `.caveman-compare` with two `.caveman-compare-item`. |
| `svg-flow` | Custom SVG flowchart with stepwise reveals. | `.cmd-flow-svg` + `.cmd-appear.cmd-sN` group classes driven by `step-ge-N`. |
| `final` | Reserved — auto-emitted from `final:` front-matter. | Don't request this as a layout. |

---

## SVG generation

When the content doc contains `[svg: <description>]`, the agent generates
an inline `<svg>` matching the description. Conventions:

- Use `viewBox="0 0 X Y"` (typical: `0 0 480 460`) and
  `preserveAspectRatio="xMidYMid meet"`.
- Apply class `cmd-flow-svg` for SVGs that sit in a `two-col` right slot.
- Stroke colors: `#7c6aef` (purple), `#38bdf8` (cyan), `#f472b6` (pink),
  `#4ade80` (green), `#fb923c` (orange), `#71717a` (neutral).
- Rectangles: `fill="#0f1017"` (matches `--bg-card`), `rx="8"` to `"10"`,
  `stroke-width="1.5"`.
- Text: `font-family="Inter, sans-serif"`, weight `600`–`700`,
  `fill="#e4e4e7"` for primary, `#71717a` for secondary.
- For arrowheads, define `<marker>` once in `<defs>` with id like `myArrow`.
- For stepwise reveals: wrap each step's elements in a `<g class="cmd-appear cmd-sN">`
  group. CSS in `styles.css` already styles these to fade in when the
  parent slide gets `step-ge-N`.

If the description in the content doc is vague (e.g. just "a flowchart"),
ASK the user for the boxes/arrows they want before generating. Do not
hallucinate a flowchart that misrepresents their content.

---

## Asset handling

Three rules, in priority order:

1. **If the user provided real assets** (images, videos), reference them
   by path. The skill DOES NOT copy assets — it just references them.
   The user is responsible for placing files at the referenced paths
   relative to the output folder.

2. **If an asset path is referenced but the file doesn't exist**, render a
   placeholder using `.video-placeholder` (for video/image) or a labeled
   dashed-box `<div class="video-placeholder"><div class="vp-icon">▶</div><div class="vp-label">missing: <path></div></div>`. Dev mode (`?dev=1`) makes
   these clearly visible. Do not block the build on missing assets.

3. **For diagrams** (`[svg: ...]`), generate inline SVG per the rules
   above. No external file needed.

---

## Branding overrides

Every visible string in the deck should come from the user’s content doc and
front-matter — do not hardcode a third party’s name or product into emitted
output. The mappings:

| Front-matter key | Where it appears in HTML |
|---|---|
| `title-line-1`, `title-line-2` | `.landing-title .line1`, `.landing-title .line2` |
| `subtitle` | `.landing-subtitle` |
| `presenter` | `.landing-attribution` (prefix), `.landing-avatar aria-label` |
| `attribution` | `.landing-attribution` (suffix) |
| `chapters[i].title` | `.part-card[data-part="i+1"] .part-title`, slide `.slide-headline` on chapter-opener |
| `chapters[i].subtitle` | `.part-card[data-part="i+1"] .part-subtitle`, chapter-opener `.slide-subtitle` |
| `chapters[i].accent` | The CSS variable `--part(i+1)-accent` |
| `final.headline` | Final slide `<h2>` |
| `final.body` | Final slide `<p class="stagger-item">` |
| `final.signoff` | Final slide footer `<div>` |

If the user provides a presenter avatar, expect it at
`assets/presenter.png` (matches the existing presentation). If absent,
the avatar circle still renders but shows the default background — fine.

---

## Anti-patterns to avoid

- DO NOT edit the **source** `app.js` in the skill folder; **copy** it into
  the output folder so the skill tree stays the template.
- The bundled `app.js` in this skill folder is required — do not swap in
  a variant with hardcoded per-chapter slide counts.
- DO NOT inline asset content (base64). Always reference by path.
- DO NOT skip Step 6 (the plan summary). Users have asked for tight
  control; surfacing the plan before writing files is the only way to
  preserve that control.
- DO NOT invent layouts not in the catalog. If the content doc asks for
  something you don't recognize, ASK the user which catalog entry to use.
- DO NOT emit `<div id="subchapter-1-5" class="chapter"></div>` (the empty
  placeholder in the source). It's vestigial in the original deck and has
  no purpose in a fresh one.

---

## Quality checklist before declaring done

```
- [ ] index.html validates as HTML5 (no orphan tags, proper nesting)
- [ ] Every chapter has at least one slide
- [ ] Every <section class="slide"> has a unique data-slide attribute
- [ ] Every multi-step slide has data-steps="N" matching the highest substep-N
- [ ] All asset references use forward slashes and relative paths
- [ ] Inline <style> in <head> defines --partN-accent for every chapter
- [ ] No example placeholder strings leaked into output unless the user’s
      content doc asked for them
- [ ] app.js, styles.css, serve.py exist in the output folder
- [ ] python3 serve.py from the output folder serves on http://localhost:9090
```
