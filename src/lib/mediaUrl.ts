import type { Media } from '@/payload-types'

/**
 * Resolve a Payload media doc to a URL the *production* server can actually
 * serve.
 *
 * Payload's own `media.url` points at `/api/media/file/<filename>`, which
 * resolves the row in the runtime database. That works locally (SQLite, seeded)
 * but 500s on the cPanel box: pages are prerendered here and shipped as a build
 * artifact, while the server's Postgres has no media rows and the upload dir is
 * gitignored. So every Payload-served image was broken in production.
 *
 * Media now uploads into `public/media` (see collections/Media.ts), which is
 * git-tracked and therefore part of the deploy artifact — meaning the file is
 * on disk next to the build and Next can serve it statically at `/media/...`,
 * with no database lookup at all.
 */
export function mediaUrl(media: Media | null | undefined): string | undefined {
  if (!media) return undefined
  if (media.filename) return `/media/${media.filename}`
  // Uploads predating the static-dir switch have no filename projected —
  // fall back to Payload's route rather than dropping the image entirely.
  return media.url ?? undefined
}
