# Layout reference

Per-layout HTML patterns. Each entry shows the markdown convention from the
content doc on the LEFT and the HTML the skill should emit on the RIGHT.
Class names must match the compiled `styles.css` for the deck — do not invent new
ones; if a layout you need isn't here, ask the user.

Color tokens used throughout (defined in your `styles.css` `:root`):
- `--accent`, `--accent-bright`, `--accent-cyan`, `--accent-pink`,
  `--accent-green`, `--accent-orange`
- `--text`, `--text-dim`, `--text-muted`
- `--bg`, `--bg-card`, `--bg-elevated`, `--bg-code`
- `--part1-accent`, `--part2-accent`, `--part3-accent` (extend as needed
  per chapter count)

---

## chapter-opener

First slide of every chapter. Big chapter number, headline, optional
subtitle, optional TOC tile grid.

**Markdown:**

```
## 1.0 [chapter-opener]
Subtitle: Use Cursor better — without writing a single config file.

[toc]
- Indexing -> 1
- Cursor Rules -> 3
- Subagents -> 4
[/toc]
```

**HTML emitted:**

```html
<section class="slide" data-slide="1.0">
  <div class="slide-inner chapter-opener">
    <div class="chapter-hero-num" style="color:var(--part1-accent)">01</div>
    <h2 class="slide-headline stagger-item"
        style="background:linear-gradient(135deg,#fff 0%,var(--accent-bright) 100%);
               -webkit-background-clip:text;-webkit-text-fill-color:transparent;
               background-clip:text">{chapter.title}.</h2>
    <p class="slide-subtitle stagger-item">{Subtitle}</p>
    <div class="toc-grid">
      <button class="toc-tile stagger-item" data-target="1">Indexing</button>
      <button class="toc-tile stagger-item" data-target="3">Cursor Rules</button>
      <button class="toc-tile stagger-item" data-target="4">Subagents</button>
    </div>
  </div>
</section>
```

The gradient on `.slide-headline` should swap its second color stop to
match the chapter accent (`--accent-bright` for purple, `--accent-cyan`
for cyan, `--accent-pink` for pink, etc).

---

## two-col

Text on one side, visual on the other. Default split is 50/50; for 40/60
use the modifier `[two-col, ratio=40-60]` and emit `.two-col-40-60`.

**Markdown:**

```
## 1.1 [two-col, steps=2]
Headline: Indexing — your agent is only as smart as your index.
Body: Cursor builds an embedding index of your workspace.

### Left
> [callout]
> Title: What happens under the hood
> - Cursor scans every file in your workspace
> - Each file is chunked, embedded, and stored
> - Agent queries retrieve the most relevant chunks

### Right
[video: indexing.mp4]

### [reveal step=1]
> [callout, orange]
> Title: Beyond the workspace — @Docs
> Index custom external docs that aren't part of your repo.
```

**HTML emitted:**

```html
<section class="slide" data-slide="1.1" data-steps="2">
  <div class="slide-inner">
    <div class="two-col" style="align-items:center">
      <div>
        <h2 class="slide-headline">Indexing
          <span style="font-weight:300;color:var(--text-dim)">— your agent is only as smart as your index.</span>
        </h2>
        <p class="slide-body stagger-item">Cursor builds an embedding index of your workspace.</p>
        <div class="callout stagger-item">
          <div class="callout-title">What happens under the hood</div>
          <ul>
            <li>Cursor scans every file in your workspace</li>
            <li>Each file is chunked, embedded, and stored</li>
            <li>Agent queries retrieve the most relevant chunks</li>
          </ul>
        </div>
      </div>
      <div class="stagger-item">
        <div style="overflow:hidden;border-radius:14px;border:1px solid var(--border);
                    background:var(--bg-card);line-height:0">
          <video src="assets/indexing.mp4" autoplay muted loop playsinline controls
                 style="width:100%;height:auto;display:block"></video>
        </div>
      </div>
    </div>
    <div class="reveal-stack rs-1">
      <div class="callout substep substep-1"
           style="margin:0;border-left-color:var(--accent-orange);background:rgba(251,146,60,0.06)">
        <div class="callout-title" style="color:var(--accent-orange)">Beyond the workspace — @Docs</div>
        <p style="font-size:0.85rem;color:var(--text-dim);line-height:1.6;margin:0">
          Index custom external docs that aren't part of your repo.
        </p>
      </div>
    </div>
  </div>
</section>
```

