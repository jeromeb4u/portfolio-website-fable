# Signature Interactions — Implementation Prompt

> For a Claude Code session at the repo root (`portfolio-website-fable`).
> Adds the layer the site is currently missing: two signature interactive
> moments with real craft, inspired by (not copied from)
> surendarselvaraj.com. Run AFTER `prompts/wire-case-studies.md`.
>
> The bar: a senior engineer opens the site, notices the interaction,
> inspects it, and finds it disciplined — 60fps, reduced-motion safe,
> zero layout shift, no library bloat. "Complex" means precise, not busy.

## Context

- Next.js 16 App Router, Tailwind v4 tokens in
  `src/app/(frontend)/[locale]/globals.css`: bg `#fafaf8`, ink `#171819`,
  accent rust `#9d3c11`, fonts Geist / Geist Mono / Instrument Serif.
  Motion primitives in `src/components/motion/` (GSAP + Lenis via
  `SmoothScrollProvider`; `html.motion-ok` class gates all motion).
- Design rules (locked): cream identity, serif headings, accent in drops
  never floods, no decorative 3D, no placeholder content.
- The reference site's identity move is a scramble/decode animation and a
  dark-amber palette. We do NOT copy either. We build our own two moves,
  both grounded in Jerome's actual story: **bilingual EN↔DE (relocating to
  Germany)** and **enterprise precision**.
- **Encoding gotcha:** never rewrite files with PowerShell text pipelines —
  it double-encodes UTF-8. Edit/Write tools or Node scripts only.

## Signature 1 — Bilingual flip: nav + hero eyebrow (the identity move)

The one thing a visitor should remember. Hovering any header nav link (or
focusing it with a keyboard) makes its label roll to its German translation,
letter by letter; unhover rolls it back to English. On the `/de` locale the
direction inverts (DE → EN). It encodes the site's core fact — this person
operates in both languages — into the chrome itself.

Implementation spec:

1. New client component `src/components/motion/BilingualFlip.tsx`:
   - Props: `text: string`, `altText: string`, `as?: ElementType`.
   - Render each character in an inline-block span (aria-hidden), with the
     REAL text in a visually-hidden span for screen readers — a11y reads
     one stable label, never the animation.
   - On hover/focus: staggered per-character transition to `altText`
     (~18ms stagger, ~160ms per char). Strategy: each char slot flips
     through 2–3 intermediate random glyphs from a fixed mono-safe set
     (`ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ·`) before settling on the target char
     — a typewriter-decode feel, NOT a slot-machine blur. Strings differ in
     length: pad the shorter with empty slots that collapse (width
     animates via `max-width` on the char span, transition 120ms) so the
     link width shifts smoothly instead of jumping.
   - Use `requestAnimationFrame` or GSAP (already a dependency) — no new
     libraries. Interrupt cleanly: hover-out mid-animation reverses from
     current state, never queues.
   - Reduced motion (`html.motion-ok` absent): instant swap on hover, no
     glyph cycling. Touch devices: no hover — do nothing (nav links behave
     as plain links).
2. Wire into `src/components/layout/Header.tsx` nav items. Translations
   come from the Navigation global — the CMS stores each item's label per
   locale already; fetch BOTH locales' labels in
   `src/app/(frontend)/[locale]/layout.tsx` (`getNavigation` for the other
   locale too) and pass `label` + `altLabel` down. Same for the "Get in
   touch" CTA (keep the pill styling; flip only the text).
