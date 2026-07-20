'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/**
 * Work-card cover with the live-wire hover (prompts/signature-interactions §2).
 * A CTA chip lerp-tracks the pointer inside the cover (scoped custom cursor —
 * `cursor: none` only while the chip shows), docks to the bottom-right on
 * keyboard focus, and a rust duotone wash ties the screenshot to the palette.
 * Touch + reduced-motion get a plain, static cover.
 */
export function CardCover({
  url,
  alt,
  width,
  height,
  ctaLabel,
  confidential,
  confidentialLabel,
}: {
  url?: string | null
  alt: string
  width: number
  height: number
  ctaLabel: string
  confidential?: boolean | null
  confidentialLabel: string
}) {
  const coverRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(false) // chip visible
  const [track, setTrack] = useState(false) // pointer-follow (vs. docked)

  useEffect(() => {
    const cover = coverRef.current
    const chip = chipRef.current
    if (!cover || !chip) return

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const canTrack = () =>
      document.documentElement.classList.contains('motion-ok') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Ancestor <a> owns keyboard focus — dock the chip when it focuses.
    const link = cover.closest('a') as HTMLElement | null
    const onFocus = () => {
      setActive(true)
      setTrack(false)
    }
    const onBlur = () => setActive(false)
    link?.addEventListener('focus', onFocus)
    link?.addEventListener('blur', onBlur)

    let raf: number | null = null
    let cur = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let started = false

    const render = () => {
      chip.style.transform = `translate(-50%, -50%) translate(${cur.x}px, ${cur.y}px)`
    }
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.16 // ~120ms lerp lag
      cur.y += (target.y - cur.y) * 0.16
      render()
      raf = requestAnimationFrame(loop)
    }
    const onEnter = (e: PointerEvent) => {
      if (!fine) return
      setActive(true)
      setTrack(canTrack())
      if (!canTrack()) return
      const r = cover.getBoundingClientRect()
      target.x = e.clientX - r.left
      target.y = e.clientY - r.top
      if (!started) {
        cur = { ...target }
        render()
        started = true
      }
      if (raf == null) raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      if (!fine || !canTrack()) return
      const r = cover.getBoundingClientRect()
      target.x = e.clientX - r.left
      target.y = e.clientY - r.top
    }
    const onLeave = () => {
      if (!fine) return
      setActive(false)
      if (raf != null) cancelAnimationFrame(raf)
      raf = null
      started = false
    }
    cover.addEventListener('pointerenter', onEnter)
    cover.addEventListener('pointermove', onMove)
    cover.addEventListener('pointerleave', onLeave)

    return () => {
      link?.removeEventListener('focus', onFocus)
      link?.removeEventListener('blur', onBlur)
      cover.removeEventListener('pointerenter', onEnter)
      cover.removeEventListener('pointermove', onMove)
      cover.removeEventListener('pointerleave', onLeave)
      if (raf != null) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={coverRef}
      className="relative overflow-hidden rounded-xl bg-surface"
      style={{ cursor: active && track ? 'none' : undefined }}
    >
      {url ? (
        <Image
          src={url}
          alt={alt}
          width={width}
          height={height}
          className="media-desat aspect-[3/2] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div className="aspect-[3/2] w-full" aria-hidden="true" />
      )}

      {/* Bottom gradient overlay, intensifies on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-100"
      />
      {/* Rust duotone wash — ties every cover to the palette on hover only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-accent opacity-0 mix-blend-multiply transition-opacity duration-200 group-hover:opacity-[0.12]"
      />

      {confidential ? (
        <span className="mono-label absolute right-3 top-3 rounded-full border border-line bg-bg/90 px-3 py-1 text-ink-muted backdrop-blur-sm">
          {confidentialLabel}
        </span>
      ) : null}

      {/* Cursor-tracking / docked CTA chip */}
      <span
        ref={chipRef}
        aria-hidden="true"
        className={`mono-label pointer-events-none absolute z-10 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-bg transition-opacity duration-200 ${
          active ? 'opacity-100' : 'opacity-0'
        } ${track ? 'left-0 top-0' : 'bottom-4 right-4'}`}
        style={track ? undefined : { transform: 'none' }}
      >
        {ctaLabel} ↗
      </span>
    </div>
  )
}
