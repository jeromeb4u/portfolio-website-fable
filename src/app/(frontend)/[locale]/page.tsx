import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing, type Locale } from '@/i18n/routing'
import { getHome, getSiteSettings, getPublishedCaseStudies } from '@/lib/data'

// Content edits in /backstage revalidate via afterChange hooks; this is a fallback.
export const revalidate = 300

/*
  Phase 1 skeleton: semantic structure + CMS data flow only.
  Visual build happens in Phase 4 per plan/04-components.md — do NOT style here.
*/
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [home, settings, caseStudies] = await Promise.all([
    getHome(locale as Locale),
    getSiteSettings(locale as Locale),
    getPublishedCaseStudies(locale as Locale),
  ])

  const recommendations = (home.recommendations?.entries ?? []).filter(
    (entry) => entry.consentConfirmed,
  )

  return (
    <>
      <section id="hero" aria-label="Intro">
        {home.hero?.eyebrow ? <p>{home.hero.eyebrow}</p> : null}
        <h1>
          {home.hero?.headingLine1}
          {home.hero?.headingLine2 ? <span> {home.hero.headingLine2}</span> : null}
        </h1>
        {home.hero?.subheading ? <p>{home.hero.subheading}</p> : null}
        <p>{settings.availabilityNote}</p>
      </section>

      <section id="about" aria-labelledby="about-heading">
        <h2 id="about-heading">{home.about?.heading}</h2>
        <ul>
          {(home.about?.factList ?? []).map((fact) => (
            <li key={fact.id}>
              <strong>{fact.label}</strong>: {fact.value}
            </li>
          ))}
        </ul>
      </section>

      <section id="experience" aria-labelledby="experience-heading">
        <h2 id="experience-heading">{home.experience?.heading}</h2>
        <ol>
          {(home.experience?.entries ?? []).map((entry) => (
            <li key={entry.id}>
              <h3>
                {entry.role} — {entry.company}
              </h3>
              <p>
                {entry.dateStart} – {entry.dateEnd}
              </p>
              {entry.clientNote ? <p>{entry.clientNote}</p> : null}
              <ul>
                {(entry.bullets ?? []).map((bullet) => (
                  <li key={bullet.id}>{bullet.text}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section id="skills" aria-labelledby="skills-heading">
        <h2 id="skills-heading">{home.skills?.heading}</h2>
        {(home.skills?.groups ?? []).map((group) => (
          <div key={group.id}>
            <h3>{group.groupLabel}</h3>
            <ul>
              {(group.items ?? []).map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section id="work" aria-labelledby="work-heading">
        <h2 id="work-heading">{home.workIntro?.heading}</h2>
        {home.workIntro?.body ? <p>{home.workIntro.body}</p> : null}
        {caseStudies.length > 0 ? (
          <ul>
            {caseStudies.map((cs) => (
              <li key={cs.id}>
                <a href={`/${locale}/work/${cs.slug}`}>{cs.title}</a> — {cs.summary}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {recommendations.length > 0 ? (
        <section id="recommendations" aria-labelledby="recommendations-heading">
          <h2 id="recommendations-heading">{home.recommendations?.heading}</h2>
          {recommendations.map((entry) => (
            <blockquote key={entry.id}>
              <p>{entry.quote}</p>
              <footer>
                {entry.authorName}, {entry.authorTitle}, {entry.authorCompany}
              </footer>
            </blockquote>
          ))}
        </section>
      ) : null}

      <section id="contact" aria-labelledby="contact-heading">
        <h2 id="contact-heading">{home.contact?.heading}</h2>
        {home.contact?.body ? <p>{home.contact.body}</p> : null}
        <a href={`mailto:${settings.email}`}>{settings.email}</a>
      </section>
    </>
  )
}
