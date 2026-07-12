import React from 'react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/motion/Reveal'
import type { Home, CaseStudy, Media } from '@/payload-types'

/**
 * Work grid (plan/04). Zero published case studies → intro copy only,
 * no placeholder cards, no "coming soon" (owner rule).
 */
export async function Work({ home, caseStudies }: { home: Home; caseStudies: CaseStudy[] }) {
  const t = await getTranslations('work')

  return (
    <section id="work" aria-labelledby="work-heading" className="section-pad">
      <div className="container-site">
        <Reveal as="h2" variant="clip" id="work-heading" className="text-h2 font-semibold text-ink">
          {home.workIntro?.heading}
        </Reveal>
        {home.workIntro?.body ? (
          <Reveal as="p" delay={0.15} className="mt-6 max-w-xl text-body-lg text-ink-muted">
            {home.workIntro.body}
          </Reveal>
        ) : null}

        {caseStudies.length > 0 ? (
          <Reveal as="ul" stagger className="mt-14 grid gap-8 md:grid-cols-2">
            {caseStudies.map((cs) => {
              const cover = cs.coverImage as Media
              return (
                <li key={cs.id} className="group">
                  <Link href={`/work/${cs.slug}`} className="block">
                    <div className="overflow-hidden rounded-xl bg-surface">
                      {cover?.url ? (
                        <Image
                          src={cover.url}
                          alt={cover.alt ?? cs.title}
                          width={cover.width ?? 960}
                          height={cover.height ?? 640}
                          className="media-desat aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="aspect-[3/2] w-full" aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <h3 className="text-h3 font-medium text-ink">{cs.title}</h3>
                      <span className="mono-label shrink-0 text-ink-muted">{cs.year}</span>
                    </div>
                    <p className="mt-2 max-w-md text-ink-muted">{cs.summary}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="mono-label rounded-full border border-line px-3 py-1 text-accent-strong">
                        {cs.projectType}
                      </span>
                      {(cs.stack ?? []).slice(0, 4).map((s) => (
                        <span key={s.id} className="mono-label rounded-full border border-line px-3 py-1 text-ink-muted">
                          {s.tech}
                        </span>
                      ))}
                    </div>
                    <span className="mono-label mt-5 inline-block text-ink underline-offset-4 group-hover:underline">
                      {t('view')} →
                    </span>
                  </Link>
                </li>
              )
            })}
          </Reveal>
        ) : null}
      </div>
    </section>
  )
}
