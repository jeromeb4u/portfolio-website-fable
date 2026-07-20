import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/motion/Reveal'
import { SectionEyebrow } from '@/components/ui/SectionEyebrow'
import { ContactForm } from '@/components/forms/ContactForm'
import type { Home, SiteSetting } from '@/payload-types'

export async function Contact({ home, settings }: { home: Home; settings: SiteSetting }) {
  const contact = home.contact
  const t = await getTranslations('sections')

  return (
    <section id="contact" aria-labelledby="contact-heading" className="grain relative section-pad">
      <div className="container-site grid gap-y-12 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-5">
          <SectionEyebrow label={t('contact')} />
          <Reveal as="h2" variant="clip" id="contact-heading" className="font-serif text-h2 text-ink">
            {contact?.heading}
          </Reveal>
          {contact?.body ? (
            <Reveal as="p" delay={0.15} className="mt-6 max-w-md text-body-lg text-ink-muted">
              {contact.body}
            </Reveal>
          ) : null}

          <Reveal as="p" delay={0.2} className="mt-8">
            <a
              href={`mailto:${settings.email}`}
              className="serif-italic text-h3 text-ink underline-offset-4 hover:underline"
            >
              {settings.email}
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="lg:col-span-7">
          <ContactForm
            successMessage={contact?.successMessage ?? 'Thank you!'}
            errorMessage={contact?.errorMessage ?? 'Something went wrong.'}
          />
        </Reveal>
      </div>
    </section>
  )
}
