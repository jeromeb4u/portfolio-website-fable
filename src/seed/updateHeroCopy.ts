import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Rewrites the hero copy to the reference site's pattern: a two-line mono
 * eyebrow (location, then disciplines), the NAME as the heading, one lead
 * sentence, then a supporting paragraph of concrete facts.
 *
 * Every claim below is already elsewhere in the CMS (Infosys 2019–2025, the
 * AngularJS→Angular 16 migration with a 25-engineer offshore team, Truist and
 * Optus, freelance since Feb 2025, relocating to Germany) — this is a rewrite,
 * not new biography.
 *
 * Run: pnpm payload run src/seed/updateHeroCopy.ts
 */
const HERO = {
  en: {
    eyebrow:
      'Frontend Engineer · React & Next.js · Angular at enterprise scale · AI tools & automation',
    headingLine1: 'Jerome',
    headingLine2: "D’mello",
    subheading:
      'I build frontends that large teams can keep shipping — and the AI tooling that takes the repetitive work off them.',
    body: "Five and a half years at Infosys on enterprise platforms for Truist and Optus, including an AngularJS-to-Angular 16 migration delivered by a 25-engineer offshore team. Independent since February 2025: React applications, AI tools and automation for founders and small businesses. Relocating to Germany.",
    primaryCtaLabel: 'See my work',
  },
  de: {
    eyebrow:
      'Frontend-Entwickler · React & Next.js · Angular auf Enterprise-Niveau · KI-Tools & Automatisierung',
    headingLine1: 'Jerome',
    headingLine2: "D’mello",
    subheading:
      'Ich baue Frontends, an denen große Teams weiterarbeiten können — und die KI-Tools, die ihnen die Fleißarbeit abnehmen.',
    body: 'Fünfeinhalb Jahre bei Infosys an Enterprise-Plattformen für Truist und Optus, darunter eine AngularJS-zu-Angular-16-Migration mit einem 25-köpfigen Offshore-Team. Seit Februar 2025 selbstständig: React-Anwendungen, KI-Tools und Automatisierung für Gründer und kleine Unternehmen. Umzug nach Deutschland geplant.',
    primaryCtaLabel: 'Projekte ansehen',
  },
} as const

const payload = await getPayload({ config })

for (const locale of ['en', 'de'] as const) {
  const home = await payload.findGlobal({ slug: 'home', locale })
  await payload.updateGlobal({
    slug: 'home',
    locale,
    data: { hero: { ...home.hero, ...HERO[locale] } },
  })
  payload.logger.info(`hero copy updated (${locale})`)
}

process.exit(0)
