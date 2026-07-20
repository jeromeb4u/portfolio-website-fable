# UI Improvements Implementation Prompt

> Paste this prompt into a Claude Code session opened at the repo root
> (`portfolio-website-fable`). It implements UI upgrades inspired by an
> analysis of https://www.surendarselvaraj.com/ (July 2026), adapted to this
> site's existing design system. Run AFTER (or independently of)
> `prompts/portfolio-improvements.md` — where the two overlap (Work cards,
> Writing section), this file assumes that prompt's schema work exists or
> notes the dependency explicitly.

---

## Context for the agent

Bilingual (EN/DE) portfolio for Jerome D'mello — frontend engineer
(5.5 years enterprise Angular at Infosys, freelance React + AI since
Feb 2025), targeting frontend/AI roles in Germany.

Stack: Next.js 16 App Router (`src/app/(frontend)/[locale]/`), Payload CMS 3
(`src/collections/`, `src/globals/`, seed in `src/seed/seed.ts`, types via
`pnpm generate:types`), next-intl (`messages/*.json`), Tailwind v4 with
custom utilities (`container-site`, `section-pad`, `mono-label`,
`text-display`, `media-desat`, `glow-field`, `grain`) in
`src/app/(frontend)/[locale]/globals.css`. Sections componentized in
`src/components/sections/`; motion primitives (`Reveal`, `Marquee`,
`Parallax`, `SmoothScrollProvider`) in `src/components/motion/`.

**Design identity — do not change:** light cream background, orange accent,
Instrument Serif display + Geist body + Geist Mono labels. The reference
site is a dark-theme site; we are adapting its *patterns*, never its
palette. Every addition must use existing color tokens and type utilities.

House rules:

1. **Componentize.** Every new UI pattern is a component; page files only
   fetch and assemble.
2. **No placeholder content.** Sections with no real content render nothing.
3. **EN + DE parity** for every user-facing string (`messages/*.json` or
   localized CMS fields).
4. **Respect `prefers-reduced-motion`** for every animation added — the
   existing motion components already do; match them.
5. After Payload schema changes: `pnpm generate:types`, update seed, verify
   `/backstage` loads.
6. Nothing gets published externally; all work stays local.

---

## Phase A — Work cards: metric callout + NDA badge

The reference site's strongest pattern: each case-study card leads with one
big metric ("70%+ of readers on mobile", "7 reusable components") and
protected client work carries a "PROTECTED" badge instead of being omitted.

1. **Featured metric on cards.** `src/collections/CaseStudies.ts` already
   has a `metrics` array (`value` + `label`). In
   `src/components/sections/Work.tsx`, render the FIRST metric on each card:
   value in `text-accent-strong` (larger than body, e.g. `text-h3`), label
   inline after it in `text-ink-muted`, the whole line truncated to one line
   (`truncate`) — reference layout is `<value> <label…>` on a single row
   between the title block and the tag pills. Cards without metrics render
   exactly as today.
2. **Confidential badge.** Add a `confidential` checkbox to the CaseStudies
   collection (sidebar, description: "Client work under NDA — shown with a
   badge, no live/repo links rendered"). When true:
   - Card and detail page show a `mono-label` pill badge — EN "CLIENT
     CONFIDENTIAL", DE "VERTRAULICH" (translation keys, not hardcoded).
   - Detail page suppresses `liveUrl`/`repoUrl` buttons even if filled.
3. **Card hover upgrade.** Current hover is `scale-[1.03]` at 500ms. Match
   the reference feel: `duration-700`, easing `cubic-bezier(0.16,1,0.3,1)`,
   scale `1.05`, plus a bottom gradient overlay on the image
   (`bg-gradient-to-t from-bg/60 via-transparent to-transparent`) that
   intensifies slightly on hover. Keep `media-desat`.
4. **Card index numbers.** Prefix each card with a small `mono-label` index
   ("01", "02", …) derived from render order — matches the numbering already
   used in the Experience section, so it unifies the system.

---

## Phase B — `/work` index page

Homepage keeps a *selected* set; a dedicated archive holds everything.

1. New route `src/app/(frontend)/[locale]/work/page.tsx` — fetches all
   published case studies, assembles a new
   `src/components/sections/WorkArchive.tsx` (reuse the card component —
   extract the card from `Work.tsx` into
   `src/components/work/CaseStudyCard.tsx` first; both grid and archive use
   it).
2. Add a `featured` checkbox to CaseStudies (sidebar, default true while the
   portfolio is small). Homepage `Work` section shows featured only; archive
   shows all.
3. Under the homepage grid, render an "All case studies →" link
   (`link to /work`, styled like existing `mono-label` underline links) ONLY
   when there are more published studies than featured ones — with a small
   catalog this link must not appear and point at an identical list.
4. `generateMetadata` for the archive page (title "Work", localized
   description, OG + hreflang per the patterns in
   `prompts/portfolio-improvements.md` Phase 3).
5. Add the route to `sitemap.ts` if it exists by then.

---

## Phase C — Experience section → narrative timeline

Reference pattern: vertical timeline, dot markers, mono eyebrow
(COMPANY · ROLE), date range, then a short *narrative headline* per stop
("Where it began", "Leading AI and systems") above the description. The
current Experience section is a numbered list; the timeline tells a career
arc — and Jerome's arc (enterprise Angular → freelance React + AI →
Germany) is the story employers should absorb.

