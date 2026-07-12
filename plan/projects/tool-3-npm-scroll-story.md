# Tool 3 — `react-scroll-story` (npm package)

**Type:** Dev tool / open source · **Effort:** ~1-2 weeks + docs site

## Problem
Wiring GSAP ScrollTrigger + Lenis + React 19 correctly (cleanup, SSR, reduced-motion, refresh timing) is boilerplate every animated-site dev rewrites. 

## What it is
Typed React hooks + components that wrap the pattern:
- `<ScrollStoryProvider>` — Lenis + ScrollTrigger sync, `prefers-reduced-motion` auto-disable, font/image refresh handling
- `useReveal(ref, preset)` — enter-viewport reveals (fade, rise, clip, split presets)
- `usePin(ref, steps)` — pinned step-through sections with active-index state
- `useParallax(ref, speed)`
- `useScrollProgress(ref)` — 0-1 progress for driving anything (canvas, r3f, counters)
- SSR-safe, tree-shakeable, GSAP as peer dependency

**Dogfooding:** the portfolio website itself uses this package (extract during portfolio Phase 3 or after — motion/ primitives ARE the package). Perfect narrative loop.

## Deliverables
1. Package: tsup build, ESM+CJS, types, React 18+19 peer range, vitest unit tests for cleanup behavior.
2. Docs site (small Next.js app, deployed on Vercel subdomain): live demos of each hook, copy-paste recipes, reduced-motion notes.
3. README with GIFs, CI (GitHub Actions: lint/test/release with changesets), MIT license.
4. Publish to npm; announce post on LinkedIn (via Tool 1!).

## Case-study angle
"Open-source React hooks powering this very website — download stats live from npm API." Employers love: API design, testing, CI/CD, docs quality. Case study embeds live npm download counter.
