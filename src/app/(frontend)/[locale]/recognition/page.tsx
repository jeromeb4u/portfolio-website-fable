import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getHome } from '@/lib/data'
import { PageIntro } from '@/components/layout/PageIntro'
import { Recommendations } from '@/components/sections/Recommendations'
import { Awards } from '@/components/sections/Awards'
import { buildLanguageAlternates, buildOpenGraph, absoluteUrl } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'pages' })
  const title = t('recognitionTitle')
  const description = t('recognitionDescription')
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/recognition`),
      languages: buildLanguageAlternates('/recognition'),
    },
    openGraph: buildOpenGraph({ locale, title, description, path: '/recognition' }),
  }
}

/**
 * Recognition: the recommendations in full, plus any award entries added in
 * /backstage. Both sections are the homepage components, so the consent gate
 * and the empty-state behaviour are identical here.
 */
export default async function RecognitionPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [home, t] = await Promise.all([getHome(locale as Locale), getTranslations('pages')])

  // Same consent gate as the homepage: only approved quotes are published.
  const entries = (home.recommendations?.entries ?? []).filter((entry) => entry.consentConfirmed)

  return (
    <>
      <PageIntro
        eyebrow={t('recognitionEyebrow')}
        heading={t('recognitionTitle')}
        lede={t('recognitionLede')}
      />
      <Recommendations home={home} entries={entries} />
      <Awards home={home} />
    </>
  )
}
