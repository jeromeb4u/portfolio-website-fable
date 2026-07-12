# 05 — Animation Spec

Global rules:
- ONE primary ease from 01-design-system.md (call it `--ease-primary`). Durations from the design-system duration scale.
- Every effect below lists its **fallback** for `prefers-reduced-motion` OR `(pointer: coarse)`/<1024px where noted. Fallback ships in the same task.
- All ScrollTriggers created inside `useGSAP` with proper cleanup; `ScrollTrigger.refresh()` after fonts + images load.
- Nothing animates `width/height/top/left` — transforms + opacity + clip-path only. Target 60fps; test with CPU 4× throttle.

| # | Moment | Trigger | Behavior | Fallback |
|---|--------|---------|----------|----------|
| A1 | Page load intro | first paint, once per session (sessionStorage) | overlay wipe out + hero headline chars rise (SplitText stagger 0.03s) + scene fade | simple 300ms fade-in |
| A2 | Hero Spline scene | mount rules in 04 | scene idle animation authored in Spline; subtle pointer-parallax via Spline events | static poster image |
| A3 | Hero scroll exit | scrub 0→hero end | headline translateY -15% + opacity→0.3; scene scale 0.95 | none (static) |
| A4 | Header hide/show | scroll direction | translateY(-100%) on down, return on up, 0.4s | always visible |
| A5 | Section headings | enter 80% viewport, once | line-split rise + clip reveal | opacity fade |
| A6 | About portrait | scrub through section | ParallaxLayer speed 0.15 + subtle scale 1→1.05 | static |
| A7 | About facts | enter, once | stagger 0.08s rise | fade |
| A8 | Experience timeline (desktop ≥1024) | pin section, scrub | timeline line draws (scaleY), entries step-activate (opacity 0.35→1) per scroll segment | no pin — plain vertical list, per-entry fade on enter |
| A9 | Skills marquees | always | rows drift opposite directions, speed slows near hover | static wrapped chips |
| A10 | Work cards | enter, once, stagger 0.1s | rise + clip reveal; hover: coverVideo play + scale 1.03 + cursor label "View" | fade; tap goes straight to case study |
| A11 | Recommendation quotes | enter | oversized quotemark draws (SVG stroke), text line-reveal | fade |
| A12 | Contact CTA | enter | email link chars wave-in; MagneticButton on submit | fade, no magnet |
| A13 | Page transition | route change | overlay wipe (A1's overlay reversed), 0.5s total, next page A5s fire after | instant navigation |
| A14 | Case study hero | load | title line reveal + cover clip-path expand from 60%→100% width | fade |
| A15 | Case body images | enter, scrub ±10% | subtle parallax inside overflow-hidden frame | static |
| A16 | Stat rows | enter, once | CountUp 1.2s + label fade | static numbers |
| A17 | AmbientParticles | scrub, sections flagged in design system | drift + density reacts to scroll velocity | not mounted |
| A18 | Custom cursor | — | **CUT per 01-design-system.md §5 — do not build** | — |

Performance budget: LCP < 2.5s (hero poster is LCP element — Spline loads after), CLS < 0.05, total JS on `/` < 350KB gzip before Spline runtime (Spline lazy chunk exempt but IO-gated).
