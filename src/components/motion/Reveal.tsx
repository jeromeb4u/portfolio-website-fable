'use client'

import React, { useRef, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type RevealProps = {
  as?: ElementType
  children: React.ReactNode
  className?: string
  /** 'rise' = translate+fade (default); 'clip' = clip-path heading reveal (A5) */
  variant?: 'rise' | 'clip'
  /** stagger direct children instead of animating the wrapper as one block */
  stagger?: boolean
  delay?: number
  id?: string
}

/**
 * Enter-viewport reveal (plan/05 A5/A7/A10). CSS sets the initial hidden state
 * via [data-reveal] under html.motion-ok, so there is no flash and no-JS users
 * see everything.
 */
export function Reveal({
  as: Tag = 'div',
  children,
  className,
  variant = 'rise',
  stagger = false,
  delay = 0,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      // Child effects run before the provider's effect adds `motion-ok`, so we
      // check the same media query the provider uses instead of the class.
      if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const targets = stagger ? Array.from(el.children) : [el]
      if (stagger) {
        // hidden state moves from wrapper to children
        el.removeAttribute('data-reveal')
        targets.forEach((t) => t.setAttribute('data-reveal', variant))
      }

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        clipPath: variant === 'clip' ? 'inset(0 0 0% 0)' : undefined,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        stagger: stagger ? 0.08 : 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          once: true,
        },
      })
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} id={id} data-reveal={variant} className={className}>
      {children}
    </Tag>
  )
}
