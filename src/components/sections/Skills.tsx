import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/motion/Reveal'
import { SectionEyebrow } from '@/components/ui/SectionEyebrow'
import type { Home } from '@/payload-types'

/**
 * Static grouped index — mono group label left, items right, hairline rows.
 * Replaced the four auto-scrolling marquees: motion carried no information
 * there (and fought the fixed header); a scannable table reads senior.
 */
export async function Skills({ home }: { home: Home }) {
  const skills = home.skills
  const t = await getTranslations('sections')

  return (
    <section id="skills" aria-labelledby="skills-heading" className="section-pad">
      <div className="container-site">
        <SectionEyebrow label={t('skills')} />
        <Reveal as="h2" variant="clip" id="skills-heading" className="font-serif text-h2 text-ink">
          {skills?.heading}
        </Reveal>

        <div className="mt-14 border-t border-line">
          {(skills?.groups ?? []).map((group) => (
            <Reveal
              key={group.id}
              className="grid gap-y-3 border-b border-line py-7 md:grid-cols-12 md:gap-x-8"
            >
              <p className="mono-label text-ink-muted md:col-span-3 md:pt-1">{group.groupLabel}</p>
              <ul className="flex flex-wrap gap-x-2 gap-y-2 md:col-span-9">
                {(group.items ?? []).map((item, i) => (
                  <li key={item.id} className="flex items-center text-body-lg text-ink">
                    {i > 0 ? (
                      <span
                        aria-hidden="true"
                        className="mx-3 inline-block h-1 w-1 rounded-full bg-accent"
                      />
                    ) : null}
                    {item.name}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