3. Also apply to the hero eyebrow line ("FRONTEND ENGINEER · REACT & AI" ↔
   its German counterpart from the Home global's other-locale value) — on a
   6s ambient loop instead of hover: flip to the other language, hold 3s,
   flip back. Only while the hero is in the viewport (IntersectionObserver)
   and only when `html.motion-ok`. This is the only self-playing instance;
   everything else is input-driven.
4. Perf: no layout thrash — animate transform/opacity/max-width only;
   `will-change` sparingly; the whole nav must stay one paint layer.

## Signature 2 — Work cards: live-wire hover (craft where it matters)

The Work grid is where an employer decides. Cards get a three-part
composed hover (also keyboard-focus):

1. **Cursor-tracking CTA chip.** A small pill ("VISIT ↗" EN / "ANSEHEN ↗"
   DE, mono-label, ink bg, bg text) that follows the pointer within the
   card's cover area with ~120ms lerp lag. Scoped custom cursor: appears
   only inside card covers (default cursor elsewhere; `cursor: none` only
   while the chip is visible). Implement once in the card component —
   `src/components/work/CaseStudyCard.tsx`. Keyboard focus: chip docks to
   the cover's bottom-right corner instead of tracking.
2. **Cover treatment.** Existing zoom stays (scale 1.05, 700ms, expo ease);
   add a rust `#9d3c11` duotone-wash overlay at 12% opacity fading in
   200ms — ties every project image to the site palette on hover without
   recoloring the screenshot at rest.
3. **Metric flare.** The card's metric value (accent serif) gets a
   single underline sweep (scaleX 0→1, left origin, 300ms, rust) when the
   card enters hover — one sweep, no loop.

Touch devices: none of the above; the whole card is a plain link.
Reduced motion: zoom and chip-follow disabled; chip docks statically on
focus/hover.

## Supporting polish (quiet, do all)

1. **Header over dark sections:** the fixed cream header currently floats
   awkwardly over the dark footer. Add an IntersectionObserver sentinel:
   when the footer is in view, header text/logo switch to
   `--color-inverse-text` (bg stays the translucent blur). ~10 lines in
   `Header.tsx`.
2. **Section eyebrows:** add a mono eyebrow above each section heading
   (`[ ABOUT ]`-style but WITHOUT brackets — ours is plain
   `ABOUT — 01` … `CONTACT — 06`, mono-label, ink-muted, with the em dash
   and index). The index encodes real reading order — acceptable use of
   numbering. Add via a tiny `SectionEyebrow` component
   (`src/components/ui/SectionEyebrow.tsx`); labels from existing
   translations files (`messages/en.json` / `de.json`, new `sections`
   namespace). Apply to About, Experience, Skills, Work, Recommendations,
   Contact.
3. **Hero entrance orchestration:** current reveals are per-element with
   fixed delays. Re-time as one sequence: chip 0ms → eyebrow 80ms →
   headline line 1 clip-reveal 160ms → line 2 320ms → subhead 480ms →
   CTAs 560ms → location line 640ms. One GSAP timeline in the existing
   Reveal system if it supports it, else a small `HeroSequence` wrapper.
   Total ≤ 1.1s, ease `--ease-primary`, runs once.

## Hard constraints

- No new npm dependencies. GSAP + Lenis + React only.
- Every animation gated on `html.motion-ok` AND
  `prefers-reduced-motion` fallbacks as specced.
- 60fps: transforms/opacity only (max-width exception in Signature 1 is
  scoped to hover, measure it — if it janks, pre-measure both strings and
  animate between fixed widths).
- Zero CLS: nothing animated may push layout of neighbors (nav width
  change is the exception — verify visually it reads as intentional, and
  cap total nav width shift ≤ 24px per link by choosing compact German
  labels in the CMS if needed, e.g. "ÜBER MICH" not
  "ÜBER MEINE PERSON").
- Lighthouse accessibility ≥ previous run. Keyboard path fully usable.
- EN + DE parity for every new string.

## Verify (browser, not assertions)

1. `/en`: hover each nav link — decode rolls EN→DE and back; tab through
   — same on focus; screenshot mid-animation as proof.
2. `/de`: direction inverts.
3. Work cards: chip tracks pointer, docks on keyboard focus; duotone +
   underline sweep fire; touch emulation shows plain cards.
4. Scroll to footer: header text flips to inverse color.
5. DevTools → emulate `prefers-reduced-motion: reduce`: nav swaps
   instantly, hero appears without sequence, cards static.
6. Performance tab: record a hover session, confirm no long tasks > 50ms
   from the animations.
7. Self-critique pass at the end: screenshot hero, nav mid-flip, and a
   card hover. Ask of each: "would this survive a senior frontend
   engineer's inspection?" — fix what fails, then re-screenshot.

## Do not

- No particles, confetti, or cursor trails outside the scoped card chip.
- No global custom cursor.
- No copying the reference site's scramble charset, palette, or timing.
- Do not touch seed data or the CMS schema.
- Do not commit; leave changes for Jerome's review.
