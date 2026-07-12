# 04 — Components

All visual styling values come from 01-design-system.md tokens. Components are server components unless marked `client`.
Every component that shows text receives it via props from CMS — no literals.

## layout/

| Component | Notes |
|---|---|
| `SmoothScrollProvider` (client) | Lenis instance, syncs ScrollTrigger, respects `prefers-reduced-motion` (disable Lenis entirely → native scroll) |
| `Header` | logo/wordmark, nav from `navigation` global, locale switcher, CTA button. Hide-on-scroll-down/show-on-up (GSAP). Mobile: shadcn Sheet |
| `Footer` | tagline, socials, email, imprint/privacy links, "built with" line |
| `LocaleSwitcher` (client) | EN/DE toggle preserving path |
| `SectionShell` | consistent vertical rhythm + max-width wrapper; every home section uses it |

## motion/ (all client)

| Component | Purpose |
|---|---|
| `RevealText` | SplitText char/line reveal on scroll-enter; props: `as`, `splitBy`, `stagger`. Reduced-motion: render static |
| `ParallaxLayer` | translateY parallax via ScrollTrigger scrub; prop `speed` |
| `MagneticButton` | pointer-follow magnet effect on desktop pointers only |
| `CountUp` | number tween on enter (metrics) |
| `MarqueeRow` | infinite marquee (skills/stack strip); pauses on hover; reduced-motion: static wrap |
| `PageTransition` | route-change overlay wipe (GSAP timeline + next navigation events) |

## three/ (all client, all `next/dynamic` ssr:false)

| Component | Purpose |
|---|---|
| `HeroScene` | Spline scene from CMS `splineSceneUrl`. Mount rules: viewport ≥1024px AND `(pointer: fine)` AND no reduced-motion, else render `splinePosterImage`. IntersectionObserver mount/unmount |
| `AmbientParticles` | r3f points field, ≤2k particles, dpr capped [1,1.5], `frameloop="demand"` scroll-driven. Used ONLY where 05-animations.md says |

## sections/ (home)

| Component | CMS source | Key behavior |
|---|---|---|
| `Hero` | home.hero | headline RevealText, HeroScene right/behind, availability pill, scroll cue |
| `About` | home.about | portrait ParallaxLayer, factList staggered reveal |
| `Experience` | home.experience | vertical timeline, entries pin+step on desktop (ScrollTrigger), plain stack mobile |
| `Skills` | home.skills | grouped MarqueeRow strips |
| `WorkGrid` | case-studies (published, by order) | cards: coverImage, hover coverVideo autoplay muted, title, projectType tag, stack chips. Grid adapts 1–3 cols. **If zero published: section renders workIntro heading + body only — no empty cards, no "coming soon"** |
| `Recommendations` | home.recommendations (consentConfirmed only) | oversized quote treatment, author + company (Truist ok), link to LinkedIn rec if sourceUrl |
| `ContactCta` | home.contact + site-settings | big email link + `ContactForm` |

## sections/case-study

| Component | Notes |
|---|---|
| `CaseHero` | title, summary, meta row (year, role, stack), cover full-bleed |
| `CaseBody` | lexical renderer with custom blocks: image (zoom-on-scroll), code (shiki), callout, stat-row (CountUp) |
| `CaseNav` | prev/next published case study |

## forms/

`ContactForm` (client): react-hook-form + zod (name ≥2, valid email, message ≥20). Honeypot field + min-3s-fill time check (spam). Submit → `/api/contact` → Resend email to CONTACT_TO_EMAIL + create `contact-submissions` entry. States: idle/submitting/success/error using CMS messages. sonner toast on result.

## ui/
shadcn primitives listed in 02-tech-stack.md, restyled via tokens. Never import a shadcn component not on that list.
