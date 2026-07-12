import React from 'react'
import { cn } from '@/lib/utils'

/**
 * CSS infinite marquee (plan/05 A9 + footer name marquee). Content is duplicated
 * once; the track translates -50%. Reduced-motion: animation disabled via CSS.
 */
export function Marquee({
  children,
  reverse = false,
  className,
  trackClassName,
  ariaLabel,
}: {
  children: React.ReactNode
  reverse?: boolean
  className?: string
  trackClassName?: string
  ariaLabel?: string
}) {
  return (
    <div className={cn('overflow-hidden', className)} aria-label={ariaLabel}>
      <div
        className={cn(
          'flex w-max hover:[animation-play-state:paused]',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          trackClassName,
        )}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
