import React from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'

/**
 * Mono eyebrow above a section heading — `[ Selected work ]`, `[ Praise ]`.
 * Bracketed, unnumbered, matching the reference site. Reveals with the
 * heading; label text comes from the `sections` translation namespace.
 */
export function SectionEyebrow({ label, className }: { label: string; className?: string }) {
  return (
    <Reveal as="p" className={cn('mono-label mb-4 text-ink-muted', className)}>
      {label}
    </Reveal>
  )
}
