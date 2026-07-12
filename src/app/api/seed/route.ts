import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { runSeed } from '@/seed/seed'

// Guarded seed endpoint. Requires the PAYLOAD_SECRET as a header, so it is
// unusable without server access. Idempotent — safe to call repeatedly.
export async function POST(request: Request) {
  const secret = request.headers.get('x-seed-secret')
  if (!process.env.PAYLOAD_SECRET || secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const payload = await getPayload({ config })
  await runSeed(payload)
  return NextResponse.json({ ok: true })
}
