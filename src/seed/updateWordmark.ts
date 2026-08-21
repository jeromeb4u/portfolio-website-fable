import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * The header wordmark and the hero name are set in Elsie, whose straight
 * quote (U+0027) is a bare vertical stroke on wide sidebearings — "D'mello"
 * reads as three detached pieces. The typographic apostrophe (U+2019) is drawn
 * as a proper comma form and sets ~0.19em tighter at display size, so the
 * stored name uses that.
 *
 * Run: pnpm payload run src/seed/updateWordmark.ts
 */
const payload = await getPayload({ config })

for (const locale of ['en', 'de'] as const) {
  const settings = await payload.findGlobal({ slug: 'site-settings', locale })
  const siteName = settings.siteName?.replace(/'/g, '\u2019')
  if (!siteName || siteName === settings.siteName) {
    payload.logger.info(`wordmark already typographic (${locale})`)
    continue
  }
  await payload.updateGlobal({ slug: 'site-settings', locale, data: { siteName } })
  payload.logger.info(`wordmark updated (${locale}): ${siteName}`)
}

process.exit(0)
