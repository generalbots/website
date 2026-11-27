# Version history — generalbots.org

**Current version: 1.4.0** (2026-11-27)

This file tracks every change made to the website. Per `AGENTS.md`, any change to
this repository must bump the version and add an entry here in the same commit.

Versioning: **major** = redesign / breaking navigation change, **minor** = new
page or section, **patch** = content, styling or bug fix.

---

## 1.4.0 — 2026-11-27

### Fixed
- Homepage demo panels no longer get clipped on phones: the chat, oficina, máquina
  and motores mocks now stack vertically below ~700px instead of sitting side by side.
- Verified the live site at 320/360/390/430/600/768/1024/1280px with no horizontal
  page scroll, and confirmed the mobile menu and magazine carousel still work.

---

## 1.3.1 — 2026-11-27

### Fixed
- Every visible string on every page is now routed through the i18n system. All 22
  blog posts had their article bodies, headings, dates and "related" cards hardcoded
  in English; they are now translated in all seven supported languages.
- Section pages (`/contact/`, `/hosting/`, `/privacy/`, `/security/`, `/terms/`,
  `/magazine/`, `/blog/`) and the homepage now translate their previously hardcoded
  labels, buttons, footers, SEO `<title>`/meta descriptions and ARIA labels.
- Added the missing `common.back_home` and `nav.magazine` translation keys and fixed
  the untranslated `common.back_to_blog` value in all language files.
- `i18n.js` now supports attribute translation (`data-i18n-attr`), array values and
  dynamically mounted content (MutationObserver), so x-dc components render in the
  selected language too.

### Added
- `lang/_index.json` maps source strings to i18n keys so text rendered at runtime is
  translated automatically.

---

## 1.3.0 — 2026-11-26

### Changed
- Magazine link is now footer-only; removed from the homepage header navigation.
- November 2026 (#41) is the featured, first slide with a larger cover and heading;
  October 2026 is second. Thumbnail order and slide labels follow the new order.

### Added
- Mobile hamburger button (`#gbMenu`) that opens/closes the homepage navigation,
  with `aria-expanded`, Escape-to-close and close-on-link-click.

---

## 1.2.0 — 2026-11-26

### Added
- Responsive mobile layout rules for the homepage: compact wrapping header with a
  horizontally scrollable nav, and stable `gb-hero-layer` / `gb-hero-cards` hooks.

### Fixed
- Homepage no longer overflows horizontally (was 599px wide at a 390px viewport);
  the hero now flows in the document instead of being clipped above the fold.
- Footer edge overflow clipped on very narrow screens.
- Verified zero horizontal page overflow on every public page at 320, 360, 390, 430,
  600, 768, 1024 and 1280px.

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
