'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { LocaleSwitcher } from './LocaleSwitcher'
import { buttonClasses } from '@/components/ui/Button'

type NavItem = { label: string; anchor: string; id?: string | null }

/**
 * Hide-on-scroll-down / show-on-up header (plan/05 A4). Client component:
 * needs scroll listeners + mobile menu state. Content comes from CMS via props.
 */
export function Header({
  siteName,
  items,
  ctaLabel,
  openMenuLabel,
  closeMenuLabel,
}: {
  siteName: string
  items: NavItem[]
  ctaLabel: string
  openMenuLabel: string
  closeMenuLabel: string
}) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setHidden(y > 120 && y > lastY.current && !open)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

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
          scrolled && 'backdrop-blur-md',
        )}
        style={scrolled ? { backgroundColor: 'rgb(250 250 248 / 0.82)' } : undefined}
      >
        <a href="#hero" onClick={goTo('hero')} className="mono-label text-ink">
          {siteName}
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {items.map((item) => (
            <a
              key={item.anchor}
              href={`#${item.anchor}`}
              onClick={goTo(item.anchor)}
              className="mono-label text-ink-muted transition-colors duration-300 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
          <LocaleSwitcher className="mono-label" />
          <a href="#contact" onClick={goTo('contact')} className={buttonClasses('primary', 'px-5 py-2 text-xs')}>
            {ctaLabel}
          </a>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <LocaleSwitcher className="mono-label" />
          <button
            type="button"
            className="mono-label text-ink"
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
