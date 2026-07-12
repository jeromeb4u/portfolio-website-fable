import type { GlobalConfig } from 'payload'
import { revalidateAfterChangeGlobal } from '../lib/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChangeGlobal] },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: "Jerome D'mello" },
    { name: 'tagline', type: 'text', required: true, localized: true },
    { name: 'email', type: 'email', required: true },
    { name: 'location', type: 'text', localized: true },
    {
      name: 'socials',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: ['linkedin', 'github', 'xing', 'email'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'cvEn', type: 'upload', relationTo: 'media', label: 'CV (English)' },
    { name: 'cvDe', type: 'upload', relationTo: 'media', label: 'CV (German)' },
    {
      name: 'availability',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Available now', value: 'available' },
        { label: 'Open to offers', value: 'open' },
        { label: 'Unavailable', value: 'unavailable' },
      ],
    },
    { name: 'availabilityNote', type: 'text', localized: true },
    {
      name: 'notFound',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
        { name: 'backHomeLabel', type: 'text', localized: true },
      ],
    },
  ],
}
