import React from 'react'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/motion/Parallax'
import type { Home, Media } from '@/payload-types'

export function About({ home }: { home: Home }) {
  const about = home.about
  const portrait = about?.portraitImage as Media | null | undefined

  return (
    <section id="about" aria-labelledby="about-heading" className="section-pad">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal as="h2" variant="clip" id="about-heading" className="text-h2 font-semibold text-ink">
            {about?.heading}
          </Reveal>
          {about?.body ? (
            <Reveal delay={0.15} className="prose-about mt-8 max-w-prose space-y-5 text-body-lg text-ink-muted">
              <RichText data={about.body} />
            </Reveal>
          ) : null}

          <Reveal as="ul" stagger className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {(about?.factList ?? []).map((fact) => (
              <li key={fact.id} className="border-t border-line pt-4">
                <p className="text-h3 font-medium text-ink">{fact.value}</p>
                <p className="mono-label mt-1 text-ink-muted">{fact.label}</p>
              </li>
            ))}
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Parallax speed={0.12}>
            {portrait?.url ? (
              <Image
                src={portrait.url}
                alt={portrait.alt ?? ''}
                width={portrait.width ?? 640}
                height={portrait.height ?? 800}
                className="media-desat w-full rounded-xl object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full rounded-xl bg-surface" aria-hidden="true" />
            )}
          </Parallax>
        </div>
      </div>
    </section>
  )
}
