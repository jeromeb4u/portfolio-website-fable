/**
 * Idempotent seed: fills globals with real starter content (EN + DE drafts).
 * Invoked via POST /api/seed (dev) or pnpm seed.
 * German copy is AI-drafted — flagged via needsGermanReview where the schema allows.
 */
import type { Payload } from 'payload'

// Minimal Lexical richText document from plain paragraphs.
const rt = (...paragraphs: string[]) => ({
  root: {
    type: 'root' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      textFormat: 0,
      children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    })),
  },
})


// Localized subfields live on array ROWS. Updating a locale with a fresh array
// would recreate rows and wipe the other locale's values. mergeIds attaches the
// existing row ids (fetched from the EN document) onto the DE data by index so
// the update targets the same rows.
const mergeIds = (data: unknown, existing: unknown): unknown => {
  if (Array.isArray(data) && Array.isArray(existing)) {
    return data.map((item, i) => mergeIds(item, existing[i]))
  }
  if (
    data && typeof data === 'object' && !Array.isArray(data) &&
    existing && typeof existing === 'object' && !Array.isArray(existing)
  ) {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
      out[key] = mergeIds(
        (data as Record<string, unknown>)[key],
        (existing as Record<string, unknown>)[key],
      )
    }
    const exId = (existing as Record<string, unknown>).id
    if (exId && !out.id) out.id = exId
    return out
  }
  return data
}

