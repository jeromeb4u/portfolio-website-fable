import React from 'react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/motion/Parallax'
import { CountUp } from '@/components/motion/CountUp'
import { SectionEyebrow } from '@/components/ui/SectionEyebrow'
import type { Home, Media } from '@/payload-types'

/**
 * With no portrait uploaded the section is a single centered column — never
 * an empty image frame (house rule: no placeholders). The portrait column
 * appears only once a real photo exists in /backstage.
 */
export async function About({ home }: { home: Home }) {
  const about = home.about
  const portrait = about?.portraitImage as Media | null | undefined
  const hasPortrait = Boolean(portrait?.url)
  const t = await getTranslations('sections')

  return (
    <section id="about" aria-labelledby="about-heading" className="section-pad">
      <div className={hasPortrait ? 'container-site grid gap-12 lg:grid-cols-12' : 'container-site'}>
        <div className={hasPortrait ? 'lg:col-span-7' : 'max-w-3xl'}>
          <SectionEyebrow label={t('about')} />
          <Reveal as="h2" variant="clip" id="about-heading" className="font-serif text-h2 text-ink">
            {about?.heading}
          </Reveal>
          {about?.body ? (
            <Reveal delay={0.15} className="prose-about mt-8 max-w-prose space-y-5 text-body-lg text-ink-muted">
              <RichText data={about.body} />
            </Reveal>
          ) : null}

          <Reveal as="ul" stagger className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {(about?.factList ?? []).map((fact) => (
              <li key={fact.id} className="border-t border-line pt-4">
                <p className="font-serif text-h3 text-ink">
                  <CountUp value={fact.value} />
                </p>
                <p className="mono-label mt-2 text-ink-muted">{fact.label}</p>
              </li>
            ))}
          </Reveal>
        </div>

        {hasPortrait ? (
          <div className="lg:col-span-5">
            <Parallax speed={0.12}>
              <Image
                src={portrait!.url!}
                alt={portrait!.alt ?? ''}
                width={portrait!.width ?? 640}
                height={portrait!.height ?? 800}
                className="media-desat w-full rounded-xl border border-line object-cover"
              />
            </Parallax>
          </div>
        ) : null}
      </div>
    </section>
  )
}
