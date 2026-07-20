import { ImageResponse } from 'next/og'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Typography-only OG card (portfolio-improvements Phase 3b) — no photo exists
// in the repo, so this leans on the site's palette instead: warm off-white,
// ink text, orange accent glow, matching src/app/(frontend)/[locale]/globals.css.
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isDe = hasLocale(routing.locales, locale) && locale === 'de'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 80,
          backgroundColor: '#FAFAF8',
          backgroundImage: 'radial-gradient(ellipse 120% 80% at 50% 130%, #FF5900 0%, #FF8A4C 30%, transparent 70%)',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#5F6163',
            fontFamily: 'monospace',
            marginBottom: 24,
          }}
        >
          {isDe ? 'FRONTEND-ENTWICKLER · REACT & AI' : 'FRONTEND ENGINEER · REACT & AI'}
        </div>
        <div
          style={{
            fontSize: 96,
            color: '#171819',
            fontFamily: 'serif',
            lineHeight: 1,
          }}
        >
          Jerome D&apos;mello
        </div>
      </div>
    ),
    { ...size },
  )
}
