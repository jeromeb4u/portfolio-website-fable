'use client'

import React, { useEffect, useState } from 'react'

/**
 * Dual live clocks — India + Germany (plan/01 §5, R5 pattern). Tells the
 * relocation story without a sentence. Client-only; renders em-dashes until
 * mounted to avoid hydration mismatch.
 */
const fmt = (timeZone: string) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })

export function TimezoneClocks({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setNow(new Date())
    // First tick async: avoids a synchronous setState in the effect body
    // (hydration-safe — server renders the em-dash placeholders).
    const t0 = setTimeout(update, 0)
    const t = setInterval(update, 30_000)
    return () => {
      clearTimeout(t0)
      clearInterval(t)
    }
  }, [])

  return (
    <div className={className}>
      <span className="mono-label">
        VASAI, IN {now ? fmt('Asia/Kolkata').format(now) : '––:––'} (GMT+5:30)
      </span>
      <span className="mono-label">
        BERLIN, DE {now ? fmt('Europe/Berlin').format(now) : '––:––'}
      </span>
    </div>
  )
}
