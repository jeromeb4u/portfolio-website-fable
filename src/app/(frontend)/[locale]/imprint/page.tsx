import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { routing, type Locale } from '@/i18n/routing'
import { getLegalPage } from '@/lib/data'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const page = await getLegalPage('imprint', locale)
  return { title: page.heading, robots: { index: false } }
}

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const page = await getLegalPage('imprint', locale as Locale)

  return (
    <article className="container-site pb-24 pt-40">
      <h1 className="font-serif text-h2 text-ink">{page.heading}</h1>
      <div className="mt-8 max-w-2xl space-y-4 text-ink-muted">
        <RichText data={page.body} />
      </div>
    </article>
  )
}
