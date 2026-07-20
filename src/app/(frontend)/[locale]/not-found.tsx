import React from 'react'
import { getLocale } from 'next-intl/server'
import { getSiteSettings } from '@/lib/data'
import { Link } from '@/i18n/navigation'
import { buttonClasses } from '@/components/ui/Button'
import type { Locale } from '@/i18n/routing'

export default async function NotFound() {
  const locale = (await getLocale()) as Locale
  const settings = await getSiteSettings(locale)
  const nf = settings.notFound

  return (
    <section className="grain relative flex min-h-svh flex-col items-start justify-center">
      <div className="container-site">
        <p className="mono-label text-ink-muted">404</p>
        <h1 className="mt-4 font-serif text-display text-ink">{nf?.heading ?? 'Page not found'}</h1>
        {nf?.body ? <p className="mt-6 max-w-md text-body-lg text-ink-muted">{nf.body}</p> : null}
        <Link href="/" className={buttonClasses('primary', 'mt-10')}>
          {nf?.backHomeLabel ?? 'Back to home'}
        </Link>
      </div>
    </section>
  )
}
