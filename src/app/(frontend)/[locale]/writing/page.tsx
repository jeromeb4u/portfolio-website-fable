import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getPublishedPosts } from '@/lib/data'
import { WritingList } from '@/components/sections/WritingList'
import { buildLanguageAlternates, buildOpenGraph, absoluteUrl } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'writing' })
  const title = t('title')
  return {
    title,
    alternates: {
      canonical: absoluteUrl(`/${locale}/writing`),
      languages: buildLanguageAlternates('/writing'),
    },
    openGraph: buildOpenGraph({ locale, title, description: title, path: '/writing' }),
  }
}

// An empty index page must never ship — house rule. Zero published posts = 404,
// same as the CMS-emptiness pattern used everywhere else on this site.
export default async function WritingIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const posts = await getPublishedPosts(locale as Locale)
  if (posts.length === 0) notFound()

  return <WritingList posts={posts} locale={locale as Locale} />
}
