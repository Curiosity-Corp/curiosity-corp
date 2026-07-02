# Third-Party License Inventory

This file tracks every third-party asset (theme, library, icon set, font) bundled
in this repository under `vendor/`, `js/`, and `css/`, and the license each is
used under. The repo-root `LICENSE` file (MIT) covers **only the site's own
original code** (HTML content, `css/custom.css`, `js/*` files authored for this
site, images produced for Curiosity Corp) — it does not and cannot relicense the
third-party items below, which remain under their original licenses and retain
their own copyright notices.

Last reviewed: 2026-07-02.

## Base theme

| Item | Version | License | Notes |
|---|---|---|---|
| "Born to give" (imithemes) | 1.1 | **Confirmed by site owner** | Header comment in `css/style.css` credits `Project: Born to give`, `Author: imithemes`. This is a ThemeForest-style commercial template. The Curiosity Corp site owner has confirmed (statement dated 2026-07-02) that a valid ThemeForest license covering this theme was purchased; the purchase code/receipt is retained outside of git per standard practice. The blanket root `LICENSE` (MIT) does **not** cover this theme's original CSS/markup — only Curiosity Corp's own modifications and additions to it. |
| `outlined-iconset` (`css/fonts/outlined-iconset.*`) | — | **UNKNOWN — bundled with theme** | Legacy custom icon font shipped inside the "Born to give" theme (see `css/style.css` `line-icons.css` comment). No standalone license found; inherits the same theme-license uncertainty above. |

## JavaScript libraries

| Library | Version | License | Location |
|---|---|---|---|
| Bootstrap | 5.3.8 | MIT | `js/bootstrap.js` |
| FullCalendar (Standard Bundle) | 6.1.21 | MIT | `vendor/fullcalendar6/index.global.min.js` |
| GLightbox | (unversioned in bundle; site uses latest stable as of upgrade) | MIT | `vendor/glightbox/glightbox.min.js`, `.min.css` |
| SweetAlert2 | 11.26.25 | MIT | `vendor/sweetalert2/sweetalert2.all.min.js` |
| Swiper | 11.2.10 | MIT | `vendor/swiper/swiper-bundle.min.js`, `.min.css` |
| Isotope (PACKAGED) | 3.0.5 | **GPLv3 (open-source use) OR Metafizzy Commercial License (commercial use) — flag for business owner** | `vendor/isotope/isotope.pkgd.min.js`. Isotope's license banner requires a paid commercial license unless the using project is itself free/open-source. Curiosity Corp is a nonprofit but the site is a commercial-style production property; **confirm whether a Metafizzy commercial license was purchased**, or replace Isotope with a permissively-licensed masonry/filter library (e.g. `masonry-layout` MIT core, or a native CSS grid filter) if not. As of GitLab #19 (jQuery retirement), the site no longer loads jQuery at all — Isotope's core layout/filter API (`new Isotope()`, `.arrange()`) is used directly and does not require jQuery; the bundled `jquery-bridget` shim in this packaged file is simply inert dead code now. This does not change the licensing question above (tracked separately as issue #21), only confirms Isotope itself has no remaining jQuery *runtime* dependency. |

## Fonts

| Font | License | Location |
|---|---|---|
| Lato | SIL Open Font License 1.1 | `css/fonts/lato-*.woff2`, notice in `css/fonts/OFL-LICENSE.txt` |
| Playfair Display | SIL Open Font License 1.1 | `css/fonts/playfair-display-*.woff2` |
| Dosis | SIL Open Font License 1.1 | `css/fonts/dosis-400-latin.woff2` |
| Font Awesome Free | 6.7.2 | Icons: CC BY 4.0 · Fonts: SIL OFL 1.1 · Code: MIT (Font Awesome's standard tri-license) | `css/awesome/webfonts/fa-{brands,regular,solid}-*` — confirmed **Free** tier (filenames match the Free package exactly; no Pro-only styles such as `fa-light`/`fa-thin`/`fa-duotone`/`fa-sharp` present) |

## Notes / open items

- `vendor/_sota_staging/` contains duplicate copies of several of the above libraries (FullCalendar, GLightbox, Font Awesome zip, AOS, SweetAlert2, jQuery, Isotope, Bootstrap, Swiper). It is not referenced by any live HTML page — confirmed via repo-wide grep. Left untouched here since it may be in active use by another concurrent workstream on this branch; flagged for whoever owns that staging directory to clean up or fold in.
- The Isotope commercial-license question above is the one item in this table that could carry real legal exposure if unresolved (using GPLv3-or-commercial code without either qualifying as open source or holding a commercial license). Recommend resolving before the next public release cycle.
- **jQuery retirement (GitLab #19, closed out 2026-07-02):** jQuery 3.7.1 and jQuery Migrate 3.6.0 (both formerly MIT-licensed, listed above) have been fully removed from every served page — no HTML page loads either file any more, and the source files have been deleted from `js/`. The same pass also retired several jQuery-dependent plugins that were bundled inside `js/ui-plugins.js` / `js/helper-plugins.js` (both now deleted) and were never listed as separate rows in this table: bootstrap-select v1.6.0 (MIT; replaced by native `<select class="form-select">`), jquery-circle-progress (MIT; replaced by a vanilla SVG stroke-dasharray animation in `js/circle-progress.js`), the jQuery Sticky plugin, jQuery Transit, FitVids, and the jQuery Validation Plugin (jqueryvalidation.org — distinct from the standalone `validate.js` library still in use at `js/validate.min.js`, which was never jQuery-dependent and is unaffected). The site now ships zero jQuery-family code to browsers.
