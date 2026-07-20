import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { CaseStudies } from './collections/CaseStudies'
import { Posts } from './collections/Posts'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Home } from './globals/Home'
import { Imprint, Privacy } from './globals/LegalPages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Production (Vercel + Neon): set DATABASE_URI to the Neon Postgres connection string.
// Local dev without DATABASE_URI falls back to a SQLite file — zero setup.
const db = process.env.DATABASE_URI
  ? postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } })
  : sqliteAdapter({ client: { url: 'file:./dev.db' } })

export default buildConfig({
  routes: {
    // Admin dashboard lives at /backstage, not /admin. Keep in sync with robots + middleware matcher.
    admin: '/backstage',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — JD Content',
    },
  },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Deutsch', code: 'de' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [Users, Media, CaseStudies, Posts, ContactSubmissions],
  globals: [SiteSettings, Navigation, Home, Imprint, Privacy],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db,
  sharp,
  plugins: [],
})
