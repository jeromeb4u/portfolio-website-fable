'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type RailItem = { id: string; label: string }

/**
 * Fixed rail of section markers pinned to the right edge, vertically centred
 * (ported from the reference site's dot nav). Each marker is a dash that grows
 * and turns accent while its section crosses the viewport middle; the label
 * shows for the active section and on hover for the rest.
 *
 * One behaviour beyond the reference: the rail stays hidden until the hero has
 * scrolled away. `items` must list only sections that actually render — the
 * homepage decides that server-side, since several sections self-hide when
 * their CMS content is empty and a marker pointing at nothing is a dead click.
 *
 * Desktop only (`lg:flex`): the labels need horizontal room the phone layout
 * doesn't have.
 */

/** Only the band around the viewport middle counts as "in view", so exactly
 *  one section is active at a time. */
const ROOT_MARGIN = '-45% 0px -45% 0px'

export function SectionRail({ items }: { items: RailItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: ROOT_MARGIN },
    )
    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    // The rail belongs to the page body, not the hero — reveal it only once
    // the hero has left the top of the viewport.
    const hero = document.getElementById('hero')
    const heroObserver = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: '-40% 0px 0px 0px' },
    )
    if (hero) heroObserver.observe(hero)

    return () => {
      observer.disconnect()
      heroObserver.disconnect()
    }
  }, [items])

  if (items.length === 0) return null

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      aria-label="Sections"
      className={cn(
        'fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3.5 transition-opacity duration-500 lg:flex',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={jump(item.id)}
            aria-current={isActive ? 'true' : undefined}
            className="group flex items-center justify-end gap-3 py-0.5"
          >
            <span
              className={cn(
                'mono-label whitespace-nowrap text-[0.625rem] transition-opacity duration-300',
                isActive
                  ? 'text-ink opacity-100'
                  : 'text-ink-muted opacity-0 group-hover:opacity-100',
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                'h-px transition-all duration-300',
                isActive
                  ? 'w-8 bg-accent-strong'
                  : 'w-4 bg-line group-hover:w-6 group-hover:bg-ink-muted',
              )}
            />
          </a>
        )
      })}
    </nav>
  )
}