1. Add an optional `narrativeHeadline` text field (localized) to the
   experience entries array in `src/globals/Home.ts`.
2. Seed headlines for the five existing entries, both locales (DE flagged
   for review per house style). Suggested EN set — adjust freely for tone:
   - Freelance 2025–now: "Betting on React and AI"
   - Optus CPQ: "Leading 25 engineers through a migration"
   - Customer acquisition portal: "Owning delivery across time zones"
   - Truist BI: "Becoming the bridge between teams"
   - Infosys training: "Where it began"
3. Rework `src/components/sections/Experience.tsx` into a timeline layout:
   left vertical line (`border-line`), accent dot per entry
   (`ring-4 ring-bg` so the dot sits on the line cleanly), entry content
   right of the line. Keep the existing mono date labels and the `01`–`05`
   numbering if it fits; drop it if it fights the dots visually (your
   judgment — pick one indexing system, not two).
4. Entries reveal on scroll with the existing `Reveal` component (stagger).
5. Mobile: line hugs the left edge, content full-width right of it.
   Verify at 375px.

---

## Phase D — Animated stat counters (About)

Reference site animates its stat band (projects shipped, brands served).
The About section already renders stat cards ("5.5 years @ Infosys",
"25 engineers", …) — animate the numeric part on scroll-into-view.

1. New client component `src/components/motion/CountUp.tsx`:
   - Props: `value` (string — may contain non-numeric suffix like
     "5.5" / "25" / "A1"), `duration` default ~1.2s.
   - Parse leading number; animate 0 → value with an ease-out curve via
     `requestAnimationFrame` (no new dependency). Non-numeric strings
     render statically without animation.
   - Trigger once via `IntersectionObserver`; render final value
     immediately when `prefers-reduced-motion`.
2. Use it in `src/components/sections/About.tsx` for the stat values.
   Layout, fonts, and markup otherwise unchanged.

---

## Phase E — Testimonials upgrade

Reference: grid of shorter quote cards, each with an avatar-initials chip,
name, role + company, and a "More testimonials on LinkedIn →" outlink.

1. In `src/components/sections/Recommendations.tsx`, add an initials avatar
   chip per entry: circle (`bg-surface border border-line`), two initials
   derived from the name, `mono-label` sizing. No photos required.
2. Add an optional `linkedinRecommendationsUrl` text field to
   `src/globals/SiteSettings.ts` (or the Home recommendations group —
   whichever is cleaner given where the section pulls data). When set,
   render "More on LinkedIn →" (EN) / "Mehr auf LinkedIn →" (DE) beneath
   the quotes, external link with `rel="noopener noreferrer"`. Seed it with
   `https://www.linkedin.com/in/jerome-dmello/` (details page is fine — do
   not fabricate a deeper URL).
3. Layout: if 3+ consented entries exist, switch to a 2-column grid of
   shorter cards; with the current 2 entries keep the existing stacked
   presentation. Both branches must look intentional.
4. Keep the consent gate exactly as is — only `consentConfirmed` entries
   render.

---

## Phase F — Footer → contact hub

Reference footer is a proper contact destination: `[ CONTACT ]` label, big
serif closing line, availability line, then labeled channel cards (EMAIL /
LINKEDIN / MEDIUM / FIGMA — each with the handle and an action link).

1. New component `src/components/layout/ContactChannels.tsx`: a row/grid of
   channel cards built from SiteSettings `socials` + `email`. Each card:
   `mono-label` channel name, the handle/address in body type, and an
   action link ("Write to me ↗" / "Connect ↗" — localized strings in
   `messages/*.json`, keyed per platform with a generic fallback "Open ↗").
2. Integrate into `src/components/layout/Footer.tsx` above the existing
   legal/imprint row. Repeat the availability note here — reuse the Hero's
   availability chip exactly (extract it from `Hero.tsx` into
   `src/components/ui/AvailabilityChip.tsx` and use it in both places:
   bordered pill, pulsing dot, `mono-label` text). Employers who scroll to
   the end should hit the availability message again in identical form.
