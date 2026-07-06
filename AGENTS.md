# AGENTS.md — generalbots.org Style & Stack Guide

This is a **pure static website** — no build step, no React, no Next.js, no npm.
All pages are hand-authored HTML with shared CSS, JS, and inline SVGs.

---

## Tech Stack

- **HTML5** — semantic, no framework
- **HTMX** — for any dynamic interactions (load fragments, swap content)
- **CSS** — single file `css/site.min.css`, custom property system, no Tailwind
- **SVG** — inline icons (lucide-derived), no icon font, no React component
- **JS** — `js/site.min.js`, vanilla JS only (mobile menu, dropdowns, scroll reveal, 3rd-party scripts)
- **Fonts** — Inter (body) + DM Sans (headings), loaded via Google Fonts `@import`

---

## Design System

### Theme: Bright Warm-Neutral

The site uses a **white/light theme** — no dark mode, no purple/neon accents.
Identity: gear logo (black & white), precision, automation.

### CSS Custom Properties

```css
:root {
  --background: #FAFAFA;
  --foreground: hsl(220 15% 15%);
  --card: #fff;
  --card-foreground: hsl(220 15% 15%);
  --primary: hsl(220 10% 12%);
  --primary-foreground: #fff;
  --secondary: hsl(220 10% 96%);
  --secondary-foreground: hsl(220 15% 15%);
  --muted: hsl(220 10% 94%);
  --muted-foreground: hsl(220 10% 45%);
  --accent: hsl(220 10% 92%);
  --accent-foreground: hsl(220 15% 15%);
  --border: hsl(220 10% 90%);
  --radius: 0.75rem;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'DM Sans', 'Inter', system-ui, sans-serif;
}
```

### Color Rules

| Element | Value |
|---------|-------|
| Page background | `#FAFAFA` |
| Text primary | `hsl(220 15% 15%)` ≈ dark gray |
| Text secondary | `hsl(220 10% 45%)` / `.text-gray-500` equivalent |
| Headings | `hsl(220 15% 15%)` — never purple/cyan |
| Primary button | `var(--primary)` solid — no gradients |
| Secondary button | Transparent + `var(--border)` border |
| Card background | `rgba(255,255,255,.7)` glass or `#fff` solid |
| Card border | `rgba(0,0,0,.06)` — subtle, not neon |
| Card shadow | `0 1px 3px rgba(0,0,0,.04)` — barely visible |
| Card hover | `translateY(-4px)` + `0 12px 32px rgba(0,0,0,.08)` |
| Nav background | `rgba(255,255,255,.8)` + `backdrop-filter:blur(20px)` |
| Footer background | `#FAFAFA` or `gray-50` equivalent |
| Accent/divider | `rgba(0,0,0,.06)` — no colored lines |
| Hero background | `linear-gradient(135deg, #f8f8f8, #fff, #f8f8f8)` |

**Forbidden**: `purple`, `cyan`, `emerald`, `neon`, `hsl(260,...)`, dark backgrounds, colored glows, gradient text (except `gray-900→gray-600` for hero stat values).

### Card Classes

- `.glass-card` — frosted white, blur, subtle border
- `.glass-card-bright` — stronger white, stronger blur
- `.neon-border-purple`, `.neon-border-cyan`, `.neon-border-emerald` — all render as the same subtle border (legacy class names kept for compat, but all styled identically as `1px solid rgba(0,0,0,.08)`)
- `.card-hover` — lift + shadow on hover
- `.section-divider` — thin top border

### Utility Classes

- `.gear-accent` — 2px dark metallic gradient line
- `.badge` — pill badge (inline-flex, rounded, border, small text)
- `.btn`, `.btn-primary`, `.btn-outline`, `.btn-lg` — button system
- `.reveal` — element starts invisible, fades in on scroll (IntersectionObserver)
- `.container` — max-width 1200px, auto margin
- `.vitral-bg` — ultra-subtle radial gradient
- `.stained-glass-pattern` — dot pattern background

### Animations (CSS only)

- `@keyframes gear-spin` — 360° rotation (used on hero gear at 60s linear infinite)
- `@keyframes float` — subtle vertical bob
- `@keyframes fade-in-up` — opacity 0→1 + translateY(20px→0), 0.6s ease-out (triggered by JS `IntersectionObserver` on `.reveal` elements)

---

## SVG Icons

