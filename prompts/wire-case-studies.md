# Wire Case Studies + Portrait — Implementation Prompt

> For a Claude Code session at the repo root (`portfolio-website-fable`).
> Fills the empty Work section with Jerome's 7 live Vercel projects and wires
> his portrait into the About section. Everything here is content + seed
> wiring — the components, collection schema, and data helpers already exist
> and work. Do NOT redesign anything in this prompt; a separate prompt
> (`prompts/signature-interactions.md`) owns visual/interaction work.

## Context

- Payload CMS 3 + Next.js 16. Case studies collection:
  `src/collections/CaseStudies.ts` (fields: title, slug, projectType,
  summary, coverImage [REQUIRED upload], coverVideo, liveUrl, repoUrl,
  stack[], year, role, body richText, metrics[], featured, confidential,
  needsGermanReview, order). Seed: `src/seed/seed.ts`, runs via
  `POST /api/seed` with header `x-seed-secret: $PAYLOAD_SECRET` (value in
  `.env`). Seed is idempotent but OVERWRITES globals — do not remove
  existing home/global seed content, only add.
- Dev server: `pnpm dev` on port 3000 (assume running; use the Browser
  pane preview tools, never Bash, if you need to start it).
- Design rules (locked): serif headings, rust accent `#9d3c11`, no
  placeholders, no invented facts. EN + DE for every localized field;
  set `needsGermanReview: true` on every case study (German is AI-drafted).
- **Encoding gotcha:** never rewrite files with PowerShell text pipelines
  (`Get-Content`/`Set-Content`) — it double-encodes UTF-8 (`·` → `Â·`).
  Use the Edit/Write tools or a Node script only.

## Honesty constraint (hard rule)

These are Jerome's own end-to-end builds deployed on Vercel. Do NOT invent
paying clients, revenue numbers, user counts, or business outcomes. Metrics
arrays may contain only **product facts** listed in this file (features that
demonstrably exist on the live sites). Body copy describes what the product
does and what Jerome built — never "the client saw X% growth".

## Task 1 — Cover screenshots

`coverImage` is required, so images come first.

1. For each of the 7 URLs below, open it in the browser preview and capture
   a full-viewport screenshot at 1440×900 of the homepage hero (wait for
   fonts/images to load; no cookie banners or dev overlays in frame).
2. Save as `public/seed-covers/<slug>.png` (create the folder). If the
   browser tooling cannot save to disk directly, use a Node script with
   `playwright` via `pnpm dlx playwright screenshot --viewport-size=1440,900 <url> <file>`
   (install nothing globally; `pnpm dlx` is fine).
3. In the seed, upload each file to the `media` collection
   (`payload.create({ collection: 'media', filePath, data: { alt } })`) and
   use the returned id as `coverImage`. Look at how existing media seeding
   is done in `seed.ts` first and follow that pattern; if none exists,
   write a small helper. Alt text pattern: "Homepage of <project name>".

## Task 2 — Seed the 7 case studies

Add a case-studies block to `src/seed/seed.ts` (EN locale + DE locale
update, same doc via slug lookup — study how Home global does two-locale
seeding). All entries: `_status: 'published'`, `role` EN "Design, build &
deployment" / DE "Design, Umsetzung & Deployment", `repoUrl` omitted
(repos private for now), `needsGermanReview: true`.

Content table (EN copy final; translate to DE yourself, flag for review):

### 1. Harbour & Vine — order 1, featured, year 2026, type client-work
- slug: `harbour-and-vine`
- liveUrl: https://harbour-and-wine-jeromeb4u.vercel.app  (note: URL says "wine")
- summary: "Reservation platform for a two-location coastal restaurant group — table booking with deposits and dietary notes in a 90-second flow, no phone calls."
- stack: Next.js, React, TypeScript, Tailwind CSS
- metrics (product facts): `90s` / "booking flow, start to confirmation"; `2` / "locations with independent availability"
- body (3 short paragraphs): the problem (fine-dining restaurants losing bookings to phone-only reservations); what was built (online reservations with deposits, dietary notes, private-event bookings for 8–20 guests, daily "from the fire" menu board naming the day-boats that landed the catch); the finish (fully responsive, image-optimized, deployed on Vercel).

### 2. Northgate — order 2, featured, year 2026, type micro-saas
- slug: `northgate`
- liveUrl: https://northgate-jeromeb4u.vercel.app
- summary: "Private wealth platform that replaces the quarterly PDF — live portfolio dashboard, direct advisor messaging, and traceable transactions behind auth."
- stack: Next.js, React, TypeScript, Tailwind CSS
- metrics: `Live` / "portfolio values, not quarterly PDFs"; `1:1` / "advisor messaging, no support queue"
- body: problem (wealth clients get static quarterly reports and phone-tag with advisors); built (authenticated dashboard with always-current portfolio, stage-based onboarding, transaction history where every number is traceable); finish.

