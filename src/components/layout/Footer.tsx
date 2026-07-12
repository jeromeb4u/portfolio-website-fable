import React from 'react'
import { Link } from '@/i18n/navigation'
import { Marquee } from '@/components/motion/Marquee'
import { TimezoneClocks } from './TimezoneClocks'

type Social = { platform: string; url: string; id?: string | null }

/**
 * Inverted footer: name marquee (plan/01 §5), socials, timezone clocks,
 * legal links (Impressum/Datenschutz required for the German market).
 */
export function Footer({
  siteName,
  tagline,
  email,
  socials,
  imprintLabel,
  privacyLabel,
  locale,
}: {
  siteName: string
  tagline: string
  email: string
  socials: Social[]
  imprintLabel: string
  privacyLabel: string
  locale: string
}) {
  return (
    <footer className="grain relative overflow-hidden bg-inverse-bg text-inverse-text">
      <div className="container-site flex flex-col gap-12 py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-md">
            <p className="text-body-lg text-inverse-muted">{tagline}</p>
            <a
              href={`mailto:${email}`}
              className="serif-italic mt-4 inline-block text-h3 text-inverse-text underline-offset-4 hover:underline"
            >
              {email}
            </a>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <nav className="flex gap-6" aria-label="Social">
              {socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target={s.platform === 'email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="mono-label text-inverse-muted transition-colors duration-300 hover:text-inverse-text"
                >
                  {s.platform.toUpperCase()}
                </a>
              ))}
            </nav>
            <TimezoneClocks className="flex flex-col gap-1 text-inverse-muted md:items-end" />
          </div>
        </div>
      </div>

      {/* Oversized cropped name marquee (R1/R4) */}
      <Marquee ariaLabel={siteName} className="border-t border-inverse-line py-2 select-none">
        <span className="whitespace-nowrap pr-12 font-serif text-[clamp(4rem,12vw,10rem)] leading-none text-inverse-text/90">
          {siteName.toUpperCase()} —&nbsp;
        </span>
      </Marquee>

      <div className="container-site flex flex-col justify-between gap-3 border-t border-inverse-line py-6 md:flex-row">
        <p className="mono-label text-inverse-muted">
          © {new Date().getFullYear()} {siteName}
        </p>
        <div className="flex gap-6">
          <Link href="/imprint" locale={locale as 'en' | 'de'} className="mono-label text-inverse-muted hover:text-inverse-text">
            {imprintLabel}
          </Link>
          <Link href="/privacy" locale={locale as 'en' | 'de'} className="mono-label text-inverse-muted hover:text-inverse-text">
            {privacyLabel}
          </Link>
        </div>
      </div>
    </footer>
  )
}
