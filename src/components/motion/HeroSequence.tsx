'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

/**
 * Hero entrance as ONE orchestrated timeline (prompts/signature-interactions,
 * supporting polish §3) rather than per-element ScrollTrigger delays. Children
 * carry `data-seq` (order) and reuse the same `data-reveal` hidden states the
 * rest of the site keys off html.motion-ok — so no-JS and reduced-motion users
 * see the hero fully rendered with no flash. Runs once.
 */
const POS = [0, 0.08, 0.16, 0.32, 0.48, 0.56, 0.64] // seconds, per spec

export function HeroSequence({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const els = Array.from(root.querySelectorAll<HTMLElement>('[data-seq]')).sort(
        (a, b) => Number(a.dataset.seq) - Number(b.dataset.seq),
      )
      const tl = gsap.timeline({ defaults: { duration: 0.45, ease: 'power3.out' } })
      els.forEach((el, i) => {
        const clip = el.dataset.reveal === 'clip'
        tl.to(
          el,
          { opacity: 1, y: 0, clipPath: clip ? 'inset(0 0 0% 0)' : undefined },
          POS[i] ?? i * 0.08,
        )
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
