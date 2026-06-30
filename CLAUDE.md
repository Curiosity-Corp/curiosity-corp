# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing/website for **curiositycorp.org** — plain HTML/CSS/JS built on a Bootstrap NGO template. There is **no build system, no package manager, no test/lint suite**. Do not run `npm`, a bundler, or Jekyll. To change the site, edit the `.html`/`.css`/`.js` files directly.

## Deployment

- Served by **GitHub Pages from the `gh-pages` branch** — `gh-pages` is the normal working branch, not `main`. Pushing to it publishes the live site.
- `CNAME` pins the custom domain `curiositycorp.org`. **Never delete or edit `CNAME`.**
- Two remotes: `origin` = GitLab (git.developerdojo.org), `github` = github.com/Curiosity-Corp (the Pages host). The live site publishes from the `github` remote's `gh-pages` branch.

## Critical gotcha: no templating

Pages do **not** share includes/partials. The header, nav menu, and footer markup are **copy-pasted inline into every `.html` page** (top-level pages like `index.html` plus subdirectory pages under `about/`, `cause/`, `partner/`, `get-involved/`, `impact/`, `events/`, `news/`, `legal/`, `media/`). Any change to shared header/nav/footer must be applied to **every** page or the site becomes inconsistent. Use `/sync-shared-markup` for this.

## Asset layout

- `css/style.css` — base template styles. `css/custom.css` — site-specific overrides; prefer editing this for custom styling.
- `colors/color1.css` is the **active** color theme (linked in each page's `<head>`); `colors/color2.css`–`color12.css` are alternates, not loaded.
- `vendor/` — third-party libs (owl-carousel, magnific-popup, etc.). `js/` — site scripts. `images/` — ~55MB of assets; `images/favicon/` for icons.
- Asset links are **relative**: top-level pages use `css/...`, subdirectory pages use `../css/...`. Match the page's depth when adding links.

## Don't touch / ignore

- `*.orig` files (35 of them, e.g. `index.html.orig`, `causes.html.orig`) are merge-conflict leftovers — not source. Don't edit, reference, or rely on them.
- `api/*.php` (Twitter OAuth, `tweet.php`) cannot run on GitHub Pages (static host has no PHP). Treat as inert; don't expect it to work.

## Local preview

No build — preview by serving the directory statically: `python3 -m http.server 8000` (or run `/serve`), then open `http://localhost:8000`. Never test against a build step.

## Imagery

Per-page AI image regeneration is handled by the `site-image-regen` skill — use it for bulk image replacement rather than editing image tags by hand.
