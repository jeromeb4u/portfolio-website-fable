import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Flip `consentConfirmed` on every recommendation entry, in both locales.
 * Jerome has confirmed the quotes are approved for publication.
 *
 * Run: pnpm payload run src/seed/approveRecommendations.ts
 */
const payload = await getPayload({ config })

for (const locale of ['en', 'de'] as const) {
  const home = await payload.findGlobal({ slug: 'home', locale })
  const entries = home.recommendations?.entries ?? []
  if (entries.length === 0) continue

  await payload.updateGlobal({
    slug: 'home',
    locale,
    data: {
      recommendations: {
        ...home.recommendations,
        entries: entries.map((entry) => ({ ...entry, consentConfirmed: true })),
      },
    },
  })
  payload.logger.info(`${entries.length} recommendation(s) approved (${locale})`)
}

process.exit(0)
