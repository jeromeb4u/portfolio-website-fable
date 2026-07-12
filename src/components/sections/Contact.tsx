import React from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { ContactForm } from '@/components/forms/ContactForm'
import type { Home, SiteSetting } from '@/payload-types'

export function Contact({ home, settings }: { home: Home; settings: SiteSetting }) {
  const contact = home.contact

  return (
    <section id="contact" aria-labelledby="contact-heading" className="grain relative overflow-hidden section-pad">
      <div className="glow-field opacity-60" aria-hidden="true" />
      <div className="container-site relative z-10">
        <Reveal as="h2" variant="clip" id="contact-heading" className="max-w-3xl font-serif text-h2 text-ink">
          {contact?.heading}
        </Reveal>
        {contact?.body ? (
          <Reveal as="p" delay={0.15} className="mt-6 max-w-xl text-body-lg text-ink-muted">
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

        <Reveal delay={0.3}>
          <ContactForm
            successMessage={contact?.successMessage ?? 'Thank you!'}
            errorMessage={contact?.errorMessage ?? 'Something went wrong.'}
          />
        </Reveal>
      </div>
    </section>
  )
}
