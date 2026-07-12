# Portfolio Website — Master Plan

Owner: Jerome D'mello (jeromeb4u@gmail.com) · Target market: Germany frontend/AI roles + freelance clients.
This plan is written to be executed by an AI coding model (Opus 4.8 / Sonnet 5 class). Follow it literally.

## What is being built

A heavily animated, bilingual (EN/DE) portfolio website:

- **Stack:** Next.js 15 (App Router) · Tailwind CSS v4 · shadcn/ui · Payload CMS 3 (embedded) · GSAP + ScrollTrigger · Lenis smooth scroll · Spline (hero 3D) · react-three-fiber (light effects) · next-intl (i18n) · Resend (contact email)
- **Hosting:** Vercel (app) + Neon Postgres free tier (Payload DB) + Vercel Blob or UploadThing (media)
- **CMS requirement:** every piece of visible text, image, and list on the site must come from Payload. No hardcoded copy anywhere. Owner edits everything at the admin dashboard without touching code.

## Document map (read in this order)

| File | Contents |
|------|----------|
| 01-design-system.md | Colors, typography, spacing, motion language. ⚠️ BLOCKED until reference sites provided — do not invent a design. |
| 02-tech-stack.md | Exact packages, versions, config files, env vars |
| 03-cms-schema.md | Every Payload collection/global, every field, localization, admin route rename |
| 04-components.md | Every component: file path, props, states, CMS bindings |
| 05-animations.md | Every animation moment: trigger, timeline, easing, reduced-motion fallback |
| 06-pages.md | Route-by-route page specs incl. case-study template |
| 07-seo.md | Metadata, hreflang, OG images, sitemap, schema.org |
| 08-phases.md | Build order. Each task has acceptance criteria. Work top to bottom. |
| projects/tool-*.md | Specs for the 5 showcase tools (separate apps, built later, case studies feed this site) |

## Non-negotiable rules for the executor model

1. **Never invent design values.** Every color, font size, spacing, easing comes from 01-design-system.md. If a value is missing there, stop and ask — do not guess.
2. **Never hardcode copy.** All text renders from Payload fields (localized). Placeholder seed content is allowed only via the seed script in 03-cms-schema.md.
3. **No "coming soon" UI anywhere.** Case studies render only when `status = published`. Empty states are designed sections, not apologies.
4. **After every task:** run `pnpm lint && pnpm build`. Both must pass before the task counts as done.
5. **Mobile + `prefers-reduced-motion`:** every animation in 05-animations.md lists its fallback. Implement the fallback in the same task as the animation, not later.
6. **Client naming policy:** Truist and Optus may be named. Never mention internal tool names, architecture details, metrics dashboards, or screenshots of client work. Recommendation quotes: text only, name + title + company, never reproduce the letter PDFs.
7. **Accessibility floor:** semantic landmarks, focus-visible states, alt text from CMS, WCAG AA contrast (validated in design system), keyboard-reachable nav.
8. **TypeScript strict.** No `any` unless a third-party type forces it (comment why).
9. **Do not add dependencies** beyond 02-tech-stack.md without asking.
10. Commit after each completed task from 08-phases.md, message format: `feat(phase-N): <task title>`.

## Content language policy

- Site ships EN + DE via next-intl locale routing (`/en/...`, `/de/...`, default `/en`).
- Payload fields are localized (`localized: true`); owner fills both languages in the dashboard.
- German copy is AI-drafted first, flagged in the dashboard with a `needsReview` checkbox until a native/B2+ speaker has proofread. Owner's German is A1 — never assume he validated German text.
