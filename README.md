# curiosity-corporation

Source of **https://curiositycorp.org**, the Curiosity Research Corporation website.

## Where the site lives

**The site is on the `gh-pages` branch of this repository, not on `main`.** `main` holds only this
README, the licence and its CI. Open `gh-pages` to see or change the site:
https://git.developerdojo.org/Curiosity-Corp/curiosity-corp/-/tree/gh-pages

`gh-pages` is plain HTML, CSS and JS on a Bootstrap template, with no build step. Its `CLAUDE.md`
covers how the pages are laid out and edited.

## How it reaches the internet

| Step | What | Where it is defined |
| --- | --- | --- |
| 1 | A Draft MR into `gh-pages` is merged on GitLab | this repo |
| 2 | git-mirror-sync force-updates `gh-pages` on GitHub `Curiosity-Corp/curiosity-corp` (`sync.orgs` covers the Curiosity-Corp group; push-triggered) | `DroidOpsInc/nebula` `tools/git-mirror-sync`; FocusApiary/infrastructure `docs/git-mirror-sync-coverage.md` |
| 3 | GitHub Actions publishes the branch to GitHub Pages (custom domain from `CNAME`) | `.github/workflows/pages.yml` on `gh-pages` |
| 4 | Cloudflare (proxied DNS for `curiositycorp.org`) serves it | Cloudflare zone `curiositycorp.org` |

How this was established (2026-11-19, #25): the response headers of `curiositycorp.org` show
Cloudflare in front of GitHub Pages (`server: cloudflare`, `x-github-request-id`); the GitHub
repository's Pages settings show source `gh-pages`, build type `workflow`, CNAME
`curiositycorp.org`; GitLab and GitHub `gh-pages` were at the same commit (`7af3a2b`), which is the
commit of the last successful Pages deploy.

## Rules

- Change the site only by MR into GitLab `gh-pages`. Never push to GitHub by hand: the mirror
  overwrites it, and a hand push leaves GitLab behind (FocusApiary/infrastructure#521).
- Never edit or delete `CNAME` on `gh-pages`.
- MRs into `gh-pages` run the GitLab pipeline (launch-sequence `static-site.yml`), which fails on
  any new dead local link (`scripts/check_links.py`).