All icons are **inline SVG** — no React wrapper, no icon font, no external sprite sheet.
Icons are derived from the Lucide icon set, converted to plain SVG markup.

### Gear Icon (Brand Identity)

Used in hero badge, footer, and wherever the brand identity is needed:

```html
<svg width="24" height="24" viewBox="0 0 100 100" fill="none">
  <path d="M50 10 L53 20 L60 15 L58 25 L67 23 L62 32 L70 33 L63 40 L70 45 L62 48 L67 55 L58 53 L60 62 L53 57 L50 65 L47 57 L40 62 L42 53 L33 55 L38 48 L30 45 L37 40 L30 33 L38 32 L33 23 L42 25 L40 15 L47 20Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <circle cx="50" cy="37.5" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
</svg>
```

Hero decorative gear (large, low opacity, spinning):

```html
<div class="hero-gear">
  <svg width="600" height="600" viewBox="0 0 100 100" style="animation:gear-spin 60s linear infinite">
    <path d="M50 10 L53 20 L60 15 L58 25 L67 23 L62 32 L70 33 L63 40 L70 45 L62 48 L67 55 L58 53 L60 62 L53 57 L50 65 L47 57 L40 62 L42 53 L33 55 L38 48 L30 45 L37 40 L30 33 L38 32 L33 23 L42 25 L40 15 L47 20Z" fill="none" stroke="#000" stroke-width="0.5"/>
    <circle cx="50" cy="37.5" r="10" fill="none" stroke="#000" stroke-width="0.5"/>
  </svg>
</div>
```

### Icon Conventions

- Use `stroke="currentColor"` so icons inherit text color
- Default `stroke-width="2"` for UI icons (24px), `0.5` for decorative (600px)
- `fill="none"` for outline icons
- `width`/`height` set on the `<svg>` element, `viewBox="0 0 24 24"` (Lucide standard) unless custom path
- Inline directly in HTML — do not use `<img>` or `<use xlink:href>`

---

## HTMX Usage

HTMX is available for dynamic interactions. Use it for:

- Loading content fragments without full page reload
- Form submissions with partial page updates
- Lazy-loading sections on scroll

### Patterns

```html
<div hx-get="/partials/pricing.html" hx-trigger="intersect once" hx-swap="innerHTML">
  Loading...
</div>
```

```html
<button hx-post="/api/contact" hx-target="#result" hx-swap="innerHTML">
  Send
</button>
```

### Rules

- Never use HTMX where a simple `<a href>` suffices
- HTMX attributes belong on the triggering element
- Always provide fallback content (inner HTML of the element)
- Include `hx-boost="true"` on forms only if server returns HTML fragments

---

## JS Conventions

File: `js/site.min.js` — loaded via `<script defer src="/js/site.min.js"></script>` at end of `<body>`.

### What JS Handles

1. **Mobile menu toggle** — click hamburger, toggle `.hidden` on `#mobile-menu`
2. **Desktop dropdown menus** — click trigger, toggle `.hidden` on sibling content
3. **Scroll reveal** — `IntersectionObserver` on `.reveal` elements, adds `.animate-fade-in-up`
4. **3rd-party scripts** — GTranslate (i18n), GoatCounter (analytics) — injected dynamically

### Rules

- **No frameworks** — vanilla JS only
- **No DOM manipulation libraries** — no jQuery, no React, no Alpine
- Keep all page-specific logic in per-page `<script>` blocks or add to `site.js`
- Use `DOMContentLoaded` for initialization
- Use `classList.toggle()` / `classList.add()` / `classList.remove()` — no className string manipulation
- Use `addEventListener` — no inline `onclick` attributes
- Use `var` for top-level, `const`/`let` inside blocks (matches existing style)

---

## Page Structure Template

Every page follows this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAGE — General Bots</title>
  <meta name="description" content="...">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://generalbots.org/PAGE/">
  <meta property="og:image" content="https://generalbots.org/logo-square.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/css/site.css">
  <script type="application/ld+json">{ ... }</script>
  <style>/* page-specific styles only */</style>
</head>
<body>
  <!-- Phone bar -->
  <div class="phone-bar">...</div>

  <!-- Navigation (inline SVG icons + badge pills) -->
  <header class="nav-header">...</header>

  <!-- Mobile menu -->
  <div id="mobile-menu" class="mobile-menu hidden">...</div>

  <!-- Page content -->
  <main>
    <section class="hero-section reveal">
      ...
    </section>
    <div class="section-divider"></div>
    <section class="container reveal">
      ...
    </section>
  </main>

  <!-- Footer -->
  <footer>...</footer>

  <script src="/js/site.js"></script>
