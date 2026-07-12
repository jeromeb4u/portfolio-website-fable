# 06 — Pages & Routes

All routes under `app/(frontend)/[locale]/`. Locales: `en` (default), `de`. next-intl middleware handles prefix + detection; `/` redirects to preferred locale.

## `/` — Home (single scrolling page)

Section order (each = one component from 04, one CMS group from 03):
1. Hero
2. About
3. Experience
4. Skills
5. WorkGrid
6. Recommendations
7. ContactCta
8. Footer

Nav anchors scroll (Lenis scrollTo) to sections; ids stable across locales.

Data: `home` global + published `case-studies` + `site-settings` + `navigation`, fetched server-side via Payload local API, `depth: 2`, locale-aware. Revalidate: Payload `afterChange` hooks call `revalidateTag`/`revalidatePath` so dashboard saves go live without redeploy.

## `/work/[slug]` — Case study

- `generateStaticParams` from published case studies (both locales)
- Layout: CaseHero → CaseBody → CaseNav → ContactCta (reused) → Footer
- Draft mode: Payload Live Preview → Next draftMode() shows drafts to logged-in admin only
- Unpublished slug → 404

## `/imprint` and `/privacy` — Legal (German market requirement)

Germany legally expects an **Impressum** (§5 TMG/DDG) and **Datenschutzerklärung** (GDPR) on professional websites — even portfolios. Non-negotiable for credibility with German employers.

- Content: two Payload globals (`imprint`, `privacy`), richText, localized. DE version is the legally operative one.
- Privacy policy must cover: contact form data (purpose, storage in Payload/Neon, Resend as processor), hosting (Vercel), NO analytics unless added later (if analytics ever added, use cookieless e.g. Plausible/Umami and update policy).
- **No cookie banner needed** as long as no tracking cookies exist — Payload admin cookie is functional-only and admin-scoped. Keep it that way.
- Footer links both pages, both locales.
- Seed with standard template text; flag `needsGermanReview`.

## `/backstage` — Payload admin (renamed)

Not linked anywhere on the site. noindex header + robots disallow.

## System pages

- `not-found.tsx`: designed 404, localized copy from `site-settings` (add fields notFoundHeading/notFoundBody/backHomeLabel to site-settings)
- `error.tsx`: minimal client error with reload button (hardcoded microcopy exception, from messages/*.json)
- `opengraph-image` per route: dynamic OG (name + role EN, satori/next/og), case studies use coverImage
- `sitemap.ts`: home + published case studies + legal, per locale with hreflang alternates
- `robots.ts`: allow all, disallow `/backstage`, sitemap ref
