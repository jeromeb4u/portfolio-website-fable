# 07 — SEO

Goal: rank for "Jerome D'mello" (own-name queries from recruiters) + be perfectly parseable by AI screening tools. Not chasing generic keywords.

## Metadata

- Title template: `%s — Jerome D'mello` ; home: `Jerome D'mello — Frontend Engineer (React, Angular) & AI Tool Builder`
  - DE: `Jerome D'mello — Frontend-Entwickler (React, Angular) & AI-Tool-Entwickler`
- Descriptions from CMS (`site-settings.tagline` + per case-study `summary`), ≤155 chars.
- Canonical per locale; `alternates.languages` emits hreflang `en`, `de`, `x-default` → en. next-intl + Next metadata API handle this — verify rendered `<head>` manually in Phase 6.

## Structured data (JSON-LD)

Home page emits `Person`:
```json
{
  "@type": "Person",
  "name": "Jerome D'mello",
  "jobTitle": "Frontend Engineer",
  "knowsAbout": ["React", "Next.js", "Angular", "TypeScript", "AI application development", "GSAP"],
  "knowsLanguage": ["en", "hi", "de"],
  "sameAs": ["https://www.linkedin.com/in/jerome-dmello/", "<github-url>"],
  "url": "<site-url>",
  "email": "mailto:jeromeb4u@gmail.com",
  "worksFor": { "@type": "Organization", "name": "Freelance" }
}
```
Case studies emit `CreativeWork` with name, description, url, dateCreated.

## Content rules that double as SEO

- One `<h1>` per page (hero heading / case title). Section headings `<h2>`.
- Every media `alt` from CMS (required field — enforced by schema).
- Case study slugs: descriptive kebab (`ai-proposal-generator`), never ids.
- Experience section text should naturally contain: React, Next.js, Angular, TypeScript, AI, Germany — written for humans first; no keyword stuffing.

## Technical checklist (Phase 6 acceptance)

- [ ] Lighthouse SEO ≥ 95, Performance ≥ 85 mobile (animations budget from 05)
- [ ] `sitemap.xml` valid, both locales, hreflang alternates
- [ ] `robots.txt` disallows `/backstage` only
- [ ] OG images render for home + every case study (test via social debuggers)
- [ ] hreflang verified in rendered HTML
- [ ] Google Search Console: property added, sitemap submitted (Jerome does this — needs his Google account)
- [ ] `security.txt` optional skip; humans.txt skip
- [ ] All pages reachable ≤2 clicks from home

## After launch (Jerome's manual tasks — not executor's)

1. Add portfolio URL to LinkedIn (Featured + contact info + headline if space), GitHub profile, email signature.
2. Backlinks: Xing profile (German market), dev.to/Hashnode profile links if he writes posts.
3. Search Console: request indexing for home once live.
