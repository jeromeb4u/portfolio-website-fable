import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getPublishedCaseStudies } from '@/lib/data'
import { WorkArchive } from '@/components/sections/WorkArchive'
import { buildLanguageAlternates, buildOpenGraph, absoluteUrl } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'work' })
  const title = t('workArchiveTitle')
  const description = t('workArchiveDescription')
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/work`),
      languages: buildLanguageAlternates('/work'),
    },
    openGraph: buildOpenGraph({ locale, title, description, path: '/work' }),
  }
}

export default async function WorkIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const caseStudies = await getPublishedCaseStudies(locale as Locale)

  return <WorkArchive caseStudies={caseStudies} />
}
