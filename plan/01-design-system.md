# 01 — Design System

> STATUS: **ACTIVE** — extracted 2026-07-12 from Jerome's 5 reference sites. Phase 2 unblocked.
> References: db-longbow.webflow.io (R1) · sebastian-wittig.design (R2) · developios.com (R3) · aikawakenichi.com (R4) · andreigorskikh.digital (R5)

## Direction (one sentence)

Light, warm-neutral canvas with ink typography, ONE hot orange accent used as glow/gradient energy (R5), mono "technical" labels (R1+R5), serif-italic emotional accents inside grotesk headlines (R3+R4), oversized cropped display type (R4), and human personality details — availability chip, dual-timezone clocks (R5), warmth (R2).

## 1. Color tokens

```css
@theme {
  --color-bg: #FAFAF8;            /* warm off-white canvas */
  --color-surface: #F1F0EC;       /* cards, subtle panels */
  --color-ink: #171819;           /* primary text (R5 ink) */
  --color-ink-muted: #5F6163;     /* secondary text — 5.6:1 on bg ✓ */
  --color-accent: #FF5900;        /* hot orange (R5) — LARGE text ≥24px & graphics ONLY (3.2:1) */
  --color-accent-strong: #C24400; /* links, small accent text — ≥4.5:1 on bg ✓ */
  --color-accent-glow: #FF8A4C;   /* gradient partner for glows, never text */
  --color-line: rgb(23 24 25 / 0.12);
  --color-inverse-bg: #171819;    /* inverted sections (footer/contact) */
  --color-inverse-text: #FAFAF8;
  --color-inverse-muted: rgb(250 250 248 / 0.6);
}
```

Rules: accent NEVER for body/small text (use accent-strong). Inverted sections: accent works for large display on ink (4.9:1 vs inverse-bg for #FF5900 large ✓). No pure #FFF/#000 anywhere.

**Signature gradient (hero + contact):** radial orange glow bleeding from bottom (R5): `radial-gradient(ellipse 120% 80% at 50% 110%, #FF5900 0%, #FF8A4C 30%, transparent 70%)` over bg, with subtle film-grain noise overlay (CSS `url(data:noise.svg)` opacity 0.04, R1's grain).

## 2. Typography (all free, self-hosted via next/font — no Google Fonts CDN → no cookie-consent complications, unlike R2)

| Role | Face | Weights | Usage |
|---|---|---|---|
| Sans (primary) | **Geist** | 400, 500, 600 | body, UI, nav, most headings |
| Mono (technical) | **Geist Mono** | 400, 500 | eyebrows, labels, stats, timezone clocks, footer meta — ALWAYS uppercase, tracking 0.08em, size ≤0.8rem (R1/R5 pattern) |
| Serif (display accent) | **Instrument Serif** | 400 + italic | hero display lines, emotional italic words inside sans headlines (R3/R4 pattern), pull quotes |

Type scale (fluid):
```
--text-display: clamp(3.25rem, 8.5vw, 8rem);      /* hero, Instrument Serif, line-height 0.95, letter-spacing -0.02em */
--text-h2: clamp(2rem, 4.5vw, 3.75rem);           /* section headings, Geist 600 or serif mix, lh 1.05 */
--text-h3: clamp(1.375rem, 2.2vw, 1.875rem);      /* lh 1.2 */
--text-body-lg: clamp(1.0625rem, 1.4vw, 1.25rem); /* intros, lh 1.55 */
--text-body: 1rem;                                 /* lh 1.6 */
--text-label: 0.75rem;                             /* mono smallcaps, lh 1.4 */
```

**Headline mixing rule (R3/R4):** section headings are Geist 600 with ONE italic Instrument Serif word/phrase for emphasis — e.g. "Building *useful* AI tools". Hero: full Instrument Serif. Never mix inside body text.

## 3. Spacing & layout

- Section rhythm: `clamp(6rem, 14vh, 11rem)` vertical between sections
- Container: max-width 80rem (1280px), padding-inline `clamp(1.25rem, 4vw, 3rem)`
- Grid: 12-col desktop, gap `clamp(1rem, 2vw, 2rem)`
- Radius: `0.75rem` cards/images, `9999px` pills/buttons (R5 ID-card + pill language), inputs `0.5rem`
- Borders: 1px `--color-line`; hairline dividers between footer meta rows (R1 technical grid feel — subtle, not full blueprint crosshairs)
- Oversized display type may crop off-viewport horizontally (R4) — hero + footer name marquee only, `overflow-hidden` on section, never causes horizontal scroll

## 4. Motion language

- Primary ease: `cubic-bezier(0.22, 1, 0.36, 1)` (register as GSAP CustomEase "primary"; equivalent to expo-ish out)
- Scrub animations: no ease (linear with scroll)
- Durations: `--dur-fast: 0.3s` (UI feedback) · `--dur-base: 0.9s` (reveals) · `--dur-slow: 1.4s` (hero moments)
- Reveal signature: clip-path inset bottom→0 + translateY 40px + opacity (headings); plain rise+fade (body)
- Stagger: 0.06s chars (hero only), 0.08s list items
- Hover: 0.3s scale 1.03 media, color transitions 0.2s

## 5. Component aesthetics & signature moves (extends 04/05)

- **Buttons:** pill. Primary = ink bg / bg text, hover fills accent with white text (large-ish 1rem ✓ on #FF5900 borderline — use #C24400 fill instead for AA safety). Ghost = 1px line, ink text.
- **Hero "ID-card" chip (R5):** small rounded card near hero CTA — avatar, name, "FRONTEND ENGINEER · REACT & AI" mono label, availability dot (green pulse) + `availabilityNote` from CMS.
- **Dual timezone clocks (R5, Jerome's story):** mono labels in header-adjacent strip or footer: `VASAI, IN 14:32 (GMT+5:30)` · `BERLIN, DE 10:02 (GMT+1)` — live-ticking client component. Tells the relocation story silently. ADD to 04 as `TimezoneClocks` (footer + hero meta row).
- **Footer name marquee:** oversized "JEROME D'MELLO" Geist 600 (or Instrument Serif) cropped marquee row (R1/R4), MarqueeRow component, very slow drift.
- **Work card media (R1 trick):** case-study covers prefer short muted **video loops scrubbed/faded on hover** over WebGL — pre-rendered motion is cheaper than realtime 3D and looks premium. Spline stays HERO-ONLY.
- **Spline hero scene:** abstract geometric object (NOT a mascot/character), materials restricted to palette: ink, bg-neutral, orange accent. Sits within/above the orange glow gradient. If scene fights the glow visually, glow wins — drop Spline object to subtle wireframe.
- **Grain overlay (R1):** site-wide 3-4% noise on hero + inverted sections only.
- **Cursor:** NO custom cursor. (R2-R5 ship without one; skip A18 in 05 — mark A18 as CUT.)
- **Images:** full-color, slight desaturation until hover (R1 monochrome nod): `filter: saturate(0.85)` → 1 on hover.

## 6. Which reference drives what (for future disputes)

| Decision | Source |
|---|---|
| Orange accent + glow gradient + ID-card + clocks | R5 Gorskikh |
| Mono technical labels, grain, video-not-WebGL for work media | R1 Longbow |
| Serif italic inside grotesk headlines | R3 Developios / R4 Aikawa |
| Oversized cropped display + name marquee | R4 Aikawa / R1 |
| Warm canvas + personality, bilingual precedent | R2 Wittig |
| Light-not-dark overall | R2/R3/R4/R5 majority |