If the headline contains an em-dash followed by a tagline, split it: the
part before the dash stays bright, the part after the dash gets the
dimmed `<span>` treatment shown above.

---

## code

Single-tab code panel. Use for one-off code snippets.

**Markdown:**

```
## 2.1 [code]
Headline: cursor-agent — your terminal is the new chat box.
Body: The full agent loop, headless from your shell.

[code: bash]
$ cursor-agent -p "What does src/auth do?"
$ cursor-agent -p --force "Refactor utils.js to ES6 modules"
[/code]
```

**HTML emitted:**

```html
<section class="slide" data-slide="2.1">
  <div class="slide-inner">
    <h2 class="slide-headline">cursor-agent
      <span style="font-weight:300;color:var(--text-dim)">— your terminal is the new chat box.</span>
    </h2>
    <p class="slide-body stagger-item">The full agent loop, headless from your shell.</p>
    <div class="code-container stagger-item">
      <div class="code-tabs">
        <button class="code-tab active" role="tab">terminal</button>
        <div class="code-tab-indicator"></div>
      </div>
      <div class="code-body">
        <div class="code-panel active"><span class="cmt"># One-shot, read-only (default)</span>
$ cursor-agent <span class="kw">-p</span> <span class="str">"What does src/auth do?"</span>
$ cursor-agent <span class="kw">-p --force</span> <span class="str">"Refactor utils.js to ES6 modules"</span></div>
      </div>
    </div>
  </div>
</section>
```

Syntax token spans (must wrap by hand — there is no JS highlighter):
- `<span class="kw">...</span>` for keywords / flags (cyan)
- `<span class="str">...</span>` for strings (green)
- `<span class="cmt">...</span>` for comments (muted italic)

---

## code-tabs

Multi-tab code container. Tabs are clickable; first activates by default
(handled by `setupCodeTabs()` in app.js).

**Markdown:**

```
## 1.5 [code-tabs]
Headline: Skills — reusable agent workflows.

[code-tabs]
[tab: SKILL.md]
---
name: deploy-staging
description: Deploy current branch to staging
---

## Steps
1. Run lint & type-check
2. Build Docker image
[/tab]
[tab: deploy.sh]
#!/bin/bash
set -euo pipefail
docker build .
[/tab]
[/code-tabs]
```

**HTML emitted:**

```html
<div class="code-container stagger-item">
  <div class="code-tabs">
    <button class="code-tab active" role="tab">SKILL.md</button>
    <button class="code-tab" role="tab">deploy.sh</button>
    <div class="code-tab-indicator"></div>
  </div>
  <div class="code-body">
    <div class="code-panel active"><span class="cmt">---</span>
<span class="kw">name</span>: deploy-staging
<span class="kw">description</span>: Deploy current branch to staging
<span class="cmt">---</span>

<span class="cmt">## Steps</span>
1. Run lint &amp; type-check
2. Build Docker image</div>
    <div class="code-panel"><span class="cmt">#!/bin/bash</span>
<span class="kw">set</span> -euo pipefail
docker build .</div>
  </div>
</div>
```

---

## ide-mock

A single-file editor mock with a tab bar and line-numbered editor body.
Used for showing config files (`.cursorignore`, `mcp.json`, `hooks.json`).

**Markdown:**

```
## 1.2 [ide-mock]
Headline: .cursorignore — curate what gets indexed.

[ide: .cursorignore]
# Build artifacts
build/
CMakeLists.txt
Makefile

# CI/CD & tooling
.gitlab-ci.yml
jenkins/
[/ide]
```

**HTML emitted:**

```html
<div class="ide-mock">
  <div class="ide-tab-bar">
    <div class="ide-tab"><span class="tab-icon">&#9670;</span> .cursorignore <span class="tab-close">&times;</span></div>
  </div>
  <div class="ide-editor">
    <div class="ide-line"><span class="ide-linenum">1</span><span class="ide-linetext"><span class="cmt"># Build artifacts</span></span></div>
    <div class="ide-line"><span class="ide-linenum">2</span><span class="ide-linetext">build/</span></div>
    <div class="ide-line"><span class="ide-linenum">3</span><span class="ide-linetext">CMakeLists.txt</span></div>
    <div class="ide-line"><span class="ide-linenum">4</span><span class="ide-linetext">Makefile</span></div>
    <div class="ide-line"><span class="ide-linenum">5</span><span class="ide-linetext">&nbsp;</span></div>
    <div class="ide-line"><span class="ide-linenum">6</span><span class="ide-linetext"><span class="cmt"># CI/CD &amp; tooling</span></span></div>
    <div class="ide-line"><span class="ide-linenum">7</span><span class="ide-linetext">.gitlab-ci.yml</span></div>
    <div class="ide-line"><span class="ide-linenum">8</span><span class="ide-linetext">jenkins/</span></div>
  </div>
</div>
```

