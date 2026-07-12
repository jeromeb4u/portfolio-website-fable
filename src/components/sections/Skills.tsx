import React from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { Marquee } from '@/components/motion/Marquee'
import type { Home } from '@/payload-types'

/** Grouped marquee strips (plan/05 A9), alternating drift direction. */
export function Skills({ home }: { home: Home }) {
  const skills = home.skills

  return (
    <section id="skills" aria-labelledby="skills-heading" className="section-pad overflow-hidden">
      <div className="container-site">
        <Reveal as="h2" variant="clip" id="skills-heading" className="text-h2 font-semibold text-ink">
          {skills?.heading}
        </Reveal>
      </div>

      <div className="mt-14 space-y-8">
        {(skills?.groups ?? []).map((group, i) => (
          <div key={group.id}>
            <p className="container-site mono-label mb-3 text-ink-muted">{group.groupLabel}</p>
            <Marquee reverse={i % 2 === 1} className="border-y border-line py-4">
              {(group.items ?? []).map((item) => (
                <span key={item.id} className="mx-6 whitespace-nowrap text-h3 text-ink">
                  {item.name}
                  <span aria-hidden="true" className="ml-12 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
                </span>
              ))}
            </Marquee>
          </div>
        ))}
      </div>
    </section>
  )
}
