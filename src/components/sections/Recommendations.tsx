import React from 'react'
import { Reveal } from '@/components/motion/Reveal'
import type { Home } from '@/payload-types'

type Entry = NonNullable<NonNullable<Home['recommendations']>['entries']>[number]

/** Renders ONLY consent-confirmed quotes (filtered by the page). */
export function Recommendations({ home, entries }: { home: Home; entries: Entry[] }) {
  if (entries.length === 0) return null

  return (
    <section id="recommendations" aria-labelledby="recommendations-heading" className="section-pad bg-surface">
      <div className="container-site">
        <Reveal as="h2" variant="clip" id="recommendations-heading" className="text-h2 font-semibold text-ink">
          {home.recommendations?.heading}
        </Reveal>

        <div className="mt-14 grid gap-14">
          {entries.map((entry) => (
            <Reveal as="blockquote" key={entry.id} className="max-w-3xl">
              <p className="serif-italic text-h3 leading-snug text-ink">
                <span aria-hidden="true" className="mr-1 text-accent">
                  “
                </span>
                {entry.quote}
                <span aria-hidden="true" className="ml-1 text-accent">
                  ”
                </span>
              </p>
              <footer className="mt-5">
                <p className="font-medium text-ink">{entry.authorName}</p>
                <p className="mono-label mt-1 text-ink-muted">
                  {entry.authorTitle} · {entry.authorCompany}
                </p>
                {entry.sourceUrl ? (
                  <a
                    href={entry.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono-label mt-2 inline-block text-accent-strong underline-offset-4 hover:underline"
                  >
                    LINKEDIN ↗
                  </a>
                ) : null}
              </footer>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
