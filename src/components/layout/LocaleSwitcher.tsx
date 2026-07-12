'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const other = locale === 'en' ? 'de' : 'en'

  return (
    <button
      type="button"
      className={className}
      aria-label={other === 'de' ? 'Zur deutschen Version wechseln' : 'Switch to English version'}
      onClick={() => router.replace(pathname, { locale: other })}
    >
      <span className={locale === 'en' ? 'text-ink' : 'text-ink-muted'}>EN</span>
      <span className="text-ink-muted"> / </span>
      <span className={locale === 'de' ? 'text-ink' : 'text-ink-muted'}>DE</span>
    </button>
  )
}
