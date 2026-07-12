import type { CollectionConfig } from 'payload'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { revalidateAfterChangeCollection } from '../lib/revalidate'

export const CaseStudies: CollectionConfig = {
  hooks: { afterChange: [revalidateAfterChangeCollection] },
  slug: 'case-studies',
  labels: { singular: 'Case Study', plural: 'Case Studies' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectType', 'year', '_status', 'order'],
  },
  versions: {
    drafts: true,
  },
  access: {
    // Public sees published only; logged-in admin sees drafts too.
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
    {
      name: 'projectType',
      type: 'select',
      required: true,
      options: [
        { label: 'AI Tool', value: 'ai-tool' },
        { label: 'Dev Tool', value: 'dev-tool' },
        { label: 'Automation', value: 'automation' },
        { label: 'Micro SaaS', value: 'micro-saas' },
        { label: 'Client Work', value: 'client-work' },
      ],
    },
    { name: 'summary', type: 'textarea', required: true, localized: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'coverVideo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional short muted loop (mp4/webm) played on card hover' },
    },
    { name: 'liveUrl', type: 'text' },
    { name: 'repoUrl', type: 'text' },
    {
      name: 'stack',
      type: 'array',
      fields: [{ name: 'tech', type: 'text', required: true }],
    },
    { name: 'year', type: 'number', required: true },
    { name: 'role', type: 'text', localized: true },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ blocks: [] })],
      }),
    },
    {
      name: 'metrics',
      type: 'array',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true, localized: true },
      ],
    },
    {
      name: 'needsGermanReview',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'German copy is AI-drafted and not yet proofread', position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers appear first', position: 'sidebar' },
    },
  ],
}
