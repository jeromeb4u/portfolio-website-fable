import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Locale } from '@/i18n/routing'

export const getPayloadClient = () => getPayload({ config })

export async function getSiteSettings(locale: Locale) {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })
}

export async function getNavigation(locale: Locale) {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
}

export async function getHome(locale: Locale) {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'home', locale, depth: 2 })
}

export async function getPublishedCaseStudies(locale: Locale) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'case-studies',
    locale,
    depth: 1,
    sort: 'order',
    where: { _status: { equals: 'published' } },
    limit: 50,
  })
  return result.docs
}

// Homepage shows featured only (ui-improvements Phase B); /work shows everything.
export async function getFeaturedCaseStudies(locale: Locale) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'case-studies',
    locale,
    depth: 1,
    sort: 'order',
    where: { and: [{ _status: { equals: 'published' } }, { featured: { equals: true } }] },
    limit: 50,
  })
  return result.docs
}

export async function getCaseStudyBySlug(slug: string, locale: Locale) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'case-studies',
    locale,
    depth: 2,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  })
  return result.docs[0] ?? null
}

export async function getLegalPage(slug: 'imprint' | 'privacy', locale: Locale) {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug, locale, depth: 0 })
}

export async function getPublishedPosts(locale: Locale) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    locale,
    depth: 1,
    sort: '-publishedDate',
    where: { _status: { equals: 'published' } },
    limit: 100,
  })
  return result.docs
}

export async function getPostBySlug(slug: string, locale: Locale) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    locale,
    depth: 1,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  })
  return result.docs[0] ?? null
}