</body>
</html>
```

### Navigation Badges

Menu items use colored pill badges (Namecheap-style):

```html
<a href="/domains/" class="nav-link">
  Domains <span class="badge" style="background:#E8F0FE;color:#1a73e8;font-size:.625rem;padding:.125rem .375rem">API</span>
</a>
<a href="/hosting/" class="nav-link">
  Hosting <span class="badge" style="background:#E6F4EA;color:#1e8e3e;font-size:.625rem;padding:.125rem .375rem">VPS</span>
</a>
<a href="/general-bots/" class="nav-link">
  General Bots <span class="badge" style="background:#F3E8FD;color:#9334e6;font-size:.625rem;padding:.125rem .375rem">AI</span>
</a>
```

---

## FAQ Pattern

Use native HTML `<details>/<summary>` — no JS accordion:

```html
<details class="faq-item">
  <summary class="faq-question">Question text?</summary>
  <div class="faq-answer">
    <p>Answer text.</p>
  </div>
</details>
```

---

## Responsive Design

- Mobile-first: base styles target 375px
- Breakpoints: `768px` (tablet), `1024px` (desktop), `1280px` (wide)
- Nav: desktop links hidden below 768px, hamburger shown
- Grid: single column mobile → 2-col tablet → 3-col desktop
- Test at: 375px, 768px, 1280px, 1440px

---

## Contrast & Accessibility

- All text must meet **≥ 4.5:1** contrast ratio on bright backgrounds
- `text-gray-500` on `#FAFAFA` = ~5.5:1 ✓
- `text-gray-400` on `#FAFAFA` = ~3.1:1 ✗ — use only for decorative text, never body copy
- All interactive elements must be keyboard-accessible
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)

---

## File Organization

```
/
├── index.html
├── css/site.min.css      ← shared styles (edit carefully, affects all pages)
├── js/site.min.js        ← shared JS (mobile menu, dropdowns, reveal, 3rd-party)
├── logo.svg              ← horizontal logo
├── logo-square.svg       ← square icon
├── favicon.ico
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── about/index.html
├── blog/index.html
├── blog/SLUG/index.html  ← one folder per post
├── contact/index.html
├── pricing/index.html
├── privacy/index.html
├── terms/index.html
├── ... (other section pages)
├── *.png / *.svg / *.jpeg  ← image assets at root (legacy) or /img/
└── icons/                ← standalone SVG files if needed
```

---

## SEO & Quality Optimization Checklist

Every page on this site MUST pass ALL checks below. Run this checklist on every new or modified page.

### Required Meta & Structured Data

- [ ] `<meta charset="UTF-8">` — within first 1024 bytes
- [ ] `<meta name="viewport" content="width=device-width,initial-scale=1">` — present
- [ ] `<title>` — unique, descriptive, includes "| General Bots" suffix
- [ ] `<meta name="description" content="...">` — unique per page, 120–160 chars
- [ ] `<html lang="en">` — language attribute on root element
- [ ] `<link rel="canonical" href="https://generalbots.org/PATH/">` — matches page path
- [ ] `<meta name="robots" content="index, follow">` — unless noindex needed

### Open Graph (Social Sharing)

- [ ] `og:title` — matches `<title>` (plain text, no HTML)
- [ ] `og:description` — matches or summarizes `<meta name="description">`
- [ ] `og:type` — `website` for content pages, `article` for blog posts
- [ ] `og:url` — absolute URL matching canonical
- [ ] `og:image` — `https://generalbots.org/og-image.png`
- [ ] `og:image:width` — `1200`
- [ ] `og:image:height` — `630`
- [ ] `og:image:type` — `image/png`
- [ ] `og:image:alt` — descriptive alt text for the image
- [ ] `og:site_name` — `General Bots`
- [ ] `og:locale` — `en_US`
- [ ] `twitter:card` — `summary_large_image`

### Blog Posts Only (in addition to above)

- [ ] JSON-LD `@type: "Article"` (not `"WebPage"`)
- [ ] `"image"` field in JSON-LD pointing to og-image.png
- [ ] `"mainEntityOfPage"` field in JSON-LD
- [ ] `"datePublished"` and `"dateModified"` in ISO 8601 format
- [ ] `"author"` as Organization with name + url
- [ ] `"publisher"` as Organization with name + logo
- [ ] `article:published_time` OG tag matching datePublished
- [ ] `article:modified_time` OG tag matching dateModified
- [ ] `article:author` OG tag

