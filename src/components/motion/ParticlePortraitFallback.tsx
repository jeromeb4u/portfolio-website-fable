import React from 'react'

/**
 * The no-WebGL / small-screen stand-in for the particle portrait: the same
 * photograph, feathered into the page by a radial mask and lifted by a warm
 * soft-light bloom, bleeding off the right edge exactly where the point cloud
 * would sit. No canvas, no rAF — nothing for a phone to burn battery on.
 */
const MASK = 'radial-gradient(ellipse 46% 52% at 50% 45%, #000 52%, transparent 76%)'

export function ParticlePortraitFallback({ src }: { src: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-50 md:opacity-100">
      <div
        className="absolute right-[-8%] top-1/2 h-[82vh] w-[82vh] max-w-[120vw] -translate-y-1/2"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: '46% 6%',
          filter: 'saturate(0.92) contrast(1.05) brightness(1.02)',
          WebkitMaskImage: MASK,
          maskImage: MASK,
        }}
      />
      <div
        className="absolute right-[-8%] top-1/2 h-[82vh] w-[82vh] max-w-[120vw] -translate-y-1/2 mix-blend-soft-light"
        style={{
          background:
            'radial-gradient(ellipse 46% 52% at 50% 45%, rgba(245,214,160,0.45) 0%, transparent 70%)',
          WebkitMaskImage: MASK,
          maskImage: MASK,
        }}
      />
    </div>
  )
}