For empty lines, emit `&nbsp;` (a literal blank `<span>` collapses).

For multi-tab IDE comparisons (e.g., Playwright vs Charlotte mcp.json):
use `.ide-mock-tabbed` with multiple `.ide-tab` and matching
`.ide-editor-tab` panels — `setupIdeMockTabs()` wires them up.

---

## explorer

File-tree mock that highlights "noisy" files for indexing/ignore
discussions. Items prefixed with `! ` get the `.noise` class (dimmed).

**Markdown:**

```
[explorer: CTRL_PLANE_PC_SERVER]
- go_lazan/
- lazan/
- metropolis/
! .go/ [env]
! .python/ [env]
- qa/ [QA]
! hooks/ [git hooks]
! jenkins/ [CI]
! Makefile [build]
[/explorer]
```

**HTML emitted:**

```html
<div class="explorer-panel">
  <div class="explorer-header">EXPLORER: CTRL_PLANE_PC_SERVER</div>
  <div class="explorer-body">
    <div class="ex-row is-dir"><span class="ex-arrow">&#9656;</span><span class="ex-icon folder">&#128193;</span><span class="ex-name">go_lazan</span></div>
    <div class="ex-row is-dir"><span class="ex-arrow">&#9656;</span><span class="ex-icon folder">&#128193;</span><span class="ex-name">lazan</span></div>
    <div class="ex-row is-dir"><span class="ex-arrow">&#9656;</span><span class="ex-icon folder">&#128193;</span><span class="ex-name">metropolis</span></div>
    <div class="ex-row is-dir noise"><span class="ex-arrow">&#9656;</span><span class="ex-icon folder">&#128193;</span><span class="ex-name">.go</span><span class="ex-tag">env</span></div>
    <div class="ex-row is-dir noise"><span class="ex-arrow">&#9656;</span><span class="ex-icon folder">&#128193;</span><span class="ex-name">.python</span><span class="ex-tag">env</span></div>
    <div class="ex-row is-dir"><span class="ex-arrow">&#9656;</span><span class="ex-icon folder">&#128193;</span><span class="ex-name">qa</span><span class="ex-tag">QA</span></div>
    <div class="ex-row is-dir noise"><span class="ex-arrow">&#9656;</span><span class="ex-icon folder">&#128193;</span><span class="ex-name">hooks</span><span class="ex-tag">git hooks</span></div>
    <div class="ex-row is-dir noise"><span class="ex-arrow">&#9656;</span><span class="ex-icon folder">&#128193;</span><span class="ex-name">jenkins</span><span class="ex-tag">CI</span></div>
    <div class="ex-row noise"><span class="ex-indent"></span><span class="ex-icon file-make">M</span><span class="ex-name">Makefile</span><span class="ex-tag">build</span></div>
  </div>
</div>
```

Item types and their icons:
- Directory (ends with `/`): `<span class="ex-arrow">▸</span><span class="ex-icon folder">📁</span>`
- File ending in `.txt`: `<span class="ex-icon file-txt">▫</span>`
- `.sh`: `<span class="ex-icon file-sh">$</span>`
- `Makefile`/`*.cmake`: `<span class="ex-icon file-make">M</span>`
- `.gitignore`/`.git*`: `<span class="ex-icon file-git">◆</span>`
- `.yml`/`.yaml`: `<span class="ex-icon file-yml">⚙</span>`
- Other: `<span class="ex-icon file-cfg">☰</span>`

---

## callout

Inline callout block. Used inside other layouts (especially `two-col`),
not usually as a standalone slide. Four variants:

