# Version history — generalbots.org

**Current version: 1.1.0** (2026-11-26)

This file tracks every change made to the website. Per `AGENTS.md`, any change to
this repository must bump the version and add an entry here in the same commit.

Versioning: **major** = redesign / breaking navigation change, **minor** = new
page or section, **patch** = content, styling or bug fix.

---

## 1.1.0 — 2026-11-26

### Added
- Restored the magazine section from `generalbots/website-preview` at `/magazine/`.
- Second issue: **#41 — Novembro 2026, "O Cavalo de General Bots"** (39-page PDF and
  cover rendered from page 1), alongside **Nº 01 — Outubro 2026**.
- Simple, accessible cover carousel: scroll-snap + swipe, previous/next buttons,
  thumbnail navigation, arrow/Home/End keys, `aria-current`, reduced-motion support.
- PDF reader at `/magazine/viewer.html?issue=2026-10|2026-11` with download link.
- "Revistas" menu item in the main navigation and in the footer of every page.
- `VERSION.md` and an up-to-date `AGENTS.md` with the rule that every change must
  update `VERSION.md`.

### Changed
- Added `/magazine/` and `/magazine/viewer.html` to `sitemap.xml` and to the deploy
  workflow verification step.

---

## 1.0.0 — 2026-11-26

Baseline: static Mantis Design System site (pure HTML/CSS/JS, no build step) with
homepage, blog, legal pages, hosting and theme/i18n support, deployed to production
by the GitHub Actions workflow on every push to `main`.
