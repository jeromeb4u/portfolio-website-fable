import React from 'react'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { RichTextRenderer } from '@/components/richtext/RichTextRenderer'
import { routing, type Locale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { getCaseStudyBySlug, getPublishedCaseStudies } from '@/lib/data'
import { Reveal } from '@/components/motion/Reveal'
import { buttonClasses } from '@/components/ui/Button'
import { buildLanguageAlternates, buildOpenGraph, absoluteUrl } from '@/lib/seo'
import type { Media } from '@/payload-types'

export const revalidate = 300

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of routing.locales) {
    const docs = await getPublishedCaseStudies(locale)
    for (const doc of docs) params.push({ locale, slug: doc.slug })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const cs = await getCaseStudyBySlug(slug, locale)
  if (!cs) return {}
  const cover = cs.coverImage as Media | null
  return {
    title: cs.title,
    description: cs.summary,
    alternates: {
      canonical: absoluteUrl(`/${locale}/work/${slug}`),
      languages: buildLanguageAlternates(`/work/${slug}`),
    },
    openGraph: buildOpenGraph({
      locale,
      title: cs.title,
      description: cs.summary,
      path: `/work/${slug}`,
      imagePath: cover?.url ?? undefined,
    }),
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const cs = await getCaseStudyBySlug(slug, locale as Locale)
  if (!cs) notFound()

  const t = await getTranslations('work')
  const cover = cs.coverImage as Media
  const all = await getPublishedCaseStudies(locale as Locale)
  const idx = all.findIndex((d) => d.slug === cs.slug)
  const prev = idx > 0 ? all[idx - 1] : null
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null

  return (
    <article className="pt-32">
      <div className="container-site">
        <Link href="/#work" className="mono-label text-ink-muted hover:text-ink">
          ← {t('back')}
        </Link>

        <Reveal as="h1" variant="clip" className="mt-8 max-w-4xl font-serif text-display text-ink">
          {cs.title}
        </Reveal>
        <Reveal as="p" delay={0.15} className="mt-6 max-w-2xl text-body-lg text-ink-muted">
          {cs.summary}
        </Reveal>

        <Reveal delay={0.25} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="mono-label text-ink-muted">{cs.year}</span>
          {cs.role ? <span className="mono-label text-ink-muted">{cs.role}</span> : null}
          <span className="mono-label text-accent-strong">{cs.projectType}</span>
          {cs.confidential ? (
            <span className="mono-label rounded-full border border-line px-3 py-1 text-ink-muted">
              {t('confidential')}
            </span>
          ) : null}
          {(cs.stack ?? []).map((s) => (
            <span key={s.id} className="mono-label text-ink-muted">
              {s.tech}
            </span>
          ))}
        </Reveal>

        {/* Confidential client work never links out, regardless of what's filled in the CMS. */}
        {!cs.confidential && (cs.liveUrl || cs.repoUrl) ? (
          <Reveal delay={0.3} className="mt-8 flex gap-4">
            {cs.liveUrl ? (
              <a href={cs.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('primary')}>
                {t('visit')} ↗
              </a>
            ) : null}
            {cs.repoUrl ? (
              <a href={cs.repoUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('ghost')}>
                {t('code')} ↗
              </a>
            ) : null}
          </Reveal>
        ) : null}
      </div>

      {cover?.url ? (
        <div className="container-site mt-14">
          <Image
            src={cover.url}
            alt={cover.alt ?? cs.title}
            width={cover.width ?? 1600}
            height={cover.height ?? 900}
            priority
            className="w-full rounded-xl object-cover"
          />
        </div>
      ) : null}

      {(cs.metrics ?? []).length > 0 ? (
        <div className="container-site mt-16">
          <Reveal as="ul" stagger className="grid gap-8 border-y border-line py-10 sm:grid-cols-3">
            {(cs.metrics ?? []).map((m) => (
              <li key={m.id}>
                <p className="font-serif text-h2 text-ink">{m.value}</p>
                <p className="mono-label mt-1 text-ink-muted">{m.label}</p>
              </li>
            ))}
          </Reveal>
        </div>
      ) : null}

      {cs.body ? (
        <div className="container-site section-pad">
          <RichTextRenderer data={cs.body} className="mx-auto max-w-3xl" />
        </div>
      ) : null}

      <nav className="container-site flex justify-between border-t border-line py-10" aria-label="Case studies">
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="group max-w-[45%]">
            <span className="mono-label text-ink-muted">← {t('prev')}</span>
            <p className="mt-1 font-medium text-ink group-hover:underline">{prev.title}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}`} className="group max-w-[45%] text-right">
            <span className="mono-label text-ink-muted">{t('next')} →</span>
            <p className="mt-1 font-medium text-ink group-hover:underline">{next.title}</p>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
