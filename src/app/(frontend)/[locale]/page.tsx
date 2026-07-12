import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing, type Locale } from '@/i18n/routing'
import { getHome, getSiteSettings, getPublishedCaseStudies } from '@/lib/data'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Experience } from '@/components/sections/Experience'
import { Skills } from '@/components/sections/Skills'
import { Work } from '@/components/sections/Work'
import { Recommendations } from '@/components/sections/Recommendations'
import { Contact } from '@/components/sections/Contact'

// Content edits in /backstage revalidate via afterChange hooks; this is a fallback.
export const revalidate = 300

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [home, settings, caseStudies] = await Promise.all([
    getHome(locale as Locale),
    getSiteSettings(locale as Locale),
    getPublishedCaseStudies(locale as Locale),
  ])

  // Consent gate: quotes appear only after written approval from the author.
  const recommendations = (home.recommendations?.entries ?? []).filter(
    (entry) => entry.consentConfirmed,
  )

  return (
    <>
      <Hero home={home} settings={settings} />
      <About home={home} />
      <Experience home={home} />
      <Skills home={home} />
      <Work home={home} caseStudies={caseStudies} />
      <Recommendations home={home} entries={recommendations} />
      <Contact home={home} settings={settings} />
    </>
  )
}
