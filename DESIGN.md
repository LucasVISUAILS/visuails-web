# Design

Visual system for VISUAILS — extracted from `assets/css/styles.css` (Design System v5, "Studio Editorial"). This is the authoritative reference for on-brand visual decisions. Regenerate with `/impeccable document` if the CSS system changes materially.

## Theme

Drenched dark, editorial. A warm near-black canvas under a high-contrast serif, with big imagery, near-square corners, and a single solar-coral accent spent only on the action. The physical scene: a quiet gallery/studio at dusk — dark walls, warm light, the work spotlit. Confident, calm, minimal. The darkness is committed (a `drenched` color strategy), not incidental; warmth lives in the ink and accent, never in a tinted-cream body.

## Color

OKLCH-reasoned, authored as hex. Warm near-black surfaces, warm-ivory ink, one coral action color.

### Surfaces (warm near-black)
- `--bg` `#0F0E0C` — page canvas
- `--bg-deep` `#0A0908` — deepest wells, footer
- `--bg-raise` `#151311` — raised sections
- `--surface` `#171512` / `--surface-2` `#1D1A17` — cards, panels
- Lifted panel tint (all legacy tint hooks collapse here): `#131110`

### Ink (warm ivory, opacity ramp)
- `--ink` `#F4EFE7` — headings, emphasis, strong
- `--ink-2` `rgba(238,229,217,.74)` — body
- `--ink-3` `rgba(238,229,217,.55)` — muted / captions
- `--ink-faint` `rgba(238,229,217,.4)` — faint labels
- Contrast note (WCAG AA): `--ink` and `--ink-2` clear 4.5:1 on all surfaces; audit `--ink-3` for body use — reserve it for large or non-essential text, bump toward `--ink-2` if it carries reading content.

### Brand accent — solar coral (used sparingly, on action only)
- `--brand` / `--accent` `#FF5B2E` — the logo coral; primary buttons, focus ring, selection
- `--accent-2` `#FF6E43`, `--accent-word` `#FF6E43` — italic headline accent
- `--accent-bright` `#FF8A5C` — links / small accents on dark
- `--accent-soft` `rgba(255,91,46,.12)`, `--accent-line` `rgba(255,91,46,.34)` — tint fills, hairline accents
- `--success` `#63C79A` / WhatsApp green `#4AD07F` — status + WhatsApp affordance only

### Hairlines
- `--line` `rgba(244,239,231,.1)`, `--line-strong` `rgba(244,239,231,.18)`

**Rule:** coral is the action color. If everything is coral, nothing is. Buttons, focus, selection, one italic headline word — that's its budget. Panels and structure stay in the warm-neutral ramp.

## Typography

Contrast-axis pairing: an editorial serif for display against a neutral sans for UI/body. No third family.

- Display: `--font-display` — **Instrument Serif** (Georgia/Times fallback). Weight 400, `line-height` ~1.02–1.04, `letter-spacing` -0.01em, `text-wrap: balance`. Italics carry emphasis (`h1 em`, `.accent-word`).
- Body / UI: `--font-body` — **Inter** (system-sans fallback). Weights 400–800. Also used for `h3`/`h4` (600, tighter tracking) so sub-headings read as UI, not display.
- Loaded from Google Fonts (`Instrument+Serif` + `Inter`). *Flagged: Instrument Serif and Inter are both AI-convergent faces; a more distinctive display or a swap to Fontshare Clash/General Sans would sharpen brand personality — see `/impeccable typeset`.*

### Scale (clamp-based, fluid)
- `--t-hero` `clamp(3rem, 7vw, 5.6rem)` · `--t-h1` `clamp(2.5rem, 5.2vw, 4.2rem)` · `--t-h2` `clamp(2.1rem, 4vw, 3.3rem)` · `--t-h3` `clamp(1.2rem, 1.7vw, 1.45rem)`
- `--t-lg` `clamp(1.05rem, 1.35vw, 1.18rem)` (lead) · `--t-body` `1.0625rem` · `--t-sm` `0.9rem` · `--t-xs` `0.78rem`
- Body `line-height` 1.62; `.lead` max-width 56ch; `.measure` 66ch (respect the 65–75ch ceiling).

