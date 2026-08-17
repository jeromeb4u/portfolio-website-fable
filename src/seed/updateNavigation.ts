import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * One-off: rewrite the Navigation global to the reference site's shape — every
 * header link is a real page. Section jumping is the vertical rail's job, not
 * the header's.
 *
 * Run with:  pnpm payload run src/seed/updateNavigation.ts
 * Safe to re-run — it only touches the `navigation` global.
 */
type NavSeed = {
  kind: 'page' | 'section'
  href?: string
  anchor?: string
  en: string
  de: string
}

const ITEMS: NavSeed[] = [
  { kind: 'page' as const, href: '/', en: 'Home', de: 'Start' },
  { kind: 'page' as const, href: '/work', en: 'Work', de: 'Projekte' },
  { kind: 'page' as const, href: '/about', en: 'About', de: 'Über mich' },
  { kind: 'page' as const, href: '/recognition', en: 'Recognition', de: 'Stimmen' },
  { kind: 'page' as const, href: '/writing', en: 'Writing', de: 'Artikel' },
]

const run = async () => {
  const payload = await getPayload({ config })

  // English first, which (re)creates the array rows. The German pass must
  // reuse those row ids — writing a fresh array per locale would replace the
  // rows and drop the English labels with them.
  const en = await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: {
      items: ITEMS.map((item) => ({
        label: item.en,
        kind: item.kind,
        anchor: item.anchor ?? null,
        href: item.href ?? null,
      })),
      ctaLabel: 'Get in touch',
    },
  })
  payload.logger.info('navigation updated (en)')

  const ids = (en.items ?? []).map((row) => row.id)
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'de',
    data: {
      items: ITEMS.map((item, index) => ({
        id: ids[index],
        label: item.de,
        kind: item.kind,
        anchor: item.anchor ?? null,
        href: item.href ?? null,
      })),
      ctaLabel: 'Kontakt aufnehmen',
    },
  })
  payload.logger.info('navigation updated (de)')

  process.exit(0)
}

await run()
