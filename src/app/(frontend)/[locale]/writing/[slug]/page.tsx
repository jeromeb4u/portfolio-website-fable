import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getPostBySlug, getPublishedPosts } from '@/lib/data'
import { PostBody } from '@/components/sections/PostBody'
import { buildLanguageAlternates, buildOpenGraph, absoluteUrl } from '@/lib/seo'
import type { Media } from '@/payload-types'

export const revalidate = 300

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of routing.locales) {
    const docs = await getPublishedPosts(locale)
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
  const post = await getPostBySlug(slug, locale)
  if (!post) return {}
  const cover = post.coverImage as Media | null
  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: absoluteUrl(`/${locale}/writing/${slug}`),
      languages: buildLanguageAlternates(`/writing/${slug}`),
    },
    openGraph: buildOpenGraph({
      locale,
      title: post.title,
      description: post.summary,
      path: `/writing/${slug}`,
      imagePath: cover?.url ?? undefined,
    }),
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const post = await getPostBySlug(slug, locale as Locale)
  if (!post) notFound()

  return <PostBody post={post} locale={locale as Locale} />
}
