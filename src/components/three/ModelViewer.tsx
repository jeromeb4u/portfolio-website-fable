'use client'

import { useEffect, useState } from 'react'

/**
 * Renders a GLB via <model-viewer> (@google/model-viewer). The package
 * registers a custom element and touches `HTMLElement` at import time, so it
 * is imported dynamically inside an effect — this guarantees it only ever
 * runs in the browser and never during SSR (custom elements + Next's server
 * render pass otherwise crash with "HTMLElement is not defined").
 */
export function ModelViewer({
  src,
  alt,
  poster,
  className,
}: {
  src: string
  alt: string
  poster?: string
  className?: string
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    import('@google/model-viewer').then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    return poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster} alt={alt} className={className} />
    ) : null
  }

  return (
    <model-viewer
      src={src}
      alt={alt}
      poster={poster}
      auto-rotate
      auto-rotate-delay={0}
      camera-controls
      touch-action="pan-y"
      shadow-intensity="1"
      exposure="1"
      loading="eager"
      reveal="auto"
      interaction-prompt="none"
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
