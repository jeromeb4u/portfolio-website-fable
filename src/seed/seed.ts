/**
 * Idempotent seed: fills globals with real starter content (EN + DE drafts).
 * Invoked via POST /api/seed (dev) or pnpm seed.
 * German copy is AI-drafted — flagged via needsGermanReview where the schema allows.
 */
import path from 'path'
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

// Idempotent media upload: dedups on EN alt text (stable key), then writes the
// DE alt so screen readers get localized text in both locales. Re-running seed
// reuses the existing media row instead of piling up duplicate uploads.
type MediaId = number | string
const upsertMedia = async (
  payload: Payload,
  { file, altEn, altDe }: { file: string; altEn: string; altDe: string },
): Promise<MediaId> => {
  const filePath = path.resolve(process.cwd(), file)
  const existing = await payload.find({
    collection: 'media',
    locale: 'en',
    where: { alt: { equals: altEn } },
    limit: 1,
    depth: 0,
  })
  let id: MediaId | undefined = existing.docs[0]?.id
  if (id == null) {
    const created = await payload.create({
      collection: 'media',
      locale: 'en',
      data: { alt: altEn },
      filePath,
    })
    id = created.id
  }
  await payload.update({ collection: 'media', id, locale: 'de', data: { alt: altDe } })
  return id
}

