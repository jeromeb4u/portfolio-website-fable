import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@/payload.config'

const contactSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(20).max(5000),
  locale: z.enum(['en', 'de']),
  // Honeypot — real users never fill this hidden field.
  company: z.string().max(0).optional().or(z.literal('')),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 400 })
  }
  const { name, email, message, locale } = parsed.data

  const payload = await getPayload({ config })

  await payload.create({
    collection: 'contact-submissions',
    data: { name, email, message, locale },
    overrideAccess: true,
  })

  // Email notification is best-effort: the submission is already stored in the
  // CMS, so a Resend outage must not fail the request.
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: email,
        subject: `Portfolio contact: ${name}`,
        text: `From: ${name} <${email}> (locale: ${locale})\n\n${message}`,
      })
    } catch (err) {
      payload.logger.error({ err }, 'Resend notification failed')
    }
  }

  return NextResponse.json({ ok: true })
}
