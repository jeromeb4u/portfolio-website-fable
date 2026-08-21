import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Describe the image for screen readers and SEO. Required.',
      },
    },
  ],
  upload: {
    // Uploads land in `public/media` (git-tracked) instead of Payload's default
    // root `media/` (gitignored). The frontend then links them statically via
    // lib/mediaUrl — no `/api/media/file/...` database lookup, which is what
    // broke every image on the prebuilt-artifact cPanel deploy.
    staticDir: path.resolve(dirname, '../../public/media'),
  },
}
