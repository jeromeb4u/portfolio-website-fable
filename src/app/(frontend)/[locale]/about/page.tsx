import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getHome } from '@/lib/data'
import { PageIntro } from '@/components/layout/PageIntro'
import { About } from '@/components/sections/About'
import { Experience } from '@/components/sections/Experience'
import { Skills } from '@/components/sections/Skills'
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
  const title = t('aboutTitle')
  const description = t('aboutDescription')
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/about`),
      languages: buildLanguageAlternates('/about'),
    },
    openGraph: buildOpenGraph({ locale, title, description, path: '/about' }),
  }
}

/**
 * The About page the header links to: the same three CMS-driven sections the
 * homepage summarises (bio, journey, systems), given a page of their own so
 * the nav points at a real destination rather than a scroll position.
 *
 * Section components are shared with the homepage — one source of truth, so
 * a CMS edit lands in both places.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [home, t] = await Promise.all([
    getHome(locale as Locale),
    getTranslations('pages'),
  ])

  return (
    <>
      <PageIntro
        eyebrow={t('aboutEyebrow')}
        heading={t('aboutTitle')}
        lede={t('aboutLede')}
      />
      <About home={home} hideHeading />
      <Experience home={home} />
      <Skills home={home} />
    </>
  )
}
