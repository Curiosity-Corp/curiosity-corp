# Third-Party License Inventory

This file tracks every third-party asset (theme, library, icon set, font) bundled
in this repository under `vendor/`, `js/`, and `css/`, and the license each is
used under. The repo-root `LICENSE` file (MIT) covers **only the site's own
original code** (HTML content, `css/custom.css`, `js/*` files authored for this
site, images produced for Curiosity Corp) — it does not and cannot relicense the
third-party items below, which remain under their original licenses and retain
their own copyright notices.

Last reviewed: 2026-11-20.

## Base theme

| Item | Version | License | Notes |
|---|---|---|---|
| "Born to give" (imithemes) | 1.1 | **Confirmed by site owner** | Header comment in `css/style.css` credits `Project: Born to give`, `Author: imithemes`. This is a ThemeForest-style commercial template. The Curiosity Corp site owner has confirmed (statement dated 2026-07-02) that a valid ThemeForest license covering this theme was purchased; the purchase code/receipt is retained outside of git per standard practice. The blanket root `LICENSE` (MIT) does **not** cover this theme's original CSS/markup — only Curiosity Corp's own modifications and additions to it. |
| ~~`outlined-iconset` (`css/fonts/outlined-iconset.*`)~~ | — | **REMOVED (GitLab #20)** | Legacy custom icon font shipped inside the "Born to give" theme (see `css/style.css` `line-icons.css` comment). No standalone license was ever found for it, and the same theme-license uncertainty above applied. It also turned out to be **completely unused** in markup (no `data-icon`/`icon-*` glyph classes referenced it anywhere). Deleted outright as part of the icon-system consolidation to `images/icons.svg` rather than carried forward with an open licensing question — this row is kept only as a record of its removal. |

## JavaScript libraries

| Library | Version | License | Location |
|---|---|---|---|
| Bootstrap | 5.3.8 | MIT | `js/bootstrap.js` |
| validate.js | 0.13.1 | MIT | `js/validate.min.js` |
| FullCalendar (Standard Bundle) | 6.1.21 | MIT (header links to fullcalendar.io licence page) | `vendor/fullcalendar6/index.global.min.js` |
| GLightbox | (unversioned in bundle; site uses latest stable as of upgrade) | MIT (the minified files carry no header; licence per the upstream project) | `vendor/glightbox/glightbox.min.js`, `.min.css` |
| SweetAlert2 | 11.26.25 | MIT | `vendor/sweetalert2/sweetalert2.all.min.js` |
| Swiper | 11.2.10 | MIT | `vendor/swiper/swiper-bundle.min.js`, `.min.css` |
| ~~Isotope (PACKAGED)~~ | ~~3.0.5~~ | **REMOVED 2026-11-20 (GitLab #21)** | Formerly `vendor/isotope/isotope.pkgd.min.js`, whose header reads "Licensed GPLv3 for open source use or Isotope Commercial License for commercial use". The site is not GPLv3 and holds no commercial licence, so instead of buying one or taking on a GPL posture the library was replaced: the filterable card and gallery grids are now plain CSS Grid (`.filter-grid` in `css/custom.css`) plus a small filter script written for this site (`js/grid-filter.js`, covered by the root `LICENSE`). No GPL code remains in the repo; this row is kept only as the record of the removal. |

## Fonts

| Font | License | Location |
|---|---|---|
| Lato | SIL Open Font License 1.1 | `css/fonts/lato-*.woff2`, notice in `css/fonts/OFL-LICENSE.txt` |
| Playfair Display | SIL Open Font License 1.1 | `css/fonts/playfair-display-*.woff2` |
| Dosis | SIL Open Font License 1.1 | `css/fonts/dosis-400-latin.woff2` |
| Font Awesome Free | 6.7.2 | Icons: CC BY 4.0 · Code: MIT (Font Awesome's standard tri-license) | **Icon-font files removed (GitLab #20).** The 77 distinct glyph outlines actually used by the site were extracted directly from the bundled Free-tier `fa-{brands,regular,solid}-*.ttf`/`fa-v4compatibility.ttf` files (confirmed Free tier: filenames matched the Free package exactly, no Pro-only `fa-light`/`fa-thin`/`fa-duotone`/`fa-sharp` styles were present) using `fontTools`, and now ship as `<symbol>` outlines inside the single SVG sprite at `images/icons.svg`. The icon *artwork* is still Font Awesome Free and still requires the CC BY 4.0 attribution below; only the SIL OFL-licensed *font-file* delivery mechanism was dropped. Attribution: "Icons by Font Awesome (https://fontawesome.com), licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)." |

## Notes / open items

- `vendor/_sota_staging/`, which once held duplicate copies of several libraries (including Isotope), is no longer in the repository (checked 2026-11-20).
- **Isotope retirement (GitLab #21, 2026-11-20):** the one open licence exposure in this file (GPLv3-or-commercial Isotope 3.0.5) is closed by removal, see its row above. Every remaining library under `vendor/` and `js/` is MIT-licensed, as read from the file headers on that date (GLightbox ships without a header).
- **jQuery retirement (GitLab #19, closed out 2026-07-02):** jQuery 3.7.1 and jQuery Migrate 3.6.0 (both formerly MIT-licensed, listed above) have been fully removed from every served page — no HTML page loads either file any more, and the source files have been deleted from `js/`. The same pass also retired several jQuery-dependent plugins that were bundled inside `js/ui-plugins.js` / `js/helper-plugins.js` (both now deleted) and were never listed as separate rows in this table: bootstrap-select v1.6.0 (MIT; replaced by native `<select class="form-select">`), jquery-circle-progress (MIT; replaced by a vanilla SVG stroke-dasharray animation in `js/circle-progress.js`), the jQuery Sticky plugin, jQuery Transit, FitVids, and the jQuery Validation Plugin (jqueryvalidation.org — distinct from the standalone `validate.js` library still in use at `js/validate.min.js`, which was never jQuery-dependent and is unaffected). The site now ships zero jQuery-family code to browsers.
- **Icon-font consolidation (GitLab #20, 2026-07-02):** the site previously loaded two icon fonts — Font Awesome Free 6.7.2 and the unlicensed legacy `outlined-iconset` — for roughly 2,150 icon usages across every page. Both icon fonts (8 Font Awesome `.ttf`/`.woff2` files plus 5 `outlined-iconset` files, ~1.16 MB total) have been deleted and replaced with a single hand-built SVG sprite, `images/icons.svg` (~52 KB, cached once per visit), containing one `<symbol>` per of the 77 distinct glyphs actually referenced in markup. Glyph outlines were extracted directly from the (still Free-tier, still-licensed) Font Awesome `.ttf` files bundled in this repo using `fontTools`, so no new external assets were introduced and no icon changed appearance. `outlined-iconset` turned out to be entirely unused in markup and was removed outright rather than converted, resolving its open licensing question by deletion. Two Font Awesome CSS pseudo-element usages outside of HTML — the mega-menu `::after` caret and a dead (unused) `.checkbox-style-3-label` checkmark — were also found and replaced with icon-font-free CSS so the fonts could be fully removed with zero remaining references.
