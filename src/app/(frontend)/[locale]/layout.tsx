import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: "Jerome D'mello — Frontend Engineer (React, Angular) & AI Tool Builder",
    template: "%s — Jerome D'mello",
  },
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <main id="content">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