### Kicker
Quiet studio label, not a tracked-caps eyebrow-on-every-section: `.kicker` — Inter 500, 0.82rem, uppercase, 0.05em tracking, `--ink-3`, with a 5px coral dot `::before`. Used as a named section label, sparingly.

## Layout

- Container `--container` 1240px; narrow `--container-narrow` 820px; fluid inline padding `clamp(1.2rem, 4vw, 2.6rem)`.
- Vertical rhythm `--section-y` `clamp(4.5rem, 9vw, 9rem)`; tight sections `clamp(3rem, 6vw, 5.5rem)`.
- Grid for 2D galleries (`grid-3`, `auto-fit minmax`), flex for 1D rows. Two-column asymmetric hero (`.two-col`, end-aligned).
- Body has `overflow-x: hidden`; test headings at every breakpoint — the large clamp maxes can overflow narrow grids.

## Shape & elevation

- Radii are deliberately sharp/near-square: `--r-sm` 8px, `--r` 10px, `--r-lg` 12px, `--r-xl` 14px, `--r-media` 8px; pills `999px` for buttons only.
- Shadows are soft, dark, and diffuse: `--shadow` `0 10px 40px rgba(0,0,0,.45)`, `--shadow-float` `0 24px 80px rgba(0,0,0,.55)`, plus a coral glow `--glow-accent` reserved for primary buttons.
- Ambient: fixed `.atmos` layer — faint warm radial "breath" at the top of the page. Backdrop-blur only on the scrolled sticky header (`blur(16px)`), never as decorative glass.

## Components (signature patterns)

- **Buttons**: coral gradient pill (`.btn-primary`, inner highlight + glow) is THE action; `.btn-ghost` and `.btn-wa` stay quiet outlined pills; WhatsApp green reserved for the WA icon.
- **Cards**: `.card` / `.svc` service cards with large media well on top (`.vis` scenes), lift on hover. Cards used only where they're the right affordance; no nested cards.
- **`.vis` scenes**: self-contained CSS/SVG product renders (bottle, jar, sneaker, bag) with glow + floor — placeholders that accept real product photos via `background-image`.
- **Before/after slider** (`.ba`): draggable proof widget — the transformation made interactive.
- **Marquee** (`.marquee`): continuous horizontal work reel.
- **Stat row / steps**: value claims and the 3-step process; steps labeled "No. 1 / No. 2 / No. 3" (a typed sequence, not decorative numbering).
- **`.link-arrow`**: quiet text link with an arrow that extends its gap on hover.

## Motion

Intentional, restrained, ease-out. Reduced motion is respected globally.

- Easing: `--ease` `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint-like), `--ease-in-out` `cubic-bezier(0.7, 0, 0.2, 1)`; duration `--dur` 0.45s.
- Patterns: `.reveal` scroll-in with `data-delay` stagger; buttons/links translate on hover; before/after drag; marquee scroll. No bounce, no elastic.
- `prefers-reduced-motion: reduce` collapses animation/transition durations to ~0 and disables smooth scroll — every added motion needs a fallback.

## Z-index scale

Semantic, not arbitrary: `--z-base` 1 → `--z-raise` 10 → `--z-dropdown` 100 → `--z-sticky` 200 → `--z-bar` 250 → `--z-backdrop` 300 → `--z-modal` 400 → `--z-toast` 500.

## Guardrails (from this system)

- Keep coral to the action budget; structure stays warm-neutral.
- Don't lighten the canvas into cream/beige — the drenched dark is the identity.
- One serif + one sans; no third family, no gradient text.
- Near-square corners; pills only on buttons.
- Every reveal enhances an already-visible default (never gate content on a JS class).
