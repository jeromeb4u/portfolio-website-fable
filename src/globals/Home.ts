import type { GlobalConfig } from 'payload'
import { revalidateAfterChangeGlobal } from '../lib/revalidate'

export const Home: GlobalConfig = {
  slug: 'home',
  access: { read: () => true },
  hooks: { afterChange: [revalidateAfterChangeGlobal] },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true },
        { name: 'headingLine1', type: 'text', required: true, localized: true },
        { name: 'headingLine2', type: 'text', localized: true },
        { name: 'subheading', type: 'textarea', localized: true },
        { name: 'primaryCtaLabel', type: 'text', localized: true },
        { name: 'secondaryCtaLabel', type: 'text', localized: true },
        { name: 'splinePosterImage', type: 'upload', relationTo: 'media' },
        {
          name: 'splineSceneUrl',
          type: 'text',
          admin: { description: 'Spline scene export URL (.splinecode). Leave empty to show poster only.' },
        },
      ],
    },
    {
      name: 'about',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'body', type: 'richText', localized: true },
        { name: 'portraitImage', type: 'upload', relationTo: 'media' },
        {
          name: 'factList',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true },
            { name: 'value', type: 'text', required: true, localized: true },
          ],
        },
      ],
    },
    {
      name: 'experience',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        {
          name: 'entries',
          type: 'array',
          fields: [
            { name: 'company', type: 'text', required: true },
            { name: 'role', type: 'text', required: true, localized: true },
            { name: 'clientNote', type: 'text', localized: true },
            { name: 'dateStart', type: 'text', required: true, localized: true },
            { name: 'dateEnd', type: 'text', localized: true },
            {
              name: 'bullets',
              type: 'array',
              fields: [{ name: 'text', type: 'textarea', required: true, localized: true }],
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
    {
      name: 'skills',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        {
          name: 'groups',
          type: 'array',
          fields: [
            { name: 'groupLabel', type: 'text', required: true, localized: true },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'note', type: 'text', localized: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'workIntro',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'recommendations',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        {
          name: 'entries',
          type: 'array',
          fields: [
            { name: 'quote', type: 'textarea', required: true, localized: true },
            { name: 'authorName', type: 'text', required: true },
            { name: 'authorTitle', type: 'text', required: true },
            { name: 'authorCompany', type: 'text', required: true },
            {
              name: 'sourceUrl',
              type: 'text',
              admin: { description: 'Link to the LinkedIn recommendation once it exists' },
            },
            {
              name: 'consentConfirmed',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'REQUIRED before this quote appears on the site. Only tick after written consent from the author.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
        { name: 'successMessage', type: 'text', localized: true },
        { name: 'errorMessage', type: 'text', localized: true },
      ],
    },
  ],
}
