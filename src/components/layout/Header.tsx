'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { LocaleSwitcher } from './LocaleSwitcher'
import { buttonClasses } from '@/components/ui/Button'
import { BilingualFlip } from '@/components/motion/BilingualFlip'

type NavItem = { label: string; anchor: string; altLabel: string; id?: string | null }

/**
 * Hide-on-scroll-down / show-on-up header (plan/05 A4). Client component:
 * needs scroll listeners + mobile menu state. Content comes from CMS via props.
 * Desktop nav labels + CTA run the bilingual decode flip on hover/focus; over
 * the dark footer the chrome recolors to inverse via an IO sentinel.
 */
export function Header({
  siteName,
  items,
  ctaLabel,
  ctaAltLabel,
  openMenuLabel,
  closeMenuLabel,
}: {
  siteName: string
  items: NavItem[]
  ctaLabel: string
  ctaAltLabel: string
  openMenuLabel: string
  closeMenuLabel: string
}) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [overDark, setOverDark] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    // Lenis (SmoothScrollProvider) drives scroll via requestAnimationFrame and
    // doesn't reliably dispatch native 'scroll' events on window, so this polls
    // scrollY every frame instead of listening for one.
    let raf: number
    const tick = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setHidden(y > 120 && y > lastY.current && !open)
      lastY.current = y
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open])

  useEffect(() => {
    // Recolor chrome to inverse exactly when the dark footer sits under the
    // header band: a zero-height root line 72px from the top.
    const footer = document.querySelector('footer')
    if (!footer) return
    const io = new IntersectionObserver(
      ([e]) => setOverDark(e.isIntersecting),
      { rootMargin: '-72px 0px -100% 0px' },
    )
    io.observe(footer)
    return () => io.disconnect()
  }, [])

  const goTo = (anchor: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-transform duration-500',
        hidden && '-translate-y-full',
      )}
    >
      <div
        className={cn(
          'container-site flex items-center justify-between py-4 transition-colors duration-300',
          scrolled && 'bg-bg/60 backdrop-blur-md',
          overDark && 'text-inverse-text',
        )}
      >
        <a
          href="#hero"
          onClick={goTo('hero')}
          className={cn('mono-label transition-colors duration-300', overDark ? 'text-inverse-text' : 'text-ink')}
        >
          {siteName}
          <span className="text-accent-strong">.</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {items.map((item) => (
            <a
              key={item.anchor}
              href={`#${item.anchor}`}
              onClick={goTo(item.anchor)}
              className={cn(
                'link-underline mono-label transition-colors duration-300',
                overDark
                  ? 'text-inverse-muted hover:text-inverse-text'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              <BilingualFlip text={item.label} altText={item.altLabel} />
            </a>
          ))}
          <LocaleSwitcher className="mono-label" />
          <a href="#contact" onClick={goTo('contact')} className={buttonClasses('primary', 'px-5 py-2 text-xs')}>
            <BilingualFlip text={ctaLabel} altText={ctaAltLabel} />
          </a>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <LocaleSwitcher className="mono-label" />
          <button
            type="button"
            className={cn('mono-label transition-colors duration-300', overDark ? 'text-inverse-text' : 'text-ink')}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? closeMenuLabel : openMenuLabel}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden border-b border-line bg-bg transition-[max-height] duration-500',
          open ? 'max-h-96' : 'max-h-0',
        )}
      >
        <nav className="container-site flex flex-col gap-5 py-6" aria-label="Mobile">
          {items.map((item) => (
            <a
              key={item.anchor}
              href={`#${item.anchor}`}
              onClick={goTo(item.anchor)}
              className="text-h3 font-medium text-ink"
            >
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={goTo('contact')} className={buttonClasses('primary', 'self-start')}>
            {ctaLabel}
          </a>
        </nav>
      </div>
    </header>
  )
}