| Variant | Border-left color | Title color | Background |
|---|---|---|---|
| `default` | `var(--accent)` (purple) | `var(--accent-cyan)` | `var(--bg-elevated)` |
| `orange` | `var(--accent-orange)` | `var(--accent-orange)` | `rgba(251,146,60,0.06)` |
| `purple` | `var(--accent-bright)` | `var(--accent-cyan)` | (uses `.callout-purple-accent`) |
| `danger` | `#ef4444` | `#ef4444` | `rgba(239,68,68,0.06)` |

**Markdown:**

```
> [callout, orange]
> Title: From experience
> - Use this when X
> - Avoid Y
> Text after a bullet block becomes a <p>.
```

**HTML emitted (orange variant):**

```html
<div class="callout" style="margin:0;border-left-color:var(--accent-orange);background:rgba(251,146,60,0.06)">
  <div class="callout-title" style="color:var(--accent-orange)">From experience</div>
  <ul>
    <li>Use this when X</li>
    <li>Avoid Y</li>
  </ul>
  <p style="font-size:0.85rem;color:var(--text-dim);line-height:1.6;margin:0">
    Text after a bullet block becomes a &lt;p&gt;.
  </p>
</div>
```

For substep reveal, add `substep substep-N` to the `<div class="callout">`.

---

## card-grid

Grid of feature cards. Three flavors map to the existing CSS:

| Flavor | Class | Use case |
|---|---|---|
| `mcp` | `.mcp-grid` + `.mcp-card` | Service/tool catalog (MCP fleet). Each card has icon + name + 1-line desc. |
| `scope` | `.scope-grid` + `.scope-card` | Scope cards (workspace vs system, etc). Has badge + path + description. |
| `cmd` | `.cmd-grid` + `.cmd-card[data-target]` | Slash-command teaser cards that link to a deeper slide. |

**Markdown (mcp flavor):**

```
## 1.7 [card-grid, flavor=mcp]
Headline: MCP — our biggest advantage with Cursor.
Body: Model Context Protocol lets the agent talk to your systems.

[cards]
- icon: 📦
  name: Jita
  desc: Search support bundles, run commands on servers.
- icon: 💎
  name: Diamond
  desc: Discover & analyze bundles; saved reports.
[/cards]
```

**HTML emitted:**

```html
<div class="mcp-grid stagger-item">
  <div class="mcp-card">
    <div class="mcp-card-icon">&#128230;</div>
    <div class="mcp-card-name">Jita</div>
    <div class="mcp-card-desc">Search support bundles, run commands on servers.</div>
  </div>
  <div class="mcp-card">
    <div class="mcp-card-icon">&#128142;</div>
    <div class="mcp-card-name">Diamond</div>
    <div class="mcp-card-desc">Discover &amp; analyze bundles; saved reports.</div>
  </div>
</div>
```

For `cmd-card`, the convention adds `target: <slide-index>` per item and
emits `data-target="N"` on the button — this wires up TOC-style click
navigation handled by `setupTocTiles()`.

---

## demo

The "paste this prompt into Cursor" slide. Single-purpose, with the
copy-to-clipboard chevron button and DEMO hero text.

**Markdown:**

```
## 1.7.1 [demo]
Prompt: |
  use [Atlassian] and [GitHub MCP] to get all data about the employee
  "user@example.com" — total tickets, work history.
  Use [/canvas] to view it.
```

Square-bracketed terms in the prompt get the `.demo-kw` (cyan keyword)
treatment; quoted strings get `.demo-str` (green); two-line prompts use
`<br>` between lines.

**HTML emitted:**

```html
<section class="slide" data-slide="1.7.1">
  <div class="slide-inner demo-slide">
    <div class="demo-hero">
      <h1 class="demo-title" aria-label="Demo">DEMO</h1>
    </div>
    <div class="demo-prompt-box" role="group" aria-label="Prompt to paste into Cursor">
      <div class="demo-prompt-header">
        <span class="demo-prompt-dot"></span>
        <span class="demo-prompt-dot"></span>
        <span class="demo-prompt-dot"></span>
        <span class="demo-prompt-label">Cursor &rsaquo; New Chat</span>
      </div>
      <div class="demo-prompt-body">
        <p class="demo-prompt-text">
          use <span class="demo-kw">Atlassian</span> and <span class="demo-kw">GitHub MCP</span>
          to get all data about the employee <span class="demo-str">"user@example.com"</span>
          — total tickets, work history.<br>
          Use <span class="demo-kw">/canvas</span> to view it.
        </p>
      </div>
      <div class="demo-prompt-footer">
        <span class="demo-hint"><kbd class="demo-kbd">&#8984;</kbd> + <kbd class="demo-kbd">V</kbd> to paste</span>
        <button type="button" class="demo-send-btn" data-demo-copy aria-label="Copy prompt to clipboard">
          <svg class="demo-send-icon demo-send-icon-default" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 7 L11 7 M7 3 L11 7 L7 11" fill="none" stroke="currentColor" stroke-width="1.6"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="demo-send-icon demo-send-icon-copied" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 7.2 L6 10.2 L11 4.2" fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</section>
```

