import React from 'react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing, type Locale } from '@/i18n/routing'
import {
  getHome,
  getSiteSettings,
  getFeaturedCaseStudies,
  getPublishedCaseStudies,
  getPublishedPosts,
} from '@/lib/data'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Experience } from '@/components/sections/Experience'
import { Skills } from '@/components/sections/Skills'
import { Work } from '@/components/sections/Work'
import { Recommendations } from '@/components/sections/Recommendations'
import { Awards } from '@/components/sections/Awards'
import { WritingPreview } from '@/components/sections/WritingPreview'
import { Contact } from '@/components/sections/Contact'
import { SectionRail } from '@/components/layout/SectionRail'

// Content edits in /backstage revalidate via afterChange hooks; this is a fallback.
export const revalidate = 300

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const otherLocale: Locale = locale === 'de' ? 'en' : 'de'
  const [home, altHome, settings, featuredCaseStudies, allCaseStudies, posts, tHero, tWork] =
    await Promise.all([
      getHome(locale as Locale),
      getHome(otherLocale),
      getSiteSettings(locale as Locale),
      getFeaturedCaseStudies(locale as Locale),
      getPublishedCaseStudies(locale as Locale),
      getPublishedPosts(locale as Locale),
      getTranslations('hero'),
      getTranslations('work'),
    ])
  const tRail = await getTranslations('rail')

  // Consent gate: quotes appear only after written approval from the author.
  const recommendations = (home.recommendations?.entries ?? []).filter(
    (entry) => entry.consentConfirmed,
  )
  // Homepage shows featured only (ui-improvements Phase B); the "all case
  // studies" link only appears when the archive holds more than what's shown.
  const hasMoreCaseStudies = allCaseStudies.length > featuredCaseStudies.length

  // Rail order mirrors the page order below, and only lists sections that
  // actually render — Recommendations, Writing and Awards all return null on
  // empty CMS content, and a marker pointing at a missing id is a dead click.
  const railItems = [
    { id: 'work', label: tRail('work') },
    ...(recommendations.length > 0
      ? [{ id: 'recommendations', label: tRail('recommendations') }]
      : []),
    { id: 'about', label: tRail('about') },
    { id: 'skills', label: tRail('skills') },
    { id: 'experience', label: tRail('experience') },
    ...(posts.length > 0 ? [{ id: 'writing', label: tRail('writing') }] : []),
    ...((home.awards ?? []).length > 0
      ? [{ id: 'recognition', label: tRail('recognition') }]
      : []),
    { id: 'contact', label: tRail('contact') },
  ]

  return (
    <>
      <SectionRail items={railItems} />
      <Hero
        home={home}
        settings={settings}
        locale={locale as Locale}
        contactFallbackLabel={tHero('getInTouch')}
        scrollCueLabel={tHero('scrollCue')}
        altEyebrow={altHome.hero?.eyebrow ?? undefined}
      />
      {/* Section order mirrors the reference site: work first (proof before
          biography), then testimonials, about, the systems/skills grid, the
          career timeline, writing, and the recognition callout. Contact closes
          the page. */}
      <Work
        home={home}
        caseStudies={featuredCaseStudies}
        showArchiveLink={hasMoreCaseStudies}
        archiveLinkLabel={tWork('allCaseStudies')}
        locale={locale as Locale}
      />
      <Recommendations home={home} entries={recommendations} />
      <About home={home} />
      <Skills home={home} />
      <Experience home={home} />
      <WritingPreview posts={posts} locale={locale as Locale} />
      <Awards home={home} />
      <Contact home={home} settings={settings} />
    </>
  )
}
