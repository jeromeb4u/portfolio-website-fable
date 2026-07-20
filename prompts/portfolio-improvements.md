# Portfolio Improvement Implementation Prompt

> Paste this prompt into a Claude Code session opened at the repo root
> (`portfolio-website-fable`). It implements the findings from the July 2026
> site review. Work through the phases in order — each phase is independently
> shippable and later phases assume earlier ones are done.

---

## Context for the agent

This is a bilingual (EN/DE) portfolio site for Jerome D'mello — frontend
engineer (5.5 years Angular at Infosys, freelance React + AI tools since
Feb 2025), targeting frontend/AI roles in Germany.

Stack:

- **Next.js 16** App Router, `src/app/(frontend)/[locale]/` for public pages,
  `src/app/(payload)/` for the Payload admin (mounted at `/backstage`)
- **Payload CMS 3** — collections in `src/collections/`, globals in
  `src/globals/`, seed data in `src/seed/seed.ts`, typed via
  `src/payload-types.ts` (regenerate with `pnpm generate:types` after schema
  changes)
- **next-intl** for i18n — locales `en` / `de` defined in
  `src/i18n/routing.ts`, UI strings in `messages/*.json`
- **Tailwind CSS v4** design system, custom utilities like `container-site`,
  `section-pad`, `mono-label`, `text-display` defined in
  `src/app/(frontend)/[locale]/globals.css`
- Sections are componentized in `src/components/sections/` — the page file
  `src/app/(frontend)/[locale]/page.tsx` only fetches data and assembles
  components. **Keep it that way: never inline section markup into page
  files, always create/extend components.**
- Data access helpers live in `src/lib/data.ts`
- Dev server: `pnpm dev` (port 3000). Payload admin at `/backstage`.

House rules that override defaults:

1. **Componentize everything.** No monolithic page files. New UI = new
   component in the appropriate `src/components/` subfolder.
2. **No placeholder content on the public site.** No "coming soon", no lorem
   ipsum, no fake testimonials. If real content is missing, render nothing
   (the Work section already follows this pattern).
3. **Every user-facing string must exist in both EN and DE.** German copy that
   is AI-drafted and unproofread gets flagged (the CaseStudies collection has
   a `needsGermanReview` checkbox for this; follow the same spirit elsewhere).
4. **Do not publish anything to external platforms.** All work stays local.
5. After Payload schema changes: regenerate types, update `src/seed/seed.ts`
   so a fresh seed produces a complete site, and verify the admin UI loads.

---

## Phase 1 — Fix the "Download CV" button (bug)

**Problem:** In `src/components/sections/Hero.tsx` the secondary CTA is
labeled "Download CV" (seeded in `src/seed/seed.ts`) but its `href` is
`#contact`. An employer clicking it lands on the contact form.

**Fix:**

1. `src/globals/SiteSettings.ts` already has `cvEn` and `cvDe` upload fields
   (relation to `media`). Pass the locale-appropriate CV URL from
   `page.tsx`/`Hero` props (settings are already passed to `Hero`).
2. In `Hero.tsx`, resolve the CV for the current locale: `cvDe` when locale
   is `de`, else `cvEn`, falling back to `cvEn` if the German one is missing.
3. If a CV file exists: render the secondary CTA as a real download link
   (`<a href={cv.url} download>`), keep the existing label from the CMS.
4. If no CV file is uploaded: fall back to the current `#contact` behavior
   BUT also change the seeded label so it never says "Download CV" while
   pointing at the contact form. Seeded fallback labels: EN "Get in touch",
   DE "Kontakt aufnehmen". (Once Jerome uploads real CVs in `/backstage`,
   the download variant takes over automatically.)
5. The locale must be available in `Hero` — it is a server component, so use
   `getLocale()` from `next-intl/server` or pass `locale` as a prop from the
   page (prop preferred, matches existing patterns).

**Acceptance:** with no CV uploaded, button reads "Get in touch"/"Kontakt
aufnehmen" and scrolls to contact. After uploading a PDF in Site Settings,
button reads the CMS label and downloads the correct-locale PDF.

---

## Phase 2 — Add GitHub to socials

**Problem:** Seeded socials are LinkedIn + email only. Employers look for
GitHub immediately.

**Fix:**

1. Check `src/globals/SiteSettings.ts` — the `socials` array's `platform`
   select must include a `github` option (add it if missing, with a matching
   label).
2. Add `{ platform: 'github', url: 'https://github.com/jeromeb4u' }` to the
   socials seed in `src/seed/seed.ts` (verify the exact username with Jerome
   before seeding if uncertain — do NOT guess a different handle).
3. Confirm `src/components/layout/Footer.tsx` renders whatever socials exist
   (it maps over them already) and that a GitHub entry displays with a
   sensible label/icon consistent with the existing entries.

---

## Phase 3 — SEO / metadata pass

**Problem:** `src/app/(frontend)/[locale]/layout.tsx` exports only a title.
No description, no OpenGraph/Twitter cards, no sitemap, no robots, no
favicon, no hreflang alternates, no structured data. `public/` contains only
a GLB model.

**Fix — all of the following:**