The copy button is wired by `setupDemoPromptCopy()` in app.js — emit it
exactly as shown.

---

## caution

Single-purpose hero-warning slide. Big `⚠` icon at the top, then body
content reveals across 4–5 substeps.

**Markdown:**

```
## 1.4.1 [caution, steps=5]
Headline: Subagents default to Composer 2 (Kimi K2.5)
Detail: Our org blocks Composer 2 — so in basic mode, the Task tool never surfaces and subagents are silently unavailable.

### [reveal step=3]
Workaround: enable MAX mode with a supported model. The Task tool reappears and subagents work normally.
[image: subagent-basic-blocked.png] (label: Basic mode — Task absent)

### [reveal step=4]
[image: subagent-max-works.png] (label: MAX mode — subagent starts)
```

**HTML emitted:** see `example/index.html` in this skill slide `1.4.1` (lines
~461–486) for the full structure. Key skeleton:

```html
<section class="slide" data-slide="1.4.1" data-steps="5">
  <div class="slide-inner caution-slide">
    <div class="caution-icon-wrap">
      <span class="caution-icon">&#9888;</span>
    </div>
    <div class="caution-body">
      <div class="caution-block substep substep-2">
        <p class="caution-headline">{Headline}</p>
        <p class="caution-detail">{Detail}</p>
      </div>
      <div class="caution-block substep substep-3">
        <p class="caution-detail"><strong class="caution-green">Workaround:</strong> {workaround text}</p>
        <div class="caution-proof-grid">
          <figure class="caution-proof caution-proof-bad">
            <figcaption class="caution-proof-label caution-proof-label-bad">Basic mode — Task absent</figcaption>
            <img src="assets/subagent-basic-blocked.png" alt="..."/>
          </figure>
          <figure class="caution-proof caution-proof-good substep substep-4">
            <figcaption class="caution-proof-label caution-proof-label-good">MAX mode — subagent starts</figcaption>
            <img src="assets/subagent-max-works.png" alt="..."/>
          </figure>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## tip

Numbered single-tip slide. Standard for "MASTERING IT"-style chapters
where each slide is one tactic.

**Markdown:**

```
## 3.5 [tip, num=05, tag=Models]
Headline: Summon depth with `ultraplan` / `ultrathink`.
Body: On the latest Claude models, these keywords unlock extended thinking budgets.

[keyword-pills]
- ultraplan
- ultrathink (secondary)
[/keyword-pills]

[caveat]
T&C apply, YMMV. Sometimes it beats Superpowers; sometimes Claude over-thinks.
[/caveat]
```

Tag values map to colored tip-tag classes:
- `Tooling` → `.tip-tag-tooling` (cyan)
- `Tokens` / `Token Tricks` → `.tip-tag-tokens` (yellow)
- `Models` → `.tip-tag-models` (purple)
- `Prompting` → `.tip-tag-prompting` (pink)
- `Security` → `.tip-tag-security` (red)

**HTML emitted:**

```html
<section class="slide" data-slide="3.5">
  <div class="slide-inner tip-slide">
    <div class="tip-tag tip-tag-models stagger-item">Models</div>
    <div class="tip-num stagger-item">05</div>
    <h2 class="tip-headline stagger-item">
      Summon depth with <span style="color:#a5b4fc">ultraplan</span> /
      <span style="color:var(--accent-bright)">ultrathink</span>.
    </h2>
    <p class="tip-body stagger-item">
      On the latest Claude models, these keywords unlock extended thinking budgets.
    </p>
    <div class="keyword-pills stagger-item">
      <div class="keyword-pill">ultraplan</div>
      <div class="keyword-pill secondary">ultrathink</div>
    </div>
    <div class="tip-caveat stagger-item">
      <span class="tip-caveat-icon">&#9888;</span>
      <span class="tip-caveat-text">
        <strong>T&amp;C apply, YMMV.</strong> Sometimes it beats Superpowers; sometimes Claude over-thinks.
      </span>
    </div>
  </div>
