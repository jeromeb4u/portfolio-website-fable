import type { CollectionConfig } from 'payload'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Contact Submission', plural: 'Contact Submissions' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'createdAt'],
    description: 'Messages from the site contact form. Read-only.',
  },
  access: {
    // Created only server-side by the contact API route (Local API bypasses access with overrideAccess).
    create: () => false,
    read: ({ req: { user } }) => Boolean(user),
    update: () => false,
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'locale', type: 'select', options: ['en', 'de'], required: true },
  ],
  timestamps: true,
}
