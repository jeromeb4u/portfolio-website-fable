'use client'

import React, { useEffect, useRef, useState, type ElementType } from 'react'

/**
 * The site's identity move (prompts/signature-interactions §1). A label
 * decode-flips between its two languages — EN↔DE — encoding the one fact the
 * visitor should remember: this person operates in both. Hover/keyboard-focus
 * drives it in the header; the hero eyebrow runs it on an ambient loop.
 *
 * A11y: a single stable label lives in an sr-only span, so screen readers read
 * the real word once and never the animation. The animated glyphs are
 * aria-hidden. Touch (no hover) and reduced-motion degrade cleanly.
 */

// Mono-safe charset — no library, no reference-site copy. '·' adds a machine feel.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ·'
const STAGGER = 18 // ms between adjacent slots starting
const CHAR_DUR = 160 // ms a slot spends cycling before it settles
const GLYPH_SWAP = 45 // ms between random glyphs (→ ~3 intermediates)
const HOLD = 3000 // ambient dwell per language

const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]
const show = (c: string) => (c === ' ' ? ' ' : c)

type Slot = { ch: string; on: boolean }

/** Both languages share one slot count (the longer word), so a slot past the
 *  end of the shorter string renders blank rather than shifting the layout. */
const buildSlots = (s: string, n: number): Slot[] =>
  Array.from({ length: n }, (_, i) => ({ ch: show(s[i] ?? ''), on: i < s.length }))

export function BilingualFlip({
  // Both default to '': a CMS row can exist in one locale and not the other,
  // and a missing label must render nothing rather than crash the page.
  text = '',
  altText = '',
  as: Tag = 'span',
  className,
  ambient = false,
  once = false,
}: {
  text: string
  altText: string
  as?: ElementType
  className?: string
  /** self-playing loop (hero eyebrow) instead of hover/focus driven */
  ambient?: boolean
  /** decode once on mount and stop — for long lines a loop would churn */
  once?: boolean
}) {
  const n = Math.max(text.length, altText.length)

  const [slots, setSlots] = useState<Slot[]>(() => buildSlots(text, n))
  const rootRef = useRef<HTMLElement>(null)
  const rafRef = useRef<number | null>(null)
  const targetRef = useRef(text)
  // Mirrors the rendered glyphs so an interrupted decode can reverse from
  // whatever is on screen. Written only where slots are committed — never
  // during render, which would be a ref write in the render phase.
  const dispRef = useRef<Slot[] | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const commit = (next: Slot[]) => {
      dispRef.current = next
      setSlots(next)
    }

    const canCycle = () =>
      document.documentElement.classList.contains('motion-ok') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    const setInstant = (s: string) => {
      stop()
      targetRef.current = s
      commit(buildSlots(s, n))
    }

    // Interruptible decode: reverses from current glyphs, never queues.
    const animateTo = (s: string) => {
      if (targetRef.current === s && rafRef.current === null) return
      targetRef.current = s
      if (!canCycle()) return setInstant(s)
      stop()
      const cur = (dispRef.current ?? buildSlots(targetRef.current, n)).map((x) => x.ch)
      const start = performance.now()
      const bucket = new Array(n).fill(-1)
      const tick = (now: number) => {
        let done = true
        for (let i = 0; i < n; i++) {
          const t = now - start - i * STAGGER
          const tc = s[i] ?? ''
          if (t < 0) {
            done = false // hold current glyph until this slot's turn
          } else if (t < CHAR_DUR && tc !== '') {
            done = false
            const b = (t / GLYPH_SWAP) | 0
            if (b !== bucket[i]) {
              bucket[i] = b
              cur[i] = rnd()
            }
          } else {
            cur[i] = show(tc)
          }
        }
        commit(cur.map((ch, i) => ({ ch, on: i < s.length })))
        rafRef.current = done ? null : requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    // One-shot decode: the text resolves out of random glyphs shortly after
    // load and then stays put. Long lines (the hero's disciplines list) would
    // churn distractingly on a loop, and the reference decodes once too.
    if (once) {
      if (!canCycle()) return
      const start = window.setTimeout(() => {
        commit(buildSlots(text, n).map((slot) => ({ ...slot, ch: slot.on ? rnd() : slot.ch })))
        targetRef.current = ''
        animateTo(text)
      }, 500)
      return () => {
        window.clearTimeout(start)
        stop()
      }
    }

    if (ambient) {
      let flipped = false
      let visible = false
      let timer: ReturnType<typeof setTimeout> | null = null
      const loop = () => {
        if (!visible || !canCycle()) return
        flipped = !flipped
        animateTo(flipped ? altText : text)
        timer = setTimeout(loop, HOLD)
      }
      const io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting
          if (visible && !timer) timer = setTimeout(loop, HOLD)
          else if (!visible && timer) {
            clearTimeout(timer)
            timer = null
          }
        },
        { threshold: 0.4 },
      )
      io.observe(root)
      return () => {
        io.disconnect()
        if (timer) clearTimeout(timer)
        stop()
      }
    }

    // Bind hover/focus unconditionally, but gate at EVENT time on hover
    // capability. A mount-time (hover:none) read can be flaky and permanently
    // disable the flip for real pointer users; checking per-event is accurate
    // on the visitor's actual device and keeps touch a plain static link.
    const trigger = (root.closest('a,button') as HTMLElement | null) ?? root
    const hoverable = () => !window.matchMedia('(hover: none)').matches
    const toAlt = () => hoverable() && animateTo(altText)
    const toBase = () => hoverable() && animateTo(text)
    trigger.addEventListener('mouseenter', toAlt)
    trigger.addEventListener('mouseleave', toBase)
    trigger.addEventListener('focus', toAlt)
    trigger.addEventListener('blur', toBase)
    return () => {
      trigger.removeEventListener('mouseenter', toAlt)
      trigger.removeEventListener('mouseleave', toBase)
      trigger.removeEventListener('focus', toAlt)
      trigger.removeEventListener('blur', toBase)
      stop()
    }
  }, [text, altText, ambient, once, n])

  // Each glyph is its own inline-block, which the browser treats as a wrap
  // opportunity — so a long line breaks mid-word. Grouping slots into words and
  // pinning each word `nowrap` keeps the per-character animation and restores
  // normal word wrapping. The trailing space stays inside its word so the gap
  // still collapses at a line end.
  const words: { slot: Slot; index: number }[][] = []
  let word: { slot: Slot; index: number }[] = []
  slots.forEach((slot, index) => {
    word.push({ slot, index })
    // `show` renders spaces as NBSP so an empty slot keeps its width; test for
    // both so word grouping still finds the boundaries.
    if (slot.ch === ' ' || slot.ch === ' ') {
      words.push(word)
      word = []
    }
  })
  if (word.length > 0) words.push(word)

  return (
    <Tag ref={rootRef} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((group, wordIndex) => (
          <React.Fragment key={wordIndex}>
            {/* nowrap kills wrap opportunities *inside* the word; the <wbr />
                after it puts exactly one back, between words. */}
            <span style={{ whiteSpace: 'nowrap' }}>
            {group.map(({ slot: s, index: i }) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              maxWidth: s.on ? '2ch' : '0px',
              overflow: 'hidden',
              whiteSpace: 'pre',
              transition: 'max-width 120ms var(--ease-primary)',
            }}
          >
            {s.ch || ' '}
          </span>
            ))}
            </span>
            <wbr />
          </React.Fragment>
        ))}
      </span>
    </Tag>
  )
}
