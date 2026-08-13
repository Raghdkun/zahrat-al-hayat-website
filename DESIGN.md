# Design System — Zahrat Al Hayat

Warm, editorial wellness aesthetic. Tokens live in `app/globals.css` (`@theme` + `:root`). Use semantic tokens, never raw hex.

## Color (warm cream + plum, restrained)
Strategy: tinted-neutral ground with plum as a true accent (≤ ~15% of surface); pink and blue-grey are secondary accents.

| Role | Token | Value | Use |
|------|-------|-------|-----|
| Background | `background` | `#fcfaf7` warm cream | page ground |
| Foreground | `foreground` | `#0d0503` deep brown | text (never `#000`) |
| Primary | `primary` | `#4e0078` plum | brand accent, CTAs, numerals |
| Brand secondary | `brand-secondary` | `#ab2c5d` pink | secondary accent |
| Tertiary | `tertiary` | `#263238` blue-grey | tertiary accent |
| Accent | `accent` | `#f4d9ff` light purple | soft tints, chips, table headers |
| Secondary | `secondary` | `#f8f3ec` cream | card/section tints |
| Muted fg | `muted-foreground` | `#8d6959` taupe | secondary text |
| Border | `border` | `rgba(141,105,89,.18)` | hairlines |

Semantic status/action colors (amber=pending, green=confirm/success, red=cancel/danger, blue=complete) are allowed **only** for genuine status/action meaning — never as decoration.

## Typography
- Display: **Cormorant Garamond** (EN) / **Amiri** (AR), serif. Headings + large numerals. `font-display`, `font-medium`/`font-semibold`. Italic accent via `.display-italic`.
- Body: **Inter** (EN) / **Cairo** (AR). Set via `--font-body-*`.
- Per-direction correction is in `globals.css` (RTL headings reset letter-spacing, looser line-height). Keep it.
- Hierarchy through scale + weight; body ≤ 65–75ch.

## Brand signature
- `components/public/Botanical.tsx` — line-art `bloom` / `sprig` / `stem` motifs in `currentColor`. Place faintly (`text-primary/[0.06]`) as ambient decoration **instead of** blur blobs or radial glows.
- `.paper-grain` texture, `.hairline` dividers (in `globals.css`).

## Layout & components
- `.btn-pill` (primary / ghost), `.soft-frame`, `.organic-frame`, `.eyebrow`, `.section-x`, `.section-y`.
- Prefer editorial rhythm over card grids: numbered lists with hairline rules (see `Services.tsx`), borderless lists (see `Founder.tsx`). Never repeat one card idea across sections; never nest cards.
- Icons: **Phosphor** (`@phosphor-icons/react`) on the public site; the dashboard uses **lucide-react** internally — keep each surface internally consistent.

## Motion
- Ease-out only (`power3.out`, `cubic-bezier(.2,.8,.2,1)`); no bounce/elastic. Honor `prefers-reduced-motion` (GSAP guards + `@media` on `.animate-*`).
- Animate transform/opacity, never layout properties. GSAP + Lenis smooth scroll; reveal-on-scroll via `useReveal`.

## RTL / i18n
- Default locale `ar` (RTL). Use logical `start`/`end`, `ps-`/`pe-`/`ms-`/`me-`; reserve physical `left/right` only for direction-agnostic centering.
- `overflow-x: clip` guard on `html, body` prevents decorative elements from causing mobile horizontal scroll — keep it.

## Absolute bans
No gradient text, decorative glassmorphism, side-stripe borders, fabricated metrics/social proof, hero-metric templates, identical card grids, em dashes in copy, raw `#000`/`#fff`, or raw Tailwind palette colors used decoratively (use brand tokens).
