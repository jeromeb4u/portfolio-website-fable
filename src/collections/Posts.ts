import type { CollectionConfig } from 'payload'
import { revalidateAfterChangeCollection } from '../lib/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  hooks: { afterChange: [revalidateAfterChangeCollection] },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', '_status'],
  },
  versions: {
    drafts: true,
  },
  access: {
    // Public sees published only; logged-in admin sees drafts too (same pattern as CaseStudies).
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'kebab-case, stable across locales, used in the URL' },
    },
    { name: 'summary', type: 'textarea', required: true, localized: true },
    { name: 'body', type: 'richText', required: true, localized: true },
    { name: 'publishedDate', type: 'date', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'needsGermanReview',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'German copy is AI-drafted and not yet proofread', position: 'sidebar' },
    },
  ],
}
