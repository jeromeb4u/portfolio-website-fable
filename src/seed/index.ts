/**
 * CLI entry: pnpm seed  (payload run src/seed/index.ts)
 * Note: on some Windows setups `payload run` exits silently; use the dev-server
 * route instead: start `pnpm dev`, then POST /api/seed with x-seed-secret header.
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { runSeed } from './seed'

const run = async () => {
  const payload = await getPayload({ config })
  await runSeed(payload)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
