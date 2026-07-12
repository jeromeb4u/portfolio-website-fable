# 03 — Payload CMS Schema

Rule: every visible string/image on the site maps to a field below. `localized: true` fields hold EN + DE.
Locales config: `{ locales: ['en', 'de'], defaultLocale: 'en', fallback: true }`.

## Globals

### `site-settings`
| Field | Type | Localized | Notes |
|---|---|---|---|
| siteName | text | no | "Jerome D'mello" |
| tagline | text | yes | used in meta + footer |
| email | email | no | |
| location | text | yes | "Vasai, India — relocating to Germany" style |
| socials | array {platform select [linkedin,github,xing,email], url} | no | |
| cvFile | upload (media) | per-locale via two fields: cvEn, cvDe | CV download button |
| availability | select [available, open, unavailable] | no | drives hero status pill |
| availabilityNote | text | yes | e.g. "Open to roles in Germany" |

### `navigation`
| Field | Type | Localized |
|---|---|---|
| items | array {label text (yes), anchor text (no)} | label yes |
| ctaLabel | text | yes |

## Collections

### `pages-home` → modeled as global `home`
Sections as named groups (all copy localized):

- **hero**: eyebrow, headingLine1, headingLine2, subheading, primaryCtaLabel, secondaryCtaLabel, splinePosterImage (upload), splineSceneUrl (text, no locale)
- **about**: heading, body (richText), portraitImage, factList array {label, value} (e.g. "5.5 yrs — Angular @ Infosys", "Since 2025 — React + AI freelance", "German — A1, learning")
- **experience**: heading, entries array {company, role, clientNote, dateStart, dateEnd, bullets array{text}, logo upload?} — seeded with Infosys (Truist, Optus, US portal, Training Division) + Freelance Feb 2025–present
- **skills**: heading, groups array {groupLabel, items array{name, note?}} — Frontend / AI & Tooling / Backend / Practices
- **workIntro**: heading, body
- **recommendations**: heading, entries array {quote textarea (localized), authorName, authorTitle, authorCompany, sourceUrl (LinkedIn rec link when it exists), consentConfirmed checkbox} — **render only when consentConfirmed = true**
- **contact**: heading, body, successMessage, errorMessage

### `case-studies`
| Field | Type | Localized | Notes |
|---|---|---|---|
| title | text | yes | |
| slug | text | no | unique, kebab |
| status | Payload drafts (`versions.drafts: true`) | — | published-only queries on frontend |
| projectType | select [ai-tool, dev-tool, automation, micro-saas, client-work] | no | |
| summary | textarea | yes | card + meta description |
| coverImage | upload | no | |
| coverVideo | upload (mp4/webm, optional) | no | hover preview |
| liveUrl, repoUrl | text optional | no | |
| stack | array {tech text} | no | |
| year | number | no | |
| role | text | yes | |
| body | richText (lexical) | yes | case study long-form; blocks: paragraphs, h2/h3, images, code, callout, stat-row |
| metrics | array {value, label} optional | value no, label yes | e.g. "8k — monthly requests" |
| needsGermanReview | checkbox | no | dashboard-only flag |
| order | number | no | manual sort |

### `contact-submissions`
name, email, message, locale, createdAt — created by `/api/contact`, read-only in admin, admin-only access. **Access control: `create` allowed publicly via API route (server key), `read/update/delete` admin only.**

### `media`
Payload upload collection → Vercel Blob. `alt` text field localized, REQUIRED.

### `users`
Default Payload auth collection. Public registration disabled. Only Jerome's account.

## Admin config

- `routes: { admin: '/backstage' }`
- Admin meta title "JD — Content"; hide Payload branding where config allows.
- Live Preview: home global + case-studies against frontend URL per locale.

## Seed script (`pnpm seed`)

Creates: site-settings, navigation, home global with REAL copy (from `plan/content/` — written in Phase 4), 0 case studies. German fields: AI-drafted, `needsGermanReview: true` where applicable. Idempotent (upsert by slug/global).
