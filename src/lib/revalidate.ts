import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

// Editing content in /backstage makes the public site revalidate on the next
// request — no redeploy needed. Wrapped in try/catch so the seed script
// (which runs outside a Next request context) doesn't crash.
const revalidateAll = async () => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // Not running inside Next (e.g. `pnpm seed`) — nothing to revalidate.
  }
}

export const revalidateAfterChangeGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidateAll()
  return doc
}

export const revalidateAfterChangeCollection: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidateAll()
  return doc
}
