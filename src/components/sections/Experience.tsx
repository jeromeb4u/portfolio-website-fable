import React from 'react'
import { Reveal } from '@/components/motion/Reveal'
import type { Home } from '@/payload-types'

export function Experience({ home }: { home: Home }) {
  const exp = home.experience

  return (
    <section id="experience" aria-labelledby="experience-heading" className="section-pad bg-surface">
      <div className="container-site">
        <Reveal as="h2" variant="clip" id="experience-heading" className="text-h2 font-semibold text-ink">
          {exp?.heading}
        </Reveal>

        <ol className="mt-14">
          {(exp?.entries ?? []).map((entry, i) => (
            <Reveal
              as="li"
              key={entry.id}
              delay={0.05}
              className="grid gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-8"
            >
              <div className="md:col-span-3">
                <p className="mono-label text-ink-muted">
                  {entry.dateStart} — {entry.dateEnd}
                </p>
                <p className="mono-label mt-2 text-accent-strong">{String(i + 1).padStart(2, '0')}</p>
              </div>
              <div className="md:col-span-9">
                <h3 className="text-h3 font-medium text-ink">{entry.role}</h3>
                <p className="mt-1 text-body-lg text-ink-muted">
                  {entry.company}
                  {entry.clientNote ? <span className="serif-italic"> · {entry.clientNote}</span> : null}
                </p>
                <ul className="mt-5 max-w-2xl space-y-2.5">
                  {(entry.bullets ?? []).map((bullet) => (
                    <li key={bullet.id} className="flex gap-3 text-ink-muted">
                      <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {bullet.text}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
