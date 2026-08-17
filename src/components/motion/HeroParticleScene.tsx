'use client'

import React, { useEffect, useRef, useSyncExternalStore } from 'react'
import { createParticlePortrait } from '@/lib/particlePortrait'
import { ParticlePortraitFallback } from './ParticlePortraitFallback'

/**
 * Mount point for the hero portrait: decides between the WebGL point cloud
 * (lib/particlePortrait.ts) and the masked-photo fallback, and owns nothing
 * else. Below `md`, or wherever WebGL is unavailable, the fallback ships and
 * no context is ever allocated.
 */

/** Probing WebGL allocates a context, so answer once and cache it. */
let webglSupport: boolean | null = null
function hasWebGL(): boolean {
  if (webglSupport !== null) return webglSupport
  try {
    const c = document.createElement('canvas')
    webglSupport = !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    )
  } catch {
    webglSupport = false
  }
  return webglSupport
}

const SMALL_SCREEN = '(max-width: 767px)'

/**
 * Read through `useSyncExternalStore` rather than an effect: the decision needs
 * `window`, so it cannot be made during render on the server, and the snapshot
 * must stay stable between calls.
 */
function subscribeMode(onChange: () => void) {
  const mq = window.matchMedia(SMALL_SCREEN)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getModeSnapshot(): 'webgl' | 'fallback' {
  return !window.matchMedia(SMALL_SCREEN).matches && hasWebGL() ? 'webgl' : 'fallback'
}

function getServerModeSnapshot(): 'pending' {
  return 'pending'
}

export function HeroParticleScene({ src }: { src: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const mode = useSyncExternalStore(subscribeMode, getModeSnapshot, getServerModeSnapshot)

  useEffect(() => {
    if (mode !== 'webgl') return
    const host = hostRef.current
    if (!host) return
    return createParticlePortrait(host, src)
  }, [mode, src])

  if (mode === 'pending') return null
  if (mode === 'fallback') return <ParticlePortraitFallback src={src} />
  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />
}
