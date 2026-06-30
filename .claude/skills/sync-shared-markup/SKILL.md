---
name: sync-shared-markup
description: Propagate a header, nav menu, or footer change consistently across every HTML page in this static site, which has no template engine (shared markup is copy-pasted inline into each page). Use whenever a shared site-wide markup region must change.
---

# Sync shared markup across all pages

This site has **no templating** — the site header (`<header class="site-header">`), navigation menu, and footer are copy-pasted inline into every `.html` page. A change to any of these must be applied to all pages or the site becomes inconsistent.

## Steps

1. **Identify the region** the user wants to change (header, nav menu links, footer, etc.) and the exact before/after markup.

2. **Find every page.** List all HTML files, excluding `.orig` leftovers and the `vendor/` directory:
   ```bash
   find . -name '*.html' -not -name '*.orig' -not -path './vendor/*' -not -path './.claude/*' | sort
   ```
   Pages live at the top level and under `about/ cause/ partner/ get-involved/ impact/ events/ news/ legal/ media/ info/ consortium/`.

3. **Mind relative paths.** Asset and link URLs differ by depth: top-level pages use `css/...`, `images/...`, `index.html`; subdirectory pages use `../css/...`, `../images/...`, `../index.html`. When the shared markup contains links, adjust the prefix per page depth — do not blindly paste the top-level version into a subdirectory page.

4. **Apply the change** to each page. Verify the old markup actually exists in a page before editing (templates may have drifted); report any page where the region is missing or differs unexpectedly instead of forcing a match.

5. **Verify consistency** after editing:
   ```bash
   grep -rL "<NEW_MARKER_STRING>" --include='*.html' . | grep -v '\.orig$' | grep -v vendor/
   ```
   This lists pages still missing the new markup. The list should be empty (aside from intentionally-excluded pages).

6. Summarize which pages changed and flag any that were skipped and why.
