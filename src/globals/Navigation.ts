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
          // A nav item is either a jump to a homepage section or a link to a
          // real route. Sections still work from a subpage — the header sends
          // the reader home with the hash and the scroll happens on arrival.
          // Not `required`: existing rows predate this field, and a NOT NULL
          // column can't be added to them. Absent is read as 'section'.
          name: 'kind',
          type: 'radio',
          defaultValue: 'section',
          options: [
            { label: 'Homepage section', value: 'section' },
            { label: 'Page', value: 'page' },
          ],
        },
        {
          name: 'anchor',
          type: 'text',
          admin: {
            condition: (_, sibling) => sibling?.kind !== 'page',
            description: 'Section id without #, e.g. "work"',
          },
        },
        {
          name: 'href',
          type: 'text',
          admin: {
            condition: (_, sibling) => sibling?.kind === 'page',
            description: 'Route path without the locale prefix, e.g. "/work"',
          },
        },
      ],
    },
    { name: 'ctaLabel', type: 'text', required: true, localized: true },
  ],
}