### 3a. Root metadata

Convert the static `metadata` export in the locale layout to
`generateMetadata` so it can be locale-aware. Include:

- `description` — EN: concise 150–160 char summary ("Frontend engineer with
  5.5 years of enterprise Angular experience, now building React apps and AI
  tools. Open to frontend & AI roles in Germany."), DE equivalent. Store
  both in `messages/en.json` / `messages/de.json` under a `meta` namespace
  (or in SiteSettings if a field already fits — prefer CMS if adding a field
  is clean).
- `metadataBase` — read from an env var `NEXT_PUBLIC_SITE_URL` with a
  sensible production default; document it in `.env.example`.
- `openGraph` — title, description, locale, type `website`, url.
- `twitter` — `summary_large_image` card.
- `alternates.languages` — hreflang entries for `en` and `de` plus
  `x-default`, built from the routing config.

### 3b. OG image

Create `src/app/(frontend)/[locale]/opengraph-image.tsx` using
`next/og` (`ImageResponse`). Design: match the site's aesthetic — cream/off-white
background, large serif name "Jerome D'mello", mono-label line
"FRONTEND ENGINEER · REACT & AI", subtle orange accent (pull exact color
tokens from `globals.css`). 1200×630. No photo needed (none exists in repo);
typography-only is fine and on-brand.

### 3c. Icons

Generate a favicon set. Simple mark: "JD" monogram in the site's serif on the
site background color, orange accent acceptable. Create as
`src/app/icon.svg` (Next serves it automatically) plus an
`apple-icon.png` (180×180) if straightforward to produce. SVG monogram is
sufficient — do not add a binary-generation build step for this.

### 3d. sitemap.ts and robots.ts

- `src/app/sitemap.ts`: emit both locale homepages, both legal pages per
  locale, and every published case study per locale (query Payload via the
  helpers in `src/lib/data.ts`). Include `alternates.languages` per entry.
- `src/app/robots.ts`: allow all, disallow `/backstage` and `/api`, point to
  the sitemap.

### 3e. JSON-LD Person schema

New component `src/components/seo/PersonJsonLd.tsx` rendered from the locale
layout. Schema.org `Person`:

- `name`: Jerome D'mello
- `jobTitle`: Frontend Engineer
- `knowsAbout`: React, Next.js, Angular, TypeScript, AI tools
- `email`, `sameAs` (LinkedIn + GitHub URLs from SiteSettings socials)
- `nationality`/address omitted; add `knowsLanguage`: English, German.

Render via a `<script type="application/ld+json">` with properly serialized
JSON (use `JSON.stringify`, no dangerouslySetInnerHTML string concat).

### 3f. Case-study metadata

`src/app/(frontend)/[locale]/work/[slug]/page.tsx` already returns
title/description — extend it with `openGraph` (use the case study's cover
image URL as the OG image) and hreflang alternates for the slug.

**Acceptance:** `pnpm build` succeeds; `/sitemap.xml` and `/robots.txt`
resolve; view-source on `/en` shows description, OG tags, twitter tags,
hreflang links, and valid JSON-LD (paste into Google's Rich Results test
format-wise); sharing preview renders (check OG image route directly at
`/en/opengraph-image`).

---

## Phase 4 — Case studies for Vercel projects (content infrastructure)

**Problem:** Zero published case studies → the Work section (the single most
important section for employers) renders only a heading and one sentence.

The schema in `src/collections/CaseStudies.ts` is already complete
(`title`, `slug`, `projectType`, `summary`, `coverImage`, `coverVideo`
hover loop, `liveUrl`, `repoUrl`, `stack`, `year`, `role`, `body`,
`metrics`, `order`). **Do not invent project content.** Instead:

1. Create `prompts/case-study-intake.md` — a fill-in template Jerome
   completes once per Vercel project, with fields matching the collection:
   - Project name, one-line summary (EN), year, project type
     (ai-tool / dev-tool / automation / micro-saas / client-work)
   - Problem it solves (2–3 sentences), what was built (3–5 sentences),
     outcome/metrics (up to 3 `value` + `label` pairs — e.g. "12 hrs/week"
     / "manual work automated")
   - Live URL, repo URL (only if the repo README is presentable), stack list
   - Client framing if freelance work ("built for a US real-estate founder"
     — anonymized is fine)
   - Cover image (1440×960 screenshot) and optional 5–10s screen-capture
     video (mp4, muted) for the hover loop
2. Extend `src/seed/seed.ts` with a clearly marked, commented-out block
   showing exactly how a completed intake maps to a seeded case study
   document (both locales, `needsGermanReview: true` on the DE draft), so
   adding real projects later is mechanical.
3. Verify the case-study detail page (`work/[slug]`) renders every field the
   schema supports: metrics row, stack chips, live/repo links, rich-text
   body. If any schema field is not rendered on the detail page, add it to
   the appropriate section component (components live in
   `src/components/`; extend, don't inline).
4. Ordering: confirm the Work grid sorts by `order` ascending (it queries
   `sort: 'order'` in `src/lib/data.ts` — leave as is) and document in the
   intake template that lower `order` = more impressive project first,
   3–6 projects max.

**Acceptance:** intake template exists; a dry-run seed of one dummy case
study locally (delete after verifying, do not leave dummy content published)
renders correctly on grid + detail page in both locales.

---

## Phase 5 — Photo in About section

**Problem:** No human face anywhere on the site. German hiring culture
expects one.

**Fix:**

1. Add an optional `portrait` upload field (relation to `media`) to the
   About group in `src/globals/Home.ts`.
2. Regenerate payload types.
3. In `src/components/sections/About.tsx`, render the portrait when present:
   right-hand column or integrated with the existing stat cards, styled
   consistently (rounded, subtle border, `media-desat` treatment consistent
   with Work cards if that utility suits). When absent, layout must look
   identical to today — no empty slot.
4. `alt` text: "Portrait of Jerome D'mello" (EN) / "Porträt von Jerome
   D'mello" (DE) via translations.

No photo file exists in the repo — the field stays empty until Jerome
uploads one in `/backstage`. Do not add a placeholder image.

---

## Phase 6 — Blog ("Writing" section)

**Goal:** a small, low-pressure writing section. SEO + communication-skill
signal for the Germany job search. Quality over cadence.

**Fix:**

1. New collection `src/collections/Posts.ts` modeled on `CaseStudies.ts`:
   - `title` (localized, required), `slug` (unique, stable across locales),
     `summary` (localized textarea, required), `body` (localized lexical
     richText), `publishedDate` (date, required), `coverImage` (optional
     upload), `tags` (array of text), `needsGermanReview` checkbox,
     drafts enabled, same public-sees-published-only access pattern,
     same `revalidateAfterChangeCollection` afterChange hook.
2. Register in `src/payload.config.ts`, regenerate types.
3. Data helpers in `src/lib/data.ts`: `getPublishedPosts(locale)` (sorted by
   `publishedDate` desc) and `getPostBySlug(slug, locale)`.
4. Routes (componentized):
   - `src/app/(frontend)/[locale]/writing/page.tsx` — assembles a new
     `src/components/sections/WritingList.tsx` (post cards: title, date,
     summary, tags). If zero published posts, the route should return
     `notFound()` — an empty index page must never ship.
   - `src/app/(frontend)/[locale]/writing/[slug]/page.tsx` — assembles a
     `src/components/sections/PostBody.tsx` (reuse the lexical rich-text
     renderer already used by case-study detail pages — extract to a shared
     component in `src/components/richtext/` if it is currently inline).
   - Both routes: `generateMetadata` with title/description/OG + hreflang,
     matching Phase 3 patterns.
5. Navigation: add "Writing"/"Notizen" to the Navigation global seed ONLY
   behind the same emptiness rule — since nav is CMS-driven, simply do not
   seed the nav item; document in the seed file comment that Jerome adds the
   nav entry in `/backstage` once the first post is published.
6. Date presentation: render dates subtly (mono-label, year + month). No
   "latest post" banners, no post counts — a sparse blog must not look
   abandoned.
7. Add published posts to `sitemap.ts` (extend Phase 3d).
8. Do NOT write any post content. Optionally add
   `prompts/post-ideas.md` listing the three planned posts as titles only:
   the AngularJS→Angular 16 migration at scale; how I built [AI tool] for a
   real business; enterprise Angular to freelance React.

**Acceptance:** `pnpm build` passes; `/en/writing` 404s while no posts
exist; after publishing a test post in `/backstage` (then unpublishing),
list + detail render in both locales, post appears in sitemap.

---

## Phase 7 — Hero headline clamp check (minor)

At ~800px viewport width the display headline ("Enterprise-grade frontend")
ran close to/over the right edge. Check the `text-display` clamp in
`globals.css` across 640–1024px widths; adjust the clamp so the longest
seeded headline (EN and DE — German is longer) never overflows
`container-site` padding. Verify with the responsive preview at 640, 768,
800, 1024. Do not change the desktop size.

---

## Verification checklist (run after all phases)

- [ ] `pnpm build` clean (no type errors, no missing translations)
- [ ] `pnpm generate:types` produces no diff (types committed in sync)
- [ ] Fresh seed (`/api/seed` or seed script) produces a complete site with
      no broken sections in either locale
- [ ] `/en` and `/de`: CV button behavior correct per Phase 1
- [ ] Footer shows LinkedIn, GitHub, email
- [ ] View-source: meta description, OG, twitter, hreflang, JSON-LD present
- [ ] `/sitemap.xml`, `/robots.txt`, `/icon.svg`, OG image route all resolve
- [ ] `/en/writing` 404s (no posts yet); Work section unchanged (no
      placeholders)
- [ ] Lighthouse on `/en`: SEO score ≥ 95, no accessibility regressions
- [ ] `/backstage` admin loads; new fields (CV usage unchanged, portrait,
      Posts collection) all editable

## Out of scope — do not do

- Do not publish, post, or push anything to LinkedIn, GitHub, or any
  external platform.
- Do not invent case-study content, testimonials, metrics, or blog posts.
- Do not add analytics, cookie banners, or third-party scripts.
- Do not redesign existing sections; extend the current design system.
