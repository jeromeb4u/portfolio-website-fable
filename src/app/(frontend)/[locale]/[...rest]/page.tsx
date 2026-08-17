import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'

/**
 * Catch-all for URLs under a locale that match no real route.
 *
 * Without it those requests escape the `[locale]` tree entirely and Next
 * renders its own unstyled black 404 — no header, no footer, no theme. Routing
 * them through `notFound()` here hands them to this segment's not-found.tsx
 * instead, so a mistyped URL still looks like the site. Concrete routes are
 * more specific than a catch-all, so nothing real is shadowed.
 */
export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale)
  notFound()
}
