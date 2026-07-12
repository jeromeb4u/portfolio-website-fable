import type { GlobalConfig } from 'payload'
import { revalidateAfterChangeGlobal } from '../lib/revalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChangeGlobal] },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        {
          name: 'anchor',
          type: 'text',
          required: true,
          admin: { description: 'Section id without #, e.g. "work"' },
        },
      ],
    },
    { name: 'ctaLabel', type: 'text', required: true, localized: true },
  ],
}
