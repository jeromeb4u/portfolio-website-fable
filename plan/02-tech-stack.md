# 02 — Tech Stack (exact)

Package manager: **pnpm**. Node 22 LTS.

## Scaffold command

> ✅ DONE (Phase 1, 2026-07-12): scaffolded from `payloadcms/payload/templates/blank#v3.86.0` via degit.
> DB: `DATABASE_URI` set → Postgres (Neon); unset → SQLite `./dev.db` for local dev (see payload.config.ts).

Payload 3 installs INSIDE the Next.js app (`src/app/(payload)` route group). One repo, one deploy.

## Dependencies

| Package | Purpose | Notes |
|---|---|---|
| next @ 16.2.x | framework | App Router only. NOTE: Next 16 uses `src/proxy.ts` (middleware renamed) |
| react @ 19.2.x | | |
| payload @ 3.86.0 | CMS | embedded; pin @payloadcms/* to same version |
| @payloadcms/db-postgres | DB adapter | Neon connection string |
| @payloadcms/richtext-lexical | rich text | case study bodies |
| @payloadcms/storage-vercel-blob | media uploads | or UploadThing if Blob unavailable |
| tailwindcss @ 4.x | styling | CSS-first config via `@theme`, no tailwind.config.js |
| shadcn/ui (CLI) | UI primitives | init with Tailwind v4 mode; use ONLY: button, dialog, sheet, form, input, textarea, label, sonner (toasts), dropdown-menu |
| gsap @ 3.x + @gsap/react | animation | ScrollTrigger, SplitText (SplitText is now free in GSAP 3.13+) |
| lenis | smooth scroll | integrate with ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` |
| @splinetool/react-spline + @splinetool/runtime | hero 3D | lazy-loaded, desktop only |
| three + @react-three/fiber + @react-three/drei | light 3D effects | ONLY where 05-animations.md says so |
| next-intl @ 3.x | i18n | locale prefix routing `/en` `/de` |
| resend | contact email | API route only, key server-side |
| react-hook-form + zod | contact form validation | pairs with shadcn form |
| sharp | image opt | Next default |

## Environment variables (`.env.example` must list all)

```
DATABASE_URI=            # Neon Postgres connection string
PAYLOAD_SECRET=          # openssl rand -hex 32
NEXT_PUBLIC_SITE_URL=    # https://<domain>
RESEND_API_KEY=
CONTACT_TO_EMAIL=jeromeb4u@gmail.com
BLOB_READ_WRITE_TOKEN=   # Vercel Blob
```

## Config decisions

- **Tailwind v4:** all tokens in `app/globals.css` under `@theme` from 01-design-system.md. No JS config file. Use `@custom-variant dark` only if design system specifies a dark mode.
- **Admin route rename:** `payload.config.ts` → `routes: { admin: '/backstage' }` (final path Jerome may change; keep it a single constant). Add `X-Robots-Tag: noindex` header + `disallow: /backstage` in robots.
- **First user:** created via Payload's first-user screen locally; `admin.autoLogin` OFF; public registration disabled (default).
- **Fonts:** `next/font/local` or `next/font/google` with `display: swap`, subset latin + latin-ext (German umlauts).
- **Images:** Next `<Image>` everywhere; media domains config for Blob.
- **Lenis + GSAP boilerplate:** one `SmoothScrollProvider` client component wrapping the site (see 04-components.md).
- **Spline scenes:** loaded with `next/dynamic` `ssr: false`, `IntersectionObserver`-gated, never on `(pointer: coarse)` viewports — render static poster `<Image>` instead (poster exported from Spline, stored in CMS media).
- **Draft preview:** Payload Live Preview configured for pages + case studies so Jerome sees drafts before publishing.

## Repo layout

```
app/
  (frontend)/[locale]/          # public site, next-intl
    page.tsx                    # home
    work/[slug]/page.tsx        # case study
    imprint/page.tsx  privacy/page.tsx
  (payload)/                    # Payload admin + API (generated)
  api/contact/route.ts          # form handler
components/
  ui/                           # shadcn
  layout/  sections/  motion/  three/
lib/                            # payload client, utils, i18n
messages/en.json de.json        # UI microcopy (nav labels etc.)
plan/                           # this spec pack
public/
```

## Deploy

1. Neon project → `DATABASE_URI`.
2. Vercel project ← GitHub repo. Env vars set for Production+Preview.
3. `vercel.json` not required; Payload migrations run via `pnpm payload migrate` in build script (`"build": "payload migrate && next build"`).
4. Custom domain attached in Vercel dashboard; www → apex redirect.