</section>
```

---

## tip-split

Tip slide with a chart/visual on the right (e.g., the prompt-specificity
pie chart). Same vocabulary as `tip` but split into `.tip-split-left` and
`.tip-split-right`.

**Markdown:**

```
## 3.7 [tip-split, num=07, tag=Prompting]
Headline: Check your Prompt Specificity pie chart.
Body: If Low or Medium dominates, you're burning tokens.

### Right
[svg: a donut chart with 3 segments — High 73.7%, Medium 22.4%, Low 3.9%]
```

The right column is whatever visual the content asks for — usually an SVG
generated per the SVG section of `skills.md`.

---

## caveman-compare

Side-by-side video comparison with a single shared x2 toggle button.

**Markdown:**

```
## 3.3.1 [caveman-compare]
Left: { label: "With caveman", video: caveman-with.mov }
Right: { label: "Without caveman", video: caveman-without.mov }
```

**HTML emitted:**

```html
<section class="slide" data-slide="3.3.1">
  <div class="slide-inner caveman-compare-slide">
    <button type="button" class="caveman-speed-btn" data-caveman-speed aria-label="Toggle playback speed">
      <span class="caveman-speed-label">x1</span>
    </button>
    <div class="caveman-compare">
      <div class="caveman-compare-item">
        <span class="caveman-compare-label with">With caveman</span>
        <video class="caveman-compare-video" src="assets/caveman-with.mov"
               muted playsinline controls data-play-on-active></video>
      </div>
      <div class="caveman-compare-item">
        <span class="caveman-compare-label without">Without caveman</span>
        <video class="caveman-compare-video" src="assets/caveman-without.mov"
               muted playsinline controls data-play-on-active></video>
      </div>
    </div>
  </div>
</section>
```

The `data-play-on-active` attribute makes both videos auto-play (and
auto-pause on slide exit). The `data-caveman-speed` button is wired by
`setupCavemanSpeedButton()` in app.js — flips both videos to 2x and back.

---

## svg-flow

A custom SVG flowchart with stepwise reveal. Used for the
`/worktree`, `/best-of-n`, hook-pipeline, and similar process diagrams.

**Markdown:**

```
## 1.6.1 [two-col, steps=8]
Headline: /worktree — an isolated sandbox for the agent.
Body: Spawns a fresh git worktree on a new branch.

### Right
[svg: Flowchart with 6 reveal steps:
  1. "your repo · main" box (cyan stroke)
  2. arrow + "/worktree" label + "worktree branch agent/feat-xyz" box
  3. arrow + "agent edits · commits" + "full diff ready" box
  4. fork into two arrows
  5. left fork: "/apply-worktree" box (green) + green tick + "MERGED"
  6. right fork: "/delete-worktree" box (red) + red cross + "DISCARDED"
]
```

**HTML emitted:** ~70 lines of SVG matching `example/index.html` in this skill
slide `1.6.1`. Key conventions:

```html
<svg class="cmd-flow-svg" viewBox="0 0 440 440" preserveAspectRatio="xMidYMid meet"
     xmlns="http://www.w3.org/2000/svg" aria-label="/worktree command lifecycle flowchart">
  <defs>
    <marker id="wtArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7"
            orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a"/>
    </marker>
  </defs>

  <g class="cmd-appear cmd-s1">
    <rect x="110" y="10" width="220" height="44" rx="8" fill="#0f1017" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="220" y="30" text-anchor="middle" fill="#e4e4e7"
          font-family="Inter, sans-serif" font-size="12" font-weight="600">your repo &middot; main</text>
  </g>

  <!-- ... step 2, 3, ... -->
