import React from 'react'
import { Link } from '@/i18n/navigation'
import { Marquee } from '@/components/motion/Marquee'
import { AvailabilityChip } from '@/components/ui/AvailabilityChip'
import { ContactChannels } from './ContactChannels'
import { TimezoneClocks } from './TimezoneClocks'

type Social = { platform: string; url: string; id?: string | null }

/**
 * Inverted footer as a proper contact destination (ui-improvements Phase F):
 * [CONTACT] label, serif closing line, the same availability chip Hero
 * shows (repeated so employers who scroll to the end see it again), labeled
 * channel cards, name marquee, legal row. The contact FORM stays owned by
 * the Contact section — this is links only.
 */
export function Footer({
  siteName,
  tagline,
  email,
  socials,
  availability,
  availabilityNote,
  contactLabel,
  imprintLabel,
  privacyLabel,
  locale,
}: {
  siteName: string
  tagline: string
  email: string
  socials: Social[]
  availability: string
  availabilityNote?: string
  contactLabel: string
  imprintLabel: string
  privacyLabel: string
  locale: string
}) {
  return (
    <footer className="grain relative overflow-hidden bg-inverse-bg text-inverse-text">
      <div className="container-site flex flex-col gap-10 py-16">
        <p className="mono-label text-inverse-muted">[ {contactLabel} ]</p>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <p className="max-w-2xl font-serif text-h2 text-inverse-text">{tagline}</p>
          {availabilityNote ? (
            <AvailabilityChip
              availability={availability}
              note={availabilityNote}
              tone="dark"
              className="shrink-0"
            />
          ) : null}
        </div>

        <ContactChannels socials={socials} email={email} />

        <TimezoneClocks className="flex flex-wrap gap-x-8 gap-y-1 text-inverse-muted" />
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
          <Link href="/imprint" locale={locale as 'en' | 'de'} className="link-underline mono-label text-inverse-muted hover:text-inverse-text">
            {imprintLabel}
          </Link>
          <Link href="/privacy" locale={locale as 'en' | 'de'} className="link-underline mono-label text-inverse-muted hover:text-inverse-text">
            {privacyLabel}
          </Link>
        </div>
      </div>
    </footer>
  )
}
