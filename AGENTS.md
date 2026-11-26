# AGENTS.md — generalbots.org site guide

This is a **pure static website**: hand-authored HTML, CSS and vanilla JS, no build
step, no npm, no framework. A push to `main` triggers `.github/workflows/deploy.yml`,
which packages the whole repo and deploys it to the proxy for `https://generalbots.org`.
Assume every commit reaches production.

---

## Mandatory: update `VERSION.md` on every change

**No change is complete until `VERSION.md` is updated in the same commit.** This
applies to everyone and every agent, including small fixes.

1. Bump `Current version` at the top of `VERSION.md`:
   - **major** — redesign or breaking navigation/URL change;
   - **minor** — new page or section (e.g. `/magazine/`);
   - **patch** — copy, styling, accessibility or bug fix.
2. Add a dated entry with a short `### Added` / `### Changed` / `### Fixed` /
   `### Removed` list describing exactly what was done. Never rewrite past entries.
3. Commit `VERSION.md` together with the code it describes.

---

## Site structure

- `index.html` — homepage, Mantis Design System, mostly inline styles; dynamic parts
  rendered by `assets/dc-runtime-v2.js` through `x-dc` custom elements.
- `blog/`, `contact/`, `hosting/`, `privacy/`, `security/`, `terms/`, `magazine/` —
  section pages. Each is self-contained: inline CSS, shared `js/i18n.js` and
  `js/theme.js`, dark-first design with a light-mode `filter:invert(1)` override.
- `assets/` — hashed runtime assets, fonts and images referenced by the homepage.
- `js/i18n.js` — applies `lang/<lang>.json` to `[data-i18n]` elements; a missing key
  simply leaves the Portuguese text in place.
- `js/theme.js` — theme toggle shared by all pages via `html[data-theme]`.
- `sitemap.xml` — every public page must be listed here.
- `.github/workflows/deploy.yml` — deploy + smoke test; add new public paths to its
  verification list.

## Conventions

- All paths are absolute (`/blog/`, `/magazine/...`) so they work from any page.
- Keep the existing visual language: `#050505` canvas, `#ededed` text, `#262626`
  borders, mono eyebrows, 1px borders, no rounded cards unless the section already
  uses them.
- Include `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  canonical URL, OG tags, theme/i18n scripts and a footer with the shared links.
- Use semantic HTML, one `<h1>` per page, descriptive `alt` text, visible focus,
  `aria-label` on icon-only controls, and `prefers-reduced-motion` handling.
- External links use `target="_blank" rel="noopener noreferrer"`.
- New sections need a link in the site-wide footer (add to the homepage header nav
  only when explicitly requested), a sitemap entry and a deploy-verification path.
- On mobile the homepage uses a hamburger button that toggles the header nav; keep
  the toggle keyboard accessible (`aria-expanded`, Escape closes).

## Mobile friendliness

Every page must remain usable down to a 360px viewport:

- No horizontal page scroll — test `document.documentElement.scrollWidth <= innerWidth`.
- Layouts use `flex-wrap` / `grid` with `minmax(0, 1fr)` and break to one column under
  ~700px; never rely on fixed pixel widths for content columns.
- Navigation collapses or wraps instead of clipping; tap targets at least 40px.
- Images use `width`/`height` (or `aspect-ratio`) and `max-width:100%`.
- Carousels support touch (native scroll/snapping) plus keyboard and buttons.

## Workflow

1. Inspect the current page markup before editing — treat existing content as user work.
2. Make the change, check it locally (static server, links, JS syntax, mobile width).
3. Update `VERSION.md` in the same commit.
4. Commit and push to `main`; the deploy workflow publishes and smoke-tests it.