export const runSeed = async (payload: Payload): Promise<void> => {

  // ---------- site-settings ----------
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      siteName: "Jerome D'mello",
      tagline: 'Frontend engineer — 5.5 years of Angular at enterprise scale, now building React apps and AI tools.',
      email: 'jeromeb4u@gmail.com',
      location: 'Vasai, India — relocating to Germany',
      socials: [
        { platform: 'linkedin', url: 'https://www.linkedin.com/in/jerome-dmello/' },
        { platform: 'email', url: 'mailto:jeromeb4u@gmail.com' },
      ],
      availability: 'open',
      availabilityNote: 'Open to frontend & AI roles in Germany',
      notFound: {
        heading: 'Page not found',
        body: 'The page you were looking for does not exist or has moved.',
        backHomeLabel: 'Back to home',
      },
    },
  })
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'de',
    data: {
      tagline: 'Frontend-Entwickler — 5,5 Jahre Angular im Enterprise-Umfeld, heute React-Apps und AI-Tools.',
      location: 'Vasai, Indien — Umzug nach Deutschland geplant',
      availabilityNote: 'Offen für Frontend- & AI-Rollen in Deutschland',
      notFound: {
        heading: 'Seite nicht gefunden',
        body: 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
        backHomeLabel: 'Zur Startseite',
      },
    },
  })

  // ---------- navigation ----------
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: {
      items: [
        { label: 'About', anchor: 'about' },
        { label: 'Experience', anchor: 'experience' },
        { label: 'Work', anchor: 'work' },
        { label: 'Contact', anchor: 'contact' },
      ],
      ctaLabel: 'Get in touch',
    },
  })
  const existingNav = await payload.findGlobal({ slug: 'navigation', locale: 'en', depth: 0 })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'de',
    data: mergeIds({
      items: [
        { label: 'Über mich', anchor: 'about' },
        { label: 'Erfahrung', anchor: 'experience' },
        { label: 'Projekte', anchor: 'work' },
        { label: 'Kontakt', anchor: 'contact' },
      ],
      ctaLabel: 'Kontakt aufnehmen',
    }, existingNav) as never,
  })

  // ---------- home ----------
  await payload.updateGlobal({
    slug: 'home',
    locale: 'en',
    data: {
      hero: {
        eyebrow: 'Frontend Engineer · React & AI',
        headingLine1: 'Enterprise-grade frontend,',
        headingLine2: 'now building with AI.',
        subheading:
          '5.5 years shipping Angular for global enterprises. Since 2025: React apps, AI tools and automation for real businesses.',
        primaryCtaLabel: 'See my work',
        secondaryCtaLabel: 'Download CV',
      },
      about: {
        heading: 'About',
        body: rt(
          'I spent five and a half years at Infosys building and leading large-scale web applications for clients like Truist and Optus — from a legacy AngularJS-to-Angular 16 migration with a 25-person offshore team to BI portals used by thousands of employees.',
          'Since February 2025 I work independently: building React applications, AI-powered tools and automation for founders and small businesses. I am relocating to Germany and learning German.',
        ),
        factList: [
          { label: 'Angular at enterprise scale', value: '5.5 years @ Infosys' },
          { label: 'React & AI tools', value: 'freelance since Feb 2025' },
          { label: 'Led offshore team of', value: '25 engineers' },
          { label: 'German', value: 'A1, actively learning' },
        ],
      },
      experience: {
        heading: 'Experience',
        entries: [
          {
            company: 'Freelance',
            role: 'Frontend Engineer — React & AI applications',
            clientNote: 'Independent clients & own products',
            dateStart: 'Feb 2025',
            dateEnd: 'Present',
            bullets: [
              { text: 'Building AI-powered tools, websites and automations for founders and small businesses.' },
              { text: 'Stack: React, Next.js, TypeScript, Tailwind CSS, Node.js, Anthropic/OpenAI APIs.' },
            ],
          },
          {
            company: 'Infosys',
            role: 'Technology Analyst — CPQ Platform Modernisation',
            clientNote: 'Optus (Australian telecom)',
            dateStart: 'Jun 2024',
            dateEnd: 'Jan 2025',
            bullets: [
              { text: 'Led a 25-engineer offshore team migrating a large-scale B2B CPQ platform from legacy AngularJS to Angular 16 with micro frontends.' },
              { text: 'Designed unit test strategy reaching 80% coverage on Jasmine/Karma.' },
            ],
          },
          {
            company: 'Infosys',
            role: 'Technology Lead — Customer Acquisition Portal',
            clientNote: 'US-based enterprise',
            dateStart: 'May 2023',
            dateEnd: 'May 2024',
            bullets: [
              { text: 'Led the technical side of a website redesign and new customer acquisition & sales portal.' },
              { text: 'Managed a distributed team of three across time zones.' },
            ],
          },
          {
            company: 'Infosys',
            role: 'Senior Developer — BI Reporting Platform',
            clientNote: 'Truist Bank (US)',
            dateStart: 'Aug 2021',
            dateEnd: 'May 2023',
            bullets: [
              { text: 'Delivered a unified BI report portal used across the bank; acted as coordinator between onshore and offshore teams.' },
              { text: 'Self-initiated frontend work reduced the client’s reliance on external consultants.' },
            ],
          },
          {
            company: 'Infosys',
            role: 'System Engineer — Internal Platforms',
            clientNote: 'Training Division',
            dateStart: 'Sep 2019',
            dateEnd: 'Aug 2021',
            bullets: [
              { text: 'Built JavaScript solutions for test generation, attendance management and a knowledge portal.' },
            ],
          },
        ],
      },
      skills: {
        heading: 'Skills',
        groups: [
          {
            groupLabel: 'Frontend',
            items: [
              { name: 'React' },
              { name: 'Next.js' },
              { name: 'Angular 2–16' },
              { name: 'TypeScript' },
              { name: 'Tailwind CSS' },
              { name: 'NgRx' },
              { name: 'GSAP' },
            ],
          },
          {
            groupLabel: 'AI & Tooling',
            items: [
              { name: 'Anthropic / OpenAI APIs' },
              { name: 'AI agents & automation' },
              { name: 'Prompt engineering' },
            ],
          },
          {
            groupLabel: 'Backend & Infra',
            items: [{ name: 'Node.js' }, { name: 'Express' }, { name: 'PostgreSQL' }, { name: 'Vercel' }],
          },
          {
            groupLabel: 'Practices',
            items: [
              { name: 'Jasmine / Karma (80% coverage)' },
              { name: 'CI/CD (GitLab, GitHub)' },
              { name: 'Agile (certified)' },
              { name: 'Offshore team leadership' },
            ],
          },
        ],
      },
      workIntro: {
        heading: 'Selected work',
        body: 'Tools and products I design, build and run end to end.',
      },
      recommendations: {
        heading: 'What colleagues say',
        entries: [
          {
            quote:
              'Jerome is very technically oriented and completes tasks before they are required. I would absolutely recommend Jerome to a team who is looking for a team player that they can depend on to learn, execute and grow.',
            authorName: 'Marty Conner',
            authorTitle: 'VP Information Engineering',
            authorCompany: 'Truist Bank',
            consentConfirmed: false,
          },
          {
            quote:
              'When he took courses in front-end development, his new learnings allowed us to reduce our reliance on outside consultants, saving the company money and time. He will be an asset to any work that he pursues.',
            authorName: 'Conner Bryan',
            authorTitle: 'Senior Product Manager, VP',
            authorCompany: 'Truist Bank',
            consentConfirmed: false,
          },
        ],
      },
      contact: {
        heading: 'Let’s build something',
        body: 'Tell me about your role, project or idea — I usually reply within a day.',
        successMessage: 'Thanks — your message is on its way. I’ll get back to you soon.',
        errorMessage: 'Something went wrong. Please email me directly instead.',
      },
    },
  })

  const existingHome = await payload.findGlobal({ slug: 'home', locale: 'en', depth: 0 })
  await payload.updateGlobal({
    slug: 'home',
    locale: 'de',
    data: mergeIds({
      hero: {
        eyebrow: 'Frontend-Entwickler · React & AI',
        headingLine1: 'Frontend auf Enterprise-Niveau,',
        headingLine2: 'heute mit AI gebaut.',
        subheading:
          '5,5 Jahre Angular für globale Konzerne. Seit 2025: React-Apps, AI-Tools und Automatisierung für echte Unternehmen.',
        primaryCtaLabel: 'Projekte ansehen',
        secondaryCtaLabel: 'Lebenslauf herunterladen',
      },
      about: {
        heading: 'Über mich',
        body: rt(
          'Fünfeinhalb Jahre habe ich bei Infosys großskalige Webanwendungen für Kunden wie Truist und Optus gebaut und geleitet — von einer AngularJS-zu-Angular-16-Migration mit einem 25-köpfigen Team bis zu BI-Portalen für tausende Mitarbeitende.',
          'Seit Februar 2025 arbeite ich selbstständig: React-Anwendungen, AI-gestützte Tools und Automatisierung für Gründer und kleine Unternehmen. Ich ziehe nach Deutschland und lerne Deutsch.',
        ),
        factList: [
          { label: 'Angular im Enterprise-Umfeld', value: '5,5 Jahre @ Infosys' },
          { label: 'React & AI-Tools', value: 'freiberuflich seit Feb 2025' },
          { label: 'Offshore-Team geleitet', value: '25 Engineers' },
          { label: 'Deutsch', value: 'A1, aktiv am Lernen' },
        ],
      },
      experience: {
        heading: 'Erfahrung',
        entries: [
          {
            company: 'Freelance',
            role: 'Frontend-Entwickler — React & AI-Anwendungen',
            clientNote: 'Eigene Produkte & unabhängige Kunden',
            dateStart: 'Feb 2025',
            dateEnd: 'Heute',
            bullets: [
              { text: 'Entwicklung von AI-Tools, Websites und Automatisierungen für Gründer und kleine Unternehmen.' },
              { text: 'Stack: React, Next.js, TypeScript, Tailwind CSS, Node.js, Anthropic/OpenAI APIs.' },
            ],
          },
          {
            company: 'Infosys',
            role: 'Technology Analyst — CPQ-Plattform-Modernisierung',
            clientNote: 'Optus (australischer Telekommunikationsanbieter)',
            dateStart: 'Jun 2024',
            dateEnd: 'Jan 2025',
            bullets: [
              { text: 'Leitung eines 25-köpfigen Teams bei der Migration einer B2B-CPQ-Plattform von AngularJS zu Angular 16 mit Micro Frontends.' },
              { text: 'Unit-Test-Strategie mit 80 % Coverage (Jasmine/Karma).' },
            ],
          },
          {
            company: 'Infosys',
            role: 'Technology Lead — Kundenakquise-Portal',
            clientNote: 'US-Unternehmen',
            dateStart: 'Mai 2023',
            dateEnd: 'Mai 2024',
            bullets: [
              { text: 'Technische Leitung eines Website-Redesigns und eines neuen Vertriebsportals.' },
              { text: 'Führung eines verteilten Drei-Personen-Teams über Zeitzonen hinweg.' },
            ],
          },
          {
            company: 'Infosys',
            role: 'Senior Developer — BI-Reporting-Plattform',
            clientNote: 'Truist Bank (USA)',
            dateStart: 'Aug 2021',
            dateEnd: 'Mai 2023',
            bullets: [
              { text: 'Aufbau eines bankweiten BI-Report-Portals; Koordination zwischen Onshore- und Offshore-Teams.' },
              { text: 'Eigeninitiative im Frontend reduzierte die Abhängigkeit von externen Beratern.' },
            ],
          },
          {
            company: 'Infosys',
            role: 'System Engineer — Interne Plattformen',
            clientNote: 'Training Division',
            dateStart: 'Sep 2019',
            dateEnd: 'Aug 2021',
            bullets: [
              { text: 'JavaScript-Lösungen für Testgenerierung, Anwesenheitsverwaltung und ein Wissensportal.' },
            ],
          },
        ],
      },
      skills: {
        heading: 'Skills',
        groups: [
          {
            groupLabel: 'Frontend',
            items: [
              { name: 'React' },
              { name: 'Next.js' },
              { name: 'Angular 2–16' },
              { name: 'TypeScript' },
              { name: 'Tailwind CSS' },
              { name: 'NgRx' },
              { name: 'GSAP' },
            ],
          },
          {
            groupLabel: 'AI & Tooling',
            items: [
              { name: 'Anthropic / OpenAI APIs' },
              { name: 'AI-Agenten & Automatisierung' },
              { name: 'Prompt Engineering' },
            ],
          },
          {
            groupLabel: 'Backend & Infra',
            items: [{ name: 'Node.js' }, { name: 'Express' }, { name: 'PostgreSQL' }, { name: 'Vercel' }],
          },
          {
            groupLabel: 'Arbeitsweise',
            items: [
              { name: 'Jasmine / Karma (80 % Coverage)' },
              { name: 'CI/CD (GitLab, GitHub)' },
              { name: 'Agile (zertifiziert)' },
              { name: 'Führung von Offshore-Teams' },
            ],
          },
        ],
      },
      workIntro: {
        heading: 'Ausgewählte Projekte',
        body: 'Tools und Produkte, die ich von Anfang bis Ende entwickle und betreibe.',
      },
      recommendations: {
        heading: 'Stimmen von Kollegen',
        entries: [
          {
            quote:
              'Jerome ist technisch stark orientiert und erledigt Aufgaben, bevor sie fällig sind. Ich würde Jerome jedem Team uneingeschränkt empfehlen, das einen verlässlichen Teamplayer sucht.',
            authorName: 'Marty Conner',
            authorTitle: 'VP Information Engineering',
            authorCompany: 'Truist Bank',
            consentConfirmed: false,
          },
          {
            quote:
              'Seine selbst erarbeiteten Frontend-Kenntnisse reduzierten unsere Abhängigkeit von externen Beratern und sparten dem Unternehmen Zeit und Geld. Er wird für jedes Team ein Gewinn sein.',
            authorName: 'Conner Bryan',
            authorTitle: 'Senior Product Manager, VP',
            authorCompany: 'Truist Bank',
            consentConfirmed: false,
          },
        ],
      },
      contact: {
        heading: 'Lass uns etwas bauen',
        body: 'Erzähl mir von deiner Rolle, deinem Projekt oder deiner Idee — ich antworte meist innerhalb eines Tages.',
        successMessage: 'Danke — deine Nachricht ist unterwegs. Ich melde mich bald.',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte schreib mir direkt per E-Mail.',
      },
    }, existingHome) as never,
  })

  // ---------- legal ----------
  await payload.updateGlobal({
    slug: 'imprint',
    locale: 'en',
    data: {
      heading: 'Imprint',
      body: rt(
        'Information according to § 5 DDG.',
        "Jerome D'mello — [Street and number], [Postal code] [City], [Country].",
        'Contact: jeromeb4u@gmail.com',
        'Responsible for content: Jerome D’mello.',
      ),
      needsGermanReview: true,
    },
  })
  await payload.updateGlobal({
    slug: 'imprint',
    locale: 'de',
    data: {
      heading: 'Impressum',
      body: rt(
        'Angaben gemäß § 5 DDG.',
        "Jerome D'mello — [Straße und Hausnummer], [PLZ] [Ort], [Land].",
        'Kontakt: jeromeb4u@gmail.com',
        'Verantwortlich für den Inhalt: Jerome D’mello.',
      ),
      needsGermanReview: true,
    },
  })

  await payload.updateGlobal({
    slug: 'privacy',
    locale: 'en',
    data: {
      heading: 'Privacy Policy',
      body: rt(
        'This website stores contact form submissions (name, email, message) to respond to your inquiry. Data is stored in a Postgres database (Neon) and an email notification is sent via Resend. Hosting: Vercel. No analytics or tracking cookies are used.',
        'You may request deletion of your data at any time: jeromeb4u@gmail.com.',
      ),
      needsGermanReview: true,
    },
  })
  await payload.updateGlobal({
    slug: 'privacy',
    locale: 'de',
    data: {
      heading: 'Datenschutzerklärung',
      body: rt(
        'Diese Website speichert Kontaktformular-Einsendungen (Name, E-Mail, Nachricht), um Anfragen zu beantworten. Die Daten werden in einer Postgres-Datenbank (Neon) gespeichert; eine E-Mail-Benachrichtigung erfolgt über Resend. Hosting: Vercel. Es werden keine Analyse- oder Tracking-Cookies verwendet.',
        'Du kannst jederzeit die Löschung deiner Daten verlangen: jeromeb4u@gmail.com.',
      ),
      needsGermanReview: true,
    },
  })

  payload.logger.info('Seed complete.')
}