### JSON-LD Structured Data

- [ ] `<script type="application/ld+json">` — `WebPage` schema with `name`, `description`, `url`, `isPartOf`
- [ ] `BreadcrumbList` schema on blog posts (list item per breadcrumb)
- [ ] Valid JSON syntax (test with jsonlint or equivalent)
- [ ] `@context: "https://schema.org"` — always use HTTPS

### Accessibility

- [ ] Skip-link: `<a href="#main-content" class="sr-only skip-link">Skip to content</a>` immediately after `<body>`
- [ ] `<main id="main-content">` — every page has a main landmark
- [ ] `role="main"` on `<main>`, `role="banner"` on `<header>`, `role="contentinfo"` on `<footer>`, `role="navigation"` on `<nav>`
- [ ] All `<img>` tags have `alt` attribute (descriptive text or `aria-hidden="true"` for decorative)
- [ ] All form `<input>` elements have associated `<label>`
- [ ] All interactive elements keyboard-accessible
- [ ] Contrast ≥ 4.5:1 for all body text
- [ ] `<details>/<summary>` for FAQ — no JS accordion

### Performance

- [ ] External scripts (`htmx.org`, `/js/site.min.js`) use `defer` attribute
- [ ] All images use `loading="lazy"` (except hero/LCP images)
- [ ] No render-blocking external resources in `<head>` (fonts via CSS `@import` is OK)
- [ ] Scripts loaded at end of `<body>`, not in `<head>` (except JSON-LD)
- [ ] CSS from local `/css/site.min.css` — no external CSS files

### Heading Structure

- [ ] Exactly one `<h1>` per page
- [ ] Heading hierarchy: H1 → H2 → H3 (no skips, e.g. H1 → H3)
- [ ] Blog card titles use `<h2>` (not `<h3>`) on index/archive pages
- [ ] Section headings use sequential levels

### i18n

- [ ] All user-visible text wrapped in `data-i18n="key"` attributes
- [ ] Matching key exists in all 7 language files (`lang/en.json`, `pt.json`, `es.json`, `fr.json`, `de.json`, `ja.json`, `zh-cn.json`)
- [ ] Stale keys removed from JSON when corresponding HTML is removed
- [ ] `hreflang` alternates present on i18n-enabled pages

### Favicon & App Icons

- [ ] `<link rel="icon" type="image/x-icon" href="...favicon.ico">`
- [ ] `<link rel="icon" type="image/svg+xml" href="/img/logo.svg">`
- [ ] `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`

### Sitemap

- [ ] Page listed in `sitemap.xml` with correct `<loc>` URL
- [ ] No phantom entries pointing to non-existent pages
- [ ] `changefreq` and `priority` appropriate for the page type

### Technical

- [ ] No inline `onclick` attributes — use `addEventListener` in JS
- [ ] No `http://` URLs — always `https://`
- [ ] External `target="_blank"` links include `rel="noopener"` or `rel="noreferrer"`
- [ ] No `<<` (double less-than) or other broken HTML patterns
- [ ] No unclosed HTML comments (`<!--` without `-->`)
- [ ] No `logo.svg` used as `og:image` — use `og-image.png` instead

---

## i18n Maintenance

When updating page content or terminology:

1. **Update `lang/*.json` files** — all 7 languages (en, pt, es, fr, de, ja, zh-cn). Replace or remove old i18n keys when text changes. Stale keys in JSON won't render (no `[data-i18n]` element pointing to them) but accumulate as dead weight.
2. **Search both code and JSON** before declaring a term eliminated — `data-i18n` attributes in HTML map to keys in these files.
3. **When renaming a key**, update both the `data-i18n` attribute in HTML and all 7 language JSON files.
4. **New pages** should add `data-i18n` attributes for translatable text, with matching keys in all language files.

---

## 3rd-Party Scripts

These are injected by `js/site.js` (not hardcoded in HTML):

1. **GTranslate** — `cdn.gtranslate.net/widgets/latest/float.js` — multilingual widget
2. **GoatCounter** — `gc.zgo.at/count.js` — privacy-friendly analytics

Never add Google Analytics, Facebook Pixel, or other invasive trackers.
