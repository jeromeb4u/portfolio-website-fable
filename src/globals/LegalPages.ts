import type { GlobalConfig } from 'payload'
import { revalidateAfterChangeGlobal } from '../lib/revalidate'

export const Imprint: GlobalConfig = {
  slug: 'imprint',
  label: 'Imprint (Impressum)',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChangeGlobal] },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'body', type: 'richText', required: true, localized: true },
    {
      name: 'needsGermanReview',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'German text is AI-drafted and not yet proofread' },
    },
  ],
}

export const Privacy: GlobalConfig = {
  slug: 'privacy',
  label: 'Privacy (Datenschutz)',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChangeGlobal] },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'body', type: 'richText', required: true, localized: true },
    {
      name: 'needsGermanReview',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'German text is AI-drafted and not yet proofread' },
    },
  ],
}
