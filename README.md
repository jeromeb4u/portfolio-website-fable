# Jerome D'mello — Portfolio

Next.js 16 + Payload CMS 3 (embedded) + Tailwind v4 + next-intl (EN/DE). Full build spec in [`plan/`](plan/00-overview.md) — read `plan/00-overview.md` first; executor rules there are binding.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000 → /en
```

- Admin dashboard: **http://localhost:3000/backstage** (first visit: create the first user — this is Jerome's account; registration is closed after that)
- Seed content: `pnpm seed` (idempotent; fills all globals EN+DE)
- Local DB: SQLite `./dev.db` (auto-created). Production: set `DATABASE_URI` (Neon Postgres) — see `.env.example`.

## Commands

| | |
|---|---|
| `pnpm dev` | dev server |
| `pnpm build` | production build (must pass before any task is "done") |
| `pnpm lint` | eslint |
| `pnpm seed` | seed CMS content |
| `pnpm generate:types` | regenerate `src/payload-types.ts` after schema changes |
| `pnpm generate:importmap` | regenerate admin import map after adding admin components |

## Structure

```
plan/                 build spec (source of truth)
src/payload.config.ts CMS config — admin at /backstage, EN/DE localization
src/collections/      Users, Media, CaseStudies, ContactSubmissions
src/globals/          SiteSettings, Navigation, Home, Imprint, Privacy
src/app/(frontend)/[locale]/  public site (next-intl)
src/app/(payload)/    Payload admin + REST/GraphQL (generated)
src/app/api/contact/  contact form endpoint (zod + honeypot + Resend)
src/i18n/ src/proxy.ts  next-intl routing (Next 16 proxy)
src/seed/             content seed
```
