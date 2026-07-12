# 08 — Build Phases

Execute strictly in order. A task is DONE only when its acceptance criteria pass AND `pnpm lint && pnpm build` succeed. Commit per task: `feat(phase-N): <task>`.

## Phase 1 — Foundation ✅ DONE 2026-07-12 (commit "feat(phase-1)")

Notes for executors: admin folder renamed to `src/app/(payload)/backstage` (must match routes.admin); Next 16 uses `src/proxy.ts` not middleware.ts; `payload run` exits silently on this Windows machine — seed via `POST /api/seed` with `x-seed-secret: $PAYLOAD_SECRET` while `pnpm dev` runs; schema changes on SQLite dev can hit an interactive drizzle data-loss prompt — delete `dev.db`, restart dev, reseed.

1.1 Scaffold per 02-tech-stack.md (Next 15 + Payload 3 + Postgres). ✓ dev server runs, `/backstage` shows login, first user created locally.
1.2 Tailwind v4 + shadcn init with placeholder-neutral tokens (grayscale). ✓ tokens file exists at `app/globals.css` with TODO markers referencing 01.
1.3 next-intl wiring: middleware, `[locale]` segment, messages/en.json + de.json with nav microcopy. ✓ `/en` and `/de` render, switcher works, 404 for `/fr`.
1.4 Payload schema: ALL globals/collections from 03 with localization + drafts + access control. ✓ every field editable in admin in both locales; contact-submissions not publicly readable (test unauthenticated REST).
1.5 Seed script with placeholder-but-real-shaped content. ✓ `pnpm seed` idempotent.
1.6 Data layer: typed fetchers for home/case studies/settings with locale param + revalidation hooks in Payload afterChange. ✓ change text in admin → home page updates without rebuild (dev + prod mode test).
1.7 `/api/contact`: zod validation, honeypot, Resend send, submission stored. ✓ curl test creates entry + email arrives; spam paths rejected.

## Phases 2–5 core ✅ DONE 2026-07-12 (commit "feat(phase-2-5)") — details per task below; remaining polish tracked in Phase 6 + deferred list

Deferred to polish pass: A1 page-load intro overlay, A8 pinned experience scrub (simple reveal shipped), A13 page transitions, MagneticButton, CountUp, Spline scene (slot reserved — renders "3D MODEL HERE" placeholder / CMS poster), r3f AmbientParticles, OG images, sitemap/robots. Note: browser-pane CDP screenshots time out while Lenis scroll animates — use waits or user's Chrome for visual checks.

## Phase 2 — Design system lands (was blocked; 01 filled from reference extraction)

2.1 Replace placeholder tokens with 01 values; fonts via next/font incl. latin-ext. ✓ type scale renders per spec; AA contrast spot-check.
2.2 Restyle shadcn primitives to tokens. ✓ button/input/dialog match 01 component aesthetics.

## Phase 3 — Layout & motion infrastructure

3.1 SmoothScrollProvider (Lenis+ScrollTrigger sync, reduced-motion kill switch). ✓ native scroll when emulated reduced-motion.
3.2 Header/Footer/LocaleSwitcher + A4 hide-show. ✓ anchors scroll correctly in both locales.
3.3 motion/ primitives: RevealText, ParallaxLayer, MagneticButton, CountUp, MarqueeRow. ✓ each demoed on a scratch route `/en/dev/motion` (deleted in Phase 6), fallbacks verified.
3.4 PageTransition (A13). ✓ home→case→home smooth, back-button works, no scroll restore bugs.

## Phase 4 — Sections (each task = build section + its animations + fallbacks)

4.1 Hero + HeroScene + A1/A2/A3. ✓ mobile shows poster; LCP is poster image; session-once intro.
4.2 About + A6/A7.
4.3 Experience + A8. ✓ pinned scrub desktop, plain list mobile, entries from CMS incl. Truist/Optus copy.
4.4 Skills + A9.
4.5 WorkGrid + A10. ✓ zero-published state renders intro-only (no placeholders); publish a draft → card appears after revalidate.
4.6 Recommendations + A11. ✓ entry with consentConfirmed=false never renders.
4.7 ContactCta + ContactForm + A12. ✓ full submit flow, localized success/error from CMS.
4.8 Real content pass: write final EN copy into seed/`plan/content/*.md`, AI-draft DE, set needsGermanReview flags. ✓ no lorem anywhere.

## Phase 5 — Case study template

5.1 `/work/[slug]` route, CaseHero/CaseBody/CaseNav, lexical renderer custom blocks, A14/A15/A16. ✓ one seeded demo case study renders both locales (kept as draft, used for testing only).
5.2 Live Preview + draftMode. ✓ admin sees drafts, public gets 404.

## Phase 6 — Hardening & launch

6.1 Legal pages (imprint/privacy per 06). ✓ both locales linked in footer.
6.2 SEO checklist 07 fully. ✓ every checkbox.
6.3 Performance pass: budgets from 05 (Lighthouse mobile ≥85 perf, LCP <2.5s, CLS <0.05). ✓ report saved to plan/reports/.
6.4 A11y pass: keyboard-only walkthrough, focus states, axe scan zero critical. 
6.5 Cross-browser: Chrome/Firefox/Safari (incl. iOS Safari — Lenis + GSAP quirks). 
6.6 Delete `/dev/motion`, remove console noise. Deploy production + domain + Search Console handoff note for Jerome.

## Runs parallel to everything (not executor's scope)

- Jerome provides design reference URLs → 01 gets filled (Phase 2 unblocks)
- LinkedIn rework drafts (separate deliverable)
- Showcase tools built per `plan/projects/tool-*.md`; each finished tool becomes a case-study entry Jerome publishes via dashboard