export const runSeed = async (payload: Payload): Promise<void> => {

  // ---------- media (portrait + case-study covers) ----------
  // Uploaded first so globals and case studies can reference the ids.
  const portraitId = await upsertMedia(payload, {
    file: 'public/images/portrait.png',
    altEn: "Portrait of Jerome D'mello",
    altDe: "Porträt von Jerome D'mello",
  })

  const coverNames: Record<string, string> = {
    'harbour-and-vine': 'Harbour & Vine',
    northgate: 'Northgate',
    'ridgeline-supply': 'Ridgeline Supply Co.',
    'aperture-dental': 'Aperture Dental',
    brightwater: 'Brightwater Plumbing & Heating',
    'meridian-partners': 'Meridian Partners',
    'atelier-nord': 'Atelier Nord',
  }
  const coverIds: Record<string, MediaId> = {}
  for (const [slug, name] of Object.entries(coverNames)) {
    coverIds[slug] = await upsertMedia(payload, {
      file: `public/seed-covers/${slug}.png`,
      altEn: `Homepage of ${name}`,
      altDe: `Startseite von ${name}`,
    })
  }

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
        { platform: 'github', url: 'https://github.com/jeromeb4u' },
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
        // media ids are numeric in this Postgres project; upsertMedia's return
        // is widened to number|string, so narrow it for the strict global data
        portraitImage: portraitId as number,
        body: rt(
          'I spent five and a half years at Infosys building and leading large-scale web applications for clients like Truist and Optus — from a legacy AngularJS-to-Angular 16 migration with a 25-person offshore team to BI portals used by thousands of employees.',
          'Since February 2025 I work independently: building React applications, AI-powered tools and automation for founders and small businesses. I am relocating to Germany and learning German.',
        ),
        factList: [
          { label: 'Years of enterprise Angular at Infosys', value: '5.5' },
          { label: 'Engineers led on an offshore migration team', value: '25' },
          { label: 'Freelance — React apps & AI tools', value: 'Feb 2025' },
          { label: 'German, actively learning', value: 'A1' },
        ],
      },
      experience: {
        heading: 'Experience',
        entries: [
          {
            company: 'Freelance',
            role: 'Frontend Engineer — React & AI applications',
            narrativeHeadline: 'Betting on React and AI',
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
            narrativeHeadline: 'Leading 25 engineers through a migration',
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
            narrativeHeadline: 'Owning delivery across time zones',
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
            narrativeHeadline: 'Becoming the bridge between teams',
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
            narrativeHeadline: 'Where it began',
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
        linkedinRecommendationsUrl: 'https://www.linkedin.com/in/jerome-dmello/',
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
          { label: 'Jahre Enterprise-Angular bei Infosys', value: '5,5' },
          { label: 'Engineers im Offshore-Migrationsteam geführt', value: '25' },
          { label: 'Freiberuflich — React-Apps & AI-Tools', value: 'Feb 2025' },
          { label: 'Deutsch, aktiv am Lernen', value: 'A1' },
        ],
      },
      experience: {
        heading: 'Erfahrung',
        entries: [
          {
            company: 'Freelance',
            role: 'Frontend-Entwickler — React & AI-Anwendungen',
            narrativeHeadline: 'Die Wette auf React und AI',
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
            narrativeHeadline: 'Führung von 25 Engineers durch eine Migration',
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
            narrativeHeadline: 'Verantwortung über Zeitzonen hinweg',
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
            narrativeHeadline: 'Die Brücke zwischen Teams',
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
            narrativeHeadline: 'Wo alles begann',
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
              { name: 'AI agents & automation' },
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
              { name: 'Jasmine / Karma (80% coverage)' },
              { name: 'CI/CD (GitLab, GitHub)' },
              { name: 'Agile (certified)' },
              { name: 'Offshore team leadership' },
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
        linkedinRecommendationsUrl: 'https://www.linkedin.com/in/jerome-dmello/',
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

  // ---------- case-studies (wire-case-studies) ----------
  // Jerome's own end-to-end builds, live on Vercel. Metrics are product facts
  // visible on the live sites (no invented clients/revenue/user numbers). DE is
  // AI-drafted → needsGermanReview: true on every study. Upserted by slug so
  // re-running seed updates in place instead of duplicating.
  const STACK = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS']

  type Study = {
    slug: string
    title: string
    projectType: 'client-work' | 'micro-saas'
    year: number
    order: number
    featured: boolean
    liveUrl: string
    summary: { en: string; de: string }
    metrics: { value: string; en: string; de: string }[]
    body: { en: string[]; de: string[] }
  }

  const studies: Study[] = [
    {
      slug: 'harbour-and-vine',
      title: 'Harbour & Vine',
      projectType: 'client-work',
      year: 2026,
      order: 1,
      featured: true,
      liveUrl: 'https://harbour-and-wine-jeromeb4u.vercel.app',
      summary: {
        en: 'Reservation platform for a two-location coastal restaurant group — table booking with deposits and dietary notes in a 90-second flow, no phone calls.',
        de: 'Reservierungsplattform für eine Küstengastronomie mit zwei Standorten — Tischbuchung mit Anzahlung und Ernährungshinweisen in einem 90-Sekunden-Ablauf, ganz ohne Anruf.',
      },
      metrics: [
        { value: '90s', en: 'booking flow, start to confirmation', de: 'Buchung, vom Start bis zur Bestätigung' },
        { value: '2', en: 'locations with independent availability', de: 'Standorte mit eigener Verfügbarkeit' },
      ],
      body: {
        en: [
          'Fine-dining restaurants still lose bookings to phone-only reservations — a voicemail left at 3pm, a table never confirmed. For a two-location coastal group, every missed call is a covered table left empty.',
          'Harbour & Vine takes the whole booking online: a table held with a deposit, dietary notes and allergies captured up front, and private-event enquiries for eight to twenty guests. A daily “from the fire” board names the day-boats that landed the catch, so the menu reads as fresh as the kitchen.',
          'The result is a fully responsive, image-optimized site deployed on Vercel — a ninety-second path from landing to a confirmed table, with each location running its own availability.',
        ],
        de: [
          'Gehobene Restaurants verlieren noch immer Buchungen an rein telefonische Reservierung — eine Mailbox um 15 Uhr, ein Tisch, der nie bestätigt wird. Für eine Gruppe mit zwei Standorten ist jeder verpasste Anruf ein leerer Tisch.',
          'Harbour & Vine bringt die ganze Buchung online: ein Tisch, mit Anzahlung gehalten, Ernährungshinweise und Allergien vorab erfasst, dazu Anfragen für private Events mit acht bis zwanzig Gästen. Eine tägliche „from the fire“-Tafel nennt die Tagesboote, die den Fang gebracht haben.',
          'Das Ergebnis ist eine voll responsive, bildoptimierte Website auf Vercel — 90 Sekunden von der Landung bis zum bestätigten Tisch, jeder Standort mit eigener Verfügbarkeit.',
        ],
      },
    },
    {
      slug: 'northgate',
      title: 'Northgate',
      projectType: 'micro-saas',
      year: 2026,
      order: 2,
      featured: true,
      liveUrl: 'https://northgate-jeromeb4u.vercel.app',
      summary: {
        en: 'Private wealth platform that replaces the quarterly PDF — live portfolio dashboard, direct advisor messaging, and traceable transactions behind auth.',
        de: 'Private-Wealth-Plattform als Ersatz für das Quartals-PDF — Live-Portfolio-Dashboard, direkte Nachrichten an die Beratung und nachvollziehbare Transaktionen hinter Login.',
      },
      metrics: [
        { value: 'Live', en: 'portfolio values, not quarterly PDFs', de: 'Portfoliowerte — kein Quartals-PDF' },
        { value: '1:1', en: 'advisor messaging, no support queue', de: 'Beratung direkt, ohne Support-Warteschlange' },
      ],
      body: {
        en: [
          'Private-wealth clients live between two bad options: a static quarterly PDF that is out of date the day it lands, and phone-tag with an advisor just to ask a single number.',
          'Northgate replaces both. Behind authentication, an always-current portfolio dashboard shows live values, a stage-based onboarding flow tells clients exactly what is left to do, and a transaction history makes every figure traceable back to its source. Messaging goes straight to the advisor — no support queue.',
          'Built as a secure, responsive web app and deployed on Vercel.',
        ],
        de: [
          'Private-Wealth-Kunden haben nur zwei schlechte Optionen: ein statisches Quartals-PDF, das am Tag der Zustellung veraltet ist, und Telefon-Ping-Pong mit der Beratung für eine einzige Zahl.',
          'Northgate ersetzt beides. Hinter dem Login zeigt ein stets aktuelles Portfolio-Dashboard Live-Werte, ein stufenweiser Onboarding-Ablauf sagt Kunden genau, was noch zu tun ist, und eine Transaktionshistorie macht jede Zahl nachvollziehbar. Nachrichten gehen direkt an die Beratung — ohne Support-Warteschlange.',
          'Umgesetzt als sichere, responsive Web-App und auf Vercel deployed.',
        ],
      },
    },
    {
      slug: 'ridgeline-supply',
      title: 'Ridgeline Supply Co.',
      projectType: 'client-work',
      year: 2026,
      order: 3,
      featured: true,
      liveUrl: 'https://ridgeline-supply-jeromeb4u.vercel.app',
      summary: {
        en: 'Technical outdoor-gear storefront — spec-sheet-first product pages, cart and checkout with real-time stock verification, accounts with order history and returns.',
        de: 'Storefront für technische Outdoor-Ausrüstung — Produktseiten mit Datenblatt zuerst, Warenkorb und Checkout mit Echtzeit-Bestandsprüfung, Konten mit Bestellhistorie und Retouren.',
      },
      metrics: [
        { value: '8', en: 'product categories, spec-first', de: 'Produktkategorien, Spec zuerst' },
        { value: 'Live', en: 'inventory check at checkout', de: 'Bestandsprüfung beim Checkout' },
      ],
      body: {
        en: [
          'Outdoor e-commerce buries the numbers that actually decide a purchase — weight in grams, fabric denier, waterproof rating — under lifestyle photography and vague copy.',
          'Ridgeline Supply Co. leads with the spec sheet. Category navigation — hardshells, insulation, shelter, packs, footwear and more — opens onto product pages built around full specification tables; the cart and checkout verify stock in real time; and a signed-in account carries order history and a returns portal.',
          'Deployed on Vercel, fully responsive and image-optimized.',
        ],
        de: [
          'Outdoor-E-Commerce versteckt genau die Zahlen, die den Kauf entscheiden — Gewicht in Gramm, Denier des Materials, Wassersäule — hinter Lifestyle-Fotos und vager Sprache.',
          'Ridgeline Supply Co. stellt das Datenblatt nach vorn. Die Kategorienavigation — Hardshells, Isolation, Shelter, Rucksäcke, Schuhe und mehr — führt auf Produktseiten rund um vollständige Spezifikationstabellen; Warenkorb und Checkout prüfen den Bestand in Echtzeit; ein Konto trägt Bestellhistorie und ein Retourenportal.',
          'Auf Vercel deployed, voll responsive und bildoptimiert.',
        ],
      },
    },
    {
      slug: 'aperture-dental',
      title: 'Aperture Dental',
      projectType: 'client-work',
      year: 2026,
      order: 4,
      featured: true,
      liveUrl: 'https://aperture-dental-jeromeb4u.vercel.app',
      summary: {
        en: 'Dental practice site built against patient anxiety — real practitioners, real time slots, and prices shown before treatment, not after.',
        de: 'Website einer Zahnarztpraxis gegen die Angst der Patienten — echte Behandler, echte Termine und Preise vor der Behandlung, nicht danach.',
      },
      metrics: [
        { value: 'Live', en: 'appointment slots per practitioner', de: 'Termine pro Behandler in Echtzeit' },
        { value: '0', en: 'callback forms — booking is direct', de: 'Rückruf-Formulare — Buchung direkt' },
      ],
      body: {
        en: [
          'Most fear of the dentist comes from not knowing what happens next — and dental sites make it worse, hiding costs and booking through “we’ll get back to you” callback forms.',
          'Aperture is built against that anxiety. Appointments book directly against named practitioners’ real time slots, pricing and financing are shown before treatment rather than after, and team profiles put real people to the practice.',
          'A calm, responsive site deployed on Vercel.',
        ],
        de: [
          'Die meiste Angst vor dem Zahnarzt kommt daher, nicht zu wissen, was als Nächstes passiert — und Praxis-Websites machen es schlimmer, verstecken Kosten und buchen über „wir melden uns“-Formulare.',
          'Aperture ist gegen diese Angst gebaut. Termine werden direkt auf echte Zeitfenster benannter Behandler gebucht, Preise und Finanzierung werden vor der Behandlung gezeigt statt danach, und Teamprofile geben der Praxis echte Gesichter.',
          'Eine ruhige, responsive Website, auf Vercel deployed.',
        ],
      },
    },
    {
      slug: 'brightwater',
      title: 'Brightwater Plumbing & Heating',
      projectType: 'client-work',
      year: 2025,
      order: 5,
      featured: false,
      liveUrl: 'https://brightwater-jeromeb4u.vercel.app',
      summary: {
        en: 'Emergency trade-services site with fixed upfront pricing, same-day online booking, and a live engineer-tracking link with ETA.',
        de: 'Website für Notdienst-Handwerk mit festen Vorab-Preisen, Online-Buchung am selben Tag und einem Live-Tracking-Link samt ETA.',
      },
      metrics: [
        { value: '2h', en: 'arrival guarantee, tracked live', de: 'Ankunftsgarantie, live verfolgt' },
        { value: '£89', en: 'call-out — priced on the page, not on the phone', de: 'Anfahrt — auf der Seite ausgepreist, nicht am Telefon' },
      ],
      body: {
        en: [
          'When a pipe bursts, the last thing a homeowner wants is an unpriced call-out and a vague “sometime tomorrow.”',
          'Brightwater puts the numbers on the page: a fixed £89 call-out, same-day online booking, and Gas Safe engineer profiles with registration numbers. Once an engineer is dispatched, a private tracking link shows their status and a two-hour arrival window.',
          'Deployed on Vercel, responsive across phone and desktop.',
        ],
        de: [
          'Wenn ein Rohr platzt, will niemand einen Einsatz ohne Preis und ein vages „irgendwann morgen“.',
          'Brightwater bringt die Zahlen auf die Seite: eine feste Anfahrt von £89, Online-Buchung am selben Tag und Profile von Gas-Safe-Monteuren mit Registriernummer. Sobald ein Monteur unterwegs ist, zeigt ein privater Tracking-Link seinen Status und ein Zwei-Stunden-Ankunftsfenster.',
          'Auf Vercel deployed, responsive auf Handy und Desktop.',
        ],
      },
    },
    {
      slug: 'meridian-partners',
      title: 'Meridian Partners',
      projectType: 'client-work',
      year: 2025,
      order: 6,
      featured: false,
      liveUrl: 'https://meridian-partners-jeromeb4u.vercel.app',
      summary: {
        en: 'Consulting-firm site that publishes methodology next to results — quantified case studies, partner profiles, and a client portal entry point.',
        de: 'Website einer Beratung, die Methodik neben Ergebnisse stellt — quantifizierte Case Studies, Partnerprofile und ein Einstieg ins Kundenportal.',
      },
      metrics: [
        { value: '100%', en: 'case studies with quantified outcomes', de: 'Case Studies mit messbaren Ergebnissen' },
      ],
      body: {
        en: [
          'Most consultancies show you a testimonial and ask you to trust the process.',
          'Meridian Partners publishes the method next to the result: case studies with quantified outcomes, partner profiles, and a client-portal entry point for live engagements.',
          'A dark, editorial site deployed on Vercel.',
        ],
        de: [
          'Die meisten Beratungen zeigen ein Testimonial und bitten darum, dem Prozess zu vertrauen.',
          'Meridian Partners veröffentlicht die Methode neben dem Ergebnis: Case Studies mit quantifizierten Ergebnissen, Partnerprofile und einen Einstieg ins Kundenportal für laufende Mandate.',
          'Eine dunkle, editoriale Website, auf Vercel deployed.',
        ],
      },
    },
    {
      slug: 'atelier-nord',
      title: 'Atelier Nord',
      projectType: 'client-work',
      year: 2025,
      order: 7,
      featured: false,
      liveUrl: 'https://atelier-nord-jeromeb4u.vercel.app',
      summary: {
        en: 'Architecture-practice site with a client portal concept — version-controlled drawings, approval records, and a portfolio restricted to photographed built work.',
        de: 'Website eines Architekturbüros mit Kundenportal-Konzept — versionierte Pläne, Freigabe-Protokolle und ein Portfolio nur aus fotografierten, gebauten Projekten.',
      },
      metrics: [
        { value: '5', en: 'project stages, concept to handover', de: 'Projektphasen, Konzept bis Übergabe' },
      ],
      body: {
        en: [
          'An architecture practice is judged on built work and on how it runs a commission — but most practice sites show neither clearly.',
          'Atelier Nord pairs a portfolio restricted to photographed, built work with a client-portal concept: version-controlled drawings, approval records, and a project moving through five stages from concept to handover.',
          'A restrained, responsive site deployed on Vercel.',
        ],
        de: [
          'Ein Architekturbüro wird an gebauten Projekten gemessen und daran, wie es ein Mandat führt — doch die meisten Websites zeigen keines von beidem klar.',
          'Atelier Nord verbindet ein Portfolio aus ausschließlich fotografierten, gebauten Projekten mit einem Kundenportal-Konzept: versionierte Pläne, Freigabe-Protokolle und ein Projekt, das fünf Phasen von Konzept bis Übergabe durchläuft.',
          'Eine zurückhaltende, responsive Website, auf Vercel deployed.',
        ],
      },
    },
  ]

  for (const s of studies) {
    const existing = await payload.find({
      collection: 'case-studies',
      locale: 'en',
      where: { slug: { equals: s.slug } },
      limit: 1,
      depth: 0,
    })
    const enData = {
      title: s.title,
      slug: s.slug,
      projectType: s.projectType,
      summary: s.summary.en,
      coverImage: coverIds[s.slug],
      liveUrl: s.liveUrl,
      stack: STACK.map((tech) => ({ tech })),
      year: s.year,
      role: 'Design, build & deployment',
      body: rt(...s.body.en),
      metrics: s.metrics.map((m) => ({ value: m.value, label: m.en })),
      needsGermanReview: true,
      order: s.order,
      featured: s.featured,
      confidential: false,
      _status: 'published',
    }
    const doc = existing.docs[0]
      ? await payload.update({
          collection: 'case-studies',
          id: existing.docs[0].id,
          locale: 'en',
          data: enData as never,
        })
      : await payload.create({ collection: 'case-studies', locale: 'en', data: enData as never })

    await payload.update({
      collection: 'case-studies',
      id: doc.id,
      locale: 'de',
      data: mergeIds(
        {
          title: s.title,
          summary: s.summary.de,
          role: 'Design, Umsetzung & Deployment',
          body: rt(...s.body.de),
          metrics: s.metrics.map((m) => ({ value: m.value, label: m.de })),
        },
        doc,
      ) as never,
    })
  }

  payload.logger.info('Seed complete.')
}

