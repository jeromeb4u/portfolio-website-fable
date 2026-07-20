'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * FOUNDATIONS ———— TODAY progress rail for the experience timeline. The rust
 * fill tracks how far the reader has scrolled through the enclosing <section>,
 * mirroring the sticky-header journey meter on the reference site. Reduced
 * motion / no-JS: the rail simply sits full.
 */
export function JourneyProgress({
  startLabel,
  endLabel,
  className,
}: {
  startLabel: string
  endLabel: string
  className?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const section = wrap.current?.closest('section')
      const bar = fill.current
      if (!section || !bar) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bar.style.transform = 'scaleX(1)'
        return
      }
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 65%',
        end: 'bottom 85%',
        onUpdate: (self) => {
          gsap.set(bar, { scaleX: Math.max(0.02, self.progress) })
        },
      })
      return () => st.kill()
    },
    { scope: wrap },
  )

  return (
    <div ref={wrap} className={cn('max-w-sm', className)}>
      <div className="mono-label flex items-center justify-between text-[0.65rem] text-ink-muted">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
      <div className="mt-2 h-px w-full bg-line">
        <span
          ref={fill}
          className="block h-full origin-left scale-x-[0.02] bg-accent"
        />
      </div>
    </div>
  )
}
