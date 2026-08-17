import React from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { SectionEyebrow } from '@/components/ui/SectionEyebrow'

/**
 * Shared masthead for every standalone page (/work, /about, /recognition,
 * /writing): bracketed mono eyebrow, serif display heading, optional lede.
 *
 * One component so the pages can never drift apart — the header offset, the
 * type ramp and the reveal timing are decided here, once.
 */
export function PageIntro({
  eyebrow,
  heading,
  lede,
}: {
  eyebrow: string
  heading: string
  lede?: string
}) {
  return (
    <div className="container-site pb-4 pt-40">
      <SectionEyebrow label={eyebrow} />
      <Reveal as="h1" variant="clip" className="font-serif text-display text-ink">
        {heading}
      </Reveal>
      {lede ? (
        <Reveal as="p" delay={0.15} className="mt-6 max-w-xl text-body-lg text-ink-muted">
          {lede}
        </Reveal>
      ) : null}
    </div>
  )
}
