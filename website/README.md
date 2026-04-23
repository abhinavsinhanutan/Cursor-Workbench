# Cursor-Workbench site (Astro)

Static **GitHub Pages** output is generated into the repository root [`../docs/`](../docs/) (Settings → Pages → **Deploy from a branch** → `main` / **`/docs`**).

## Requirements

- **Node.js** 20+ (LTS recommended)
- **Astro** 4.x (see `package.json`)

## Build

From this directory:

```bash
npm install   # or npm ci in CI
npm run build
```

Then commit the updated `docs/` at the repo root (HTML, `_astro/`, `assets/`, and passthrough files). The [website-build workflow](../.github/workflows/website-build.yml) fails the PR if `docs/` does not match a fresh build.

## Preview

```bash
npm run preview
```

Open the URL Astro prints. The project uses **`base: '/Cursor-Workbench'`** so asset URLs match [Project Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-source-files-in-a-folder) at `https://<user>.github.io/Cursor-Workbench/`.

## Troubleshooting

- **CSS or JS 404 on Pages** — `site` and `base` in `astro.config.mjs` must stay aligned with the real Pages URL. Wrong `base` breaks `/Cursor-Workbench/_astro/...` and `/Cursor-Workbench/assets/...` paths.
- **`git diff` fails after build** — run `npm run build` in `website/`, then stage and commit the full `docs/` tree.