### 3. Ridgeline Supply Co. — order 3, featured, year 2026, type client-work
- slug: `ridgeline-supply`
- liveUrl: https://ridgeline-supply-jeromeb4u.vercel.app
- summary: "Technical outdoor-gear storefront — spec-sheet-first product pages, cart and checkout with real-time stock verification, accounts with order history and returns."
- stack: Next.js, React, TypeScript, Tailwind CSS
- metrics: `8` / "product categories, spec-first"; `Live` / "inventory check at checkout"
- body: problem (outdoor e-commerce hides the numbers that matter — weight, denier, waterproof rating — behind lifestyle copy); built (category navigation, product pages leading with full spec tables, cart/checkout with stock verification, sign-in with order history and a returns portal); finish.

### 4. Aperture Dental — order 4, featured, year 2026, type client-work
- slug: `aperture-dental`
- liveUrl: https://aperture-dental-jeromeb4u.vercel.app
- summary: "Dental practice site built against patient anxiety — real practitioners, real time slots, and prices shown before treatment, not after."
- stack: Next.js, React, TypeScript, Tailwind CSS
- metrics: `Live` / "appointment slots per practitioner"; `0` / "callback forms — booking is direct"
- body: problem (dental sites hide costs and book via callback forms, which feeds exactly the anxiety that keeps patients away); built (live booking against named practitioners' slots, transparent pricing with financing shown upfront, team profiles with real people); finish.

### 5. Brightwater Plumbing & Heating — order 5, not featured, year 2025, type client-work
- slug: `brightwater`
- liveUrl: https://brightwater-jeromeb4u.vercel.app
- summary: "Emergency trade-services site with fixed upfront pricing, same-day online booking, and a live engineer-tracking link with ETA."
- stack: Next.js, React, TypeScript, Tailwind CSS
- metrics: `2h` / "arrival guarantee, tracked live"; `£89` / "call-out — priced on the page, not on the phone"
- body: problem/built/finish per the live site (Gas Safe engineer profiles with registration numbers, private tracker link with engineer status and ETA window).

### 6. Meridian Partners — order 6, not featured, year 2025, type client-work
- slug: `meridian-partners`
- liveUrl: https://meridian-partners-jeromeb4u.vercel.app
- summary: "Consulting-firm site that publishes methodology next to results — quantified case studies, partner profiles, and a client portal entry point."
- stack: Next.js, React, TypeScript, Tailwind CSS
- metrics: `100%` / "case studies with quantified outcomes"
- body: per live site.

### 7. Atelier Nord — order 7, not featured, year 2025, type client-work
- slug: `atelier-nord`
- liveUrl: https://atelier-nord-jeromeb4u.vercel.app
- summary: "Architecture-practice site with a client portal concept — version-controlled drawings, approval records, and a portfolio restricted to photographed built work."
- stack: Next.js, React, TypeScript, Tailwind CSS
- metrics: `5` / "project stages, concept to handover"
- body: per live site.

Homepage shows the 4 featured; `/work` archive shows all 7 (both already
implemented — verify they render, don't rebuild them).

## Task 3 — Portrait in About

1. `public/images/ChatGPT Image Jul 19, 2026, 06_37_24 PM.png` is Jerome's
   portrait (B&W, dark background, roughly 4:5). Rename/copy it to
   `public/images/portrait.png` (spaces in filenames break URLs).
2. In the seed, upload it to `media` (alt EN: "Portrait of Jerome D'mello",
   DE: "Porträt von Jerome D'mello") and set `about.portraitImage` in the
   Home global for BOTH locales.
3. `src/components/sections/About.tsx` already renders the two-column
   layout when a portrait exists — verify it looks right: the photo is
   dark; if it clashes against the cream background, add a subtle
   `border border-line` to the image wrapper. Do not add filters beyond
   the existing `media-desat`.

## Task 4 — Run + verify

1. Re-run seed: `curl -X POST -H "x-seed-secret: <PAYLOAD_SECRET from .env>" http://localhost:3000/api/seed`
2. Browser-verify `/en` and `/de`:
   - Work grid shows 4 featured cards with real screenshots, metric line,
     tag pills, working "All case studies →" link (7 in archive).
   - Each `/work/<slug>` detail page renders: cover, metrics row, stack,
     live-site button opening the Vercel URL in a new tab.
   - About shows the portrait, no layout break at 375px and 1280px.
   - No mojibake anywhere (`·`, `—`, `→` render correctly).
   - Console free of errors.
3. Take screenshots of the Work section and About section as proof, and
   self-critique against one question before finishing: "does any card
   look like a placeholder or a lie?" Fix what fails.

## Do not

- Do not invent clients, users, revenue, or percentages not listed here.
- Do not touch Hero, Skills, Experience, Contact, Footer, globals.css.
- Do not reorder page sections.
- Do not commit; leave changes in the working tree for Jerome's review.
