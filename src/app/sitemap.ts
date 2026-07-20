import type { MetadataRoute } from 'next'
import { routing, type Locale } from '@/i18n/routing'
import { absoluteUrl, buildLanguageAlternates } from '@/lib/seo'
import { getPublishedCaseStudies, getPublishedPosts } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    entries.push({
      url: absoluteUrl(`/${locale}`),
      alternates: { languages: buildLanguageAlternates('') },
    })
    entries.push({
      url: absoluteUrl(`/${locale}/imprint`),
      alternates: { languages: buildLanguageAlternates('/imprint') },
    })
    entries.push({
      url: absoluteUrl(`/${locale}/privacy`),
      alternates: { languages: buildLanguageAlternates('/privacy') },
    })
    entries.push({
      url: absoluteUrl(`/${locale}/work`),
      alternates: { languages: buildLanguageAlternates('/work') },
    })
    entries.push({
      url: absoluteUrl(`/${locale}/writing`),
      alternates: { languages: buildLanguageAlternates('/writing') },
    })

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