</svg>
```

CSS already styles `.cmd-appear` to start at `opacity: 0` and animate in
when its slide gets `step-ge-N` (matching `.cmd-sN`). Always wrap each
step's elements in a `<g class="cmd-appear cmd-sN">`.

---

## subagent-viz / subagent-blueprint (specialized)

Highly custom layout with an animated SVG hub-and-spoke + a separate
overlay revealing a prompt blueprint. If the user asks for this, point
them to `example/index.html` in this skill slides `1.4` (lines 250–452) as the
canonical reference; the markup is too bespoke to template generically.

ASK the user whether they want a literal copy with retitled labels, or a
custom variant.

---

## langfuse-style (image + notes split)

Single image on the left, eyebrow + lead + sub + bullet highlights on
the right. Good for "screenshot of dashboard, here's what to look at"
slides.

**Markdown:**

```
## 2.5 [two-col, ratio=2-1, class=langfuse-slide]
Image: assets/langfuse-trace.png
Eyebrow: Langfuse · live trace
Lead: Every thought, every tool call, every shell invocation — captured.
Sub: Drop-in RCA for your own orchestration layer.
Highlights:
  - Structured tool_input + output for every MCP call
  - Per-span latency
  - Tag filters across runs
```

**HTML emitted:** see `example/index.html` in this skill slide `2.5` (lines
1614–1638) for the canonical structure. Key classes: `.langfuse-slide`,
`.langfuse-shot`, `.langfuse-notes`, `.langfuse-eyebrow`,
`.langfuse-lead .lf-accent`, `.langfuse-sub`, `.langfuse-highlights-wrap`,
`.langfuse-highlights`.

---

## hooks-catalog (specialized)

Catalog of hook names grouped by category, plus two callouts. If the user
asks for a "list of categories with chips per category" layout, this is
the template. See `example/index.html` in this skill slide `2.4` (lines 1347–1431).

Use `.hooks-catalog`, `.catalog-title`, `.catalog-columns`,
`.catalog-group`, `.catalog-group-name`, `.catalog-chips`, `.hook-chip`.

---

## superpowers-style card (specialized)

Single elevated card with header + section heads + skill rows. Used to
showcase a "library" or "kit" with named components. See
`example/index.html` in this skill slide `3.2` (lines 1696–1740). Classes:
`.sp-card`, `.sp-card-head`, `.sp-card-icon`, `.sp-card-title`,
`.sp-card-section-head`, `.sp-card-count`, `.sp-skill-list`,
`.sp-skill-row`, `.sp-skill-icon`, `.sp-skill-name`, `.sp-skill-desc`.

---

## Reveal-step CSS contract

For multi-step reveals, `app.js` adds `.step-ge-N` to the slide as the
user advances. Existing CSS in `styles.css` styles:

```css
.substep                     { opacity: 0; transition: opacity .56s var(--ease-out-expo); }
.slide.active.step-ge-1 .substep.substep-1 { opacity: 1; }
.slide.active.step-ge-2 .substep.substep-2 { opacity: 1; }
/* ... up to step-ge-15 */
.cmd-appear                                   { opacity: 0; transform: translateY(8px); }
.slide.active.step-ge-1 .cmd-appear.cmd-s1   { opacity: 1; transform: none; }
/* ... etc */
```

So whenever a slide has `data-steps="N"`:
- Wrap each progressively-revealed element in `<div class="substep substep-K">` (K from 1 to N-1; step 0 is "always visible from the start").
- For SVG step reveals, use `<g class="cmd-appear cmd-sK">` instead.

The first reveal-step (step 0) is the slide's initial state — don't wrap
those elements.

---

## Quick-reference: which class is which

For lookup when reading existing slides to figure out their layout:

| If you see... | Layout name |
|---|---|
| `.chapter-opener` inside `.slide-inner` | `chapter-opener` |
| `.two-col` (no further qualifier) | `two-col` |
| `.code-container` with one tab | `code` |
| `.code-container` with multiple tabs | `code-tabs` |
| `.ide-mock` (no `-tabbed`) | `ide-mock` |
| `.ide-mock-tabbed` | `ide-mock` (multi-tab variant) |
| `.explorer-panel` | `explorer` |
| `.callout` standalone slide | `callout-only` |
| `.mcp-grid`, `.scope-grid`, `.cmd-grid` | `card-grid` (different flavors) |
| `.demo-slide` | `demo` |
| `.caution-slide` | `caution` |
| `.tip-slide` | `tip` |
| `.tip-slide.tip-split` | `tip-split` |
| `.caveman-compare-slide` | `caveman-compare` |
| `.cmd-flow-svg` standalone | `svg-flow` |
| `.langfuse-slide` | `langfuse-style` |
| `.hooks-catalog` | `hooks-catalog` |
| `.sp-card` | `superpowers-style` |
| `.subagent-viz` + `.subagents-blueprint` | `subagent-viz` (specialized) |
