'use client'

import React, { useEffect, useRef } from 'react'
import { createGlowSprite } from '@/lib/glowSprite'

/**
 * Site-wide ambient starfield — the cohesive backdrop that ties the whole dark
 * site to the particle hero and the reference. A single fixed, full-viewport
 * canvas sits behind everything (translucent sections let it show through), so
 * the same slow drift of warm embers runs under every section. Dots are drawn
 * from the same soft glow sprite as the hero portrait (not flat pixels/rects)
 * so the two backgrounds read as one continuous surface.
 *
 * Cheap by design: sparse particles, capped DPR, paused while the tab is
 * hidden. Reduced-motion / no-JS: a single static frame, no rAF.
 */
type Dot = { x: number; y: number; r: number; speed: number; phase: number; drift: number }

const CREAM = '221,214,198'

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sprite = createGlowSprite(28, CREAM)
    let dots: Dot[] = []
    let W = 0
    let H = 0
    let dpr = 1
    let raf = 0
    let running = false
    let t = 0

    function build() {
      const count = Math.round((W * H) / 11000)
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.35,
        speed: Math.random() * 0.15 + 0.03,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.08,
      }))
    }

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
      if (reduce) drawStatic()
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, W, H)
      ctx!.globalAlpha = 0.3
      for (const d of dots) {
        const size = d.r * 9
        ctx!.drawImage(sprite, d.x - size / 2, d.y - size / 2, size, size)
      }
      ctx!.globalAlpha = 1
    }

    function frame() {
      t += 1
      ctx!.clearRect(0, 0, W, H)
      for (const d of dots) {
        d.y -= d.speed
        d.x += d.drift
        if (d.y < -3) {
          d.y = H + 3
          d.x = Math.random() * W
        }
        if (d.x < -3) d.x = W + 3
        else if (d.x > W + 3) d.x = -3
        const tw = 0.22 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.018 + d.phase))
        ctx!.globalAlpha = tw
        const size = d.r * 9
        ctx!.drawImage(sprite, d.x - size / 2, d.y - size / 2, size, size)
      }
      ctx!.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (running || reduce) return
      running = true
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }
    function onVisibility() {
      if (document.hidden) stop()
      else start()
    }

    resize()
    if (reduce) drawStatic()
    else start()

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      {/* warm rust bloom from the upper area, echoing the hero glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 45% at 78% 12%, rgba(157,60,17,0.12), rgba(13,13,12,0) 60%)',
        }}
      />
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
