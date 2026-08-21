import type { MetadataRoute } from 'next'
import { routing, type Locale } from '@/i18n/routing'
import { absoluteUrl, buildLanguageAlternates } from '@/lib/seo'
import { getPublishedCaseStudies, getPublishedPosts } from '@/lib/data'

/** Every non-dynamic route under app/(frontend)/[locale]. Keep in step with
 *  that directory — /about and /recognition are linked from the main nav and
 *  were previously absent here, so search engines only ever reached them by
 *  crawling the header. */
const STATIC_PATHS = ['', '/about', '/recognition', '/work', '/writing', '/imprint', '/privacy']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(`/${locale}${path}`),
        alternates: { languages: buildLanguageAlternates(path) },
      })
    }

    const [caseStudies, posts] = await Promise.all([
      getPublishedCaseStudies(locale as Locale),
      getPublishedPosts(locale as Locale),
    ])

    for (const cs of caseStudies) {
      entries.push({
        url: absoluteUrl(`/${locale}/work/${cs.slug}`),
        alternates: { languages: buildLanguageAlternates(`/work/${cs.slug}`) },
      })
    }

    for (const post of posts) {
      entries.push({
        url: absoluteUrl(`/${locale}/writing/${post.slug}`),
        alternates: { languages: buildLanguageAlternates(`/writing/${post.slug}`) },
      })
    }
  }

  return entries
}