3. Do NOT duplicate the contact form — the Contact section owns the form;
   the footer hub is links only.
4. Footer stays one component tree; if it grows past ~120 lines, split
   subparts into `src/components/layout/footer/` files.

---

## Phase G — Header polish

1. **Backdrop blur:** give the fixed header a `bg-bg/60 backdrop-blur-md`
   treatment once the page is scrolled past the hero (scroll listener or
   IntersectionObserver on a sentinel; client behavior isolated in the
   existing `Header.tsx` which is already a client component — verify, and
   if it is a server component, wrap only the scroll-aware shell). At top
   of page, header stays transparent as today.
2. **Accent period:** site name in the header renders as
   "Jerome D'mello<span accent>.</span>" — the period in the accent color.
   Pure markup in `Header.tsx`; do not change the CMS `siteName` value.
3. **Animated link underlines:** add a `link-underline` utility to
   `globals.css` — 1px underline that scales in from the left on
   hover/focus-visible (`transform-origin: left`, ~200ms). Apply to header
   nav links and the footer channel action links. Must be visible on
   keyboard focus, not only hover.

---

## Phase H — Homepage Writing preview (depends on the Posts collection)

Skip this phase entirely if the Posts collection from
`prompts/portfolio-improvements.md` Phase 6 does not exist yet.

1. New component `src/components/sections/WritingPreview.tsx`: renders up to
   3 latest published posts — `mono-label` date + read time, title in serif,
   one-line summary, whole card links to the post.
2. **Read time:** compute from the lexical body at render time (word count
   / 200, minimum 1) in a small helper `src/lib/readtime.ts`; display as
   "4 MIN READ" / "4 MIN LESEZEIT".
3. Homepage assembly: insert between Recommendations and Contact in
   `page.tsx`, but ONLY when at least one published post exists — zero
   posts, zero section (house rule).
4. "All writing →" link to `/writing` beneath the cards.

---

## Phase I — Awards & recognition (optional section)

Reference site lists dated recognitions ("Dow Jones DOWs Recognition…").
Cheap credibility if Jerome has real entries (Infosys awards, client
shout-outs); CMS-driven so it ships empty and invisible.

1. Add an optional `awards` array to `src/globals/Home.ts`: `date` (text,
   free-form like "Sep 2023"), `title` (localized text), `description`
   (localized textarea, optional).
2. New component `src/components/sections/Awards.tsx`: `[ RECOGNITION ]`
   mono section label (match how other sections do headings), rows of
   date + title + description separated by `border-line` rules.
3. Render on the homepage (between Recommendations and Contact — before or
   after WritingPreview, order: Recommendations → Awards → Writing →
   Contact) ONLY when at least one award is seeded. **Seed none** — Jerome
   adds real entries in `/backstage`.

---

## Explicitly NOT adopting from the reference site

- **Dark theme** — the cream/orange identity is this site's differentiation
  from exactly this kind of dark-mode portfolio; keep it.
- **Custom cursor** — novelty, accessibility cost, no hiring value.
- **Mission/Vision manifesto blocks** — designer-portfolio speak; the About
  section already carries this weight in fewer words.
- **Password-protected case studies** — the `confidential` badge (Phase A)
  covers the same need without login friction.
- **Marquee/duplicate skill lists** — already have `Marquee`; do not add
  more instances.

---

## Verification checklist

- [ ] `pnpm build` clean; `pnpm generate:types` no diff
- [ ] Fresh seed: homepage renders in EN and DE with no empty-looking
      sections (Awards and Writing absent, not broken)
- [ ] Work cards: metric callout renders when metrics exist; confidential
      badge suppresses live/repo links on detail page
- [ ] `/en/work` and `/de/work` render; "All case studies →" appears only
      when non-featured studies exist
- [ ] Experience timeline: dots aligned on the line at 375px, 768px, 1280px
- [ ] Stat counters animate once on scroll; static under
      `prefers-reduced-motion` (test via devtools emulation)
- [ ] Header: transparent at top, blurred after scrolling past hero;
      underline animation visible on keyboard focus
- [ ] Footer hub shows email + all seeded socials with localized action
      labels in both locales
- [ ] No color/typography drift: every new element uses existing tokens
      (`text-ink`, `text-ink-muted`, `text-accent-strong`, `border-line`,
      `bg-surface`, `mono-label`, serif/body/mono font vars)
- [ ] Lighthouse accessibility score not lower than before the changes
