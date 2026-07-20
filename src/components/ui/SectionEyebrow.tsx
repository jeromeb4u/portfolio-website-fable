import React from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'

/**
 * Mono eyebrow above a section heading — `ABOUT — 01` … `CONTACT — 06`. The
 * index encodes real reading order (an acceptable use of numbering, per the
 * design rules), and reveals with the heading. Label text comes from the
 * `sections` translation namespace.
 */
export function SectionEyebrow({ label, className }: { label: string; className?: string }) {
  return (
    <Reveal as="p" className={cn('mono-label mb-4 text-ink-muted', className)}>
      {label}
    </Reveal>
  )
}
