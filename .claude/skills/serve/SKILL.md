---
name: serve
description: Launch a local static preview server for this no-build HTML site so pages can be viewed in a browser before pushing. Use when asked to preview, serve, or view the site locally.
---

# Serve the site locally

This is a static site with no build step. Serve the repository root directly and open it in a browser.

## Steps

1. From the repo root, start a static server (run in the background so it doesn't block):
   ```bash
   python3 -m http.server 8000
   ```
   If port 8000 is taken, pick another (e.g. 8080) and report the port used.

2. The site is then at `http://localhost:8000/` (home = `index.html`). Subpages map to their paths, e.g. `http://localhost:8000/about/team.html`.

3. Note: `api/*.php` endpoints will NOT execute (Python's static server, like GitHub Pages, serves PHP as plain text). That is expected — the live API does not run on this host.

4. When done, stop the background server process.
