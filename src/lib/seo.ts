import { routing } from '@/i18n/routing'

// Falls back to localhost so `pnpm build` never fails on a missing env var;
// production must set NEXT_PUBLIC_SITE_URL (see .env.example).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}

/** hreflang alternates for a path that is the SAME across locales, e.g. "/work" or "/work/my-slug". */
export function buildLanguageAlternates(pathWithoutLocale: string): Record<string, string> {
  const alternates: Record<string, string> = {}
  for (const locale of routing.locales) {
    alternates[locale] = absoluteUrl(`/${locale}${pathWithoutLocale}`)
  }
  alternates['x-default'] = absoluteUrl(`/${routing.defaultLocale}${pathWithoutLocale}`)
  return alternates
}

export function buildOpenGraph({
  locale,
  title,
  description,
  path,
  imagePath,
}: {
  locale: string
  title: string
  description: string
  path: string
  imagePath?: string
}) {
  return {
    type: 'website' as const,
    locale,
    url: absoluteUrl(`/${locale}${path}`),
    siteName: "Jerome D'mello",
    title,
    description,
    images: [{ url: absoluteUrl(imagePath ?? `/${locale}/opengraph-image`), width: 1200, height: 630 }],
  }
}
