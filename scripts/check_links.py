#!/usr/bin/env python3
"""Fail when a page on curiositycorp.org links to a local file that does not exist.

The site is plain HTML with no build step, so a relative link that points at a
missing file ships as a dead link. This check walks every served .html page and
resolves each local href, src and srcset target against the page's own folder.

Links already broken when the check was introduced are listed in
scripts/known-broken-links.txt. The check fails on any broken link that is not in
that list (a new dead link) and on any listed link that now resolves (so the list
only shrinks). Remove lines from the list as pages are fixed.

Usage: python3 -I scripts/check_links.py [--write-baseline]
"""
from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parent.parent
BASELINE = ROOT / "scripts" / "known-broken-links.txt"
# Not served as site pages: third-party bundles and merge leftovers (*.orig).
SKIP_DIRS = {".git", "vendor", "node_modules", "public"}
SITE = "https://curiositycorp.org/"
LINK_ATTRS = {"href", "src", "data", "poster", "action"}


class LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[int, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        line = self.getpos()[0]
        for name, value in attrs:
            if not value:
                continue
            if name in LINK_ATTRS:
                self.links.append((line, value.strip()))
            elif name in ("srcset", "imagesrcset"):
                for candidate in value.split(","):
                    url = candidate.strip().split(" ")[0]
                    if url:
                        self.links.append((line, url))


def local_target(page: Path, link: str) -> Path | None:
    """Return the file a local link points at, or None for external/non-file links.

    Resolves the way a browser does (urljoin against the page's own URL), so a
    "../" that climbs above the site root stays at the root.
    """
    if link.startswith(("#", "//")) or urlsplit(link).scheme or urlsplit(link).netloc:
        return None
    page_url = SITE + page.relative_to(ROOT).as_posix()
    parts = urlsplit(urljoin(page_url, link))
    if parts.netloc != urlsplit(SITE).netloc:
        return None
    path = unquote(parts.path)
    target = ROOT / path.lstrip("/")
    if path.endswith("/") or target.is_dir():
        target = target / "index.html"
    return target


def scan() -> list[str]:
    broken: list[str] = []
    pages = sorted(
        p for p in ROOT.rglob("*.html")
        if not SKIP_DIRS.intersection(p.relative_to(ROOT).parts)
    )
    for page in pages:
        collector = LinkCollector()
        try:
            collector.feed(page.read_text(encoding="utf-8", errors="replace"))
        except (OSError, AssertionError) as exc:  # AssertionError: malformed markup in html.parser
            raise SystemExit(f"cannot parse {page.relative_to(ROOT)}: {exc}") from exc
        rel_page = page.relative_to(ROOT).as_posix()
        for _line, link in collector.links:
            if link.lower().startswith(("javascript:", "javascrip:", "mailto:", "tel:", "sms:", "data:")):
                continue
            target = local_target(page, link)
            if target is None:
                continue
            if not target.exists():
                broken.append(f"{rel_page} -> {link}")
    return sorted(set(broken))


def main(argv: list[str]) -> int:
    broken = scan()
    if "--write-baseline" in argv:
        BASELINE.write_text(
            "# Local links that were already broken when scripts/check_links.py was added.\n"
            "# Format: <page> -> <link>. Delete a line once that link is fixed; never add one.\n"
            + "".join(f"{entry}\n" for entry in broken),
            encoding="utf-8",
        )
        print(f"wrote {len(broken)} known broken links to {BASELINE.relative_to(ROOT)}")
        return 0
    try:
        known = {
            line.strip() for line in BASELINE.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.startswith("#")
        }
    except FileNotFoundError:
        known = set()
    new = [entry for entry in broken if entry not in known]
    fixed = sorted(known.difference(broken))
    for entry in new:
        print(f"NEW BROKEN LINK: {entry}")
    for entry in fixed:
        print(f"FIXED, remove from {BASELINE.name}: {entry}")
    print(f"{len(broken)} broken local links ({len(broken) - len(new)} known), {len(new)} new, {len(fixed)} fixed")
    return 1 if new or fixed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
