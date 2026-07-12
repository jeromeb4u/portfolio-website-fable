'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const fieldClasses =
  'w-full rounded-lg border border-line bg-bg px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-ink focus:outline-none transition-colors duration-300'

export function ContactForm({
  successMessage,
  errorMessage,
}: {
  successMessage: string
  errorMessage: string
}) {
  const t = useTranslations('form')
  const locale = useLocale()
  const [submitting, setSubmitting] = useState(false)

  const schema = z.object({
    name: z.string().trim().min(2, t('validationName')),
    email: z.string().trim().email(t('validationEmail')),
    message: z.string().trim().min(20, t('validationMessage')),
    company: z.string().max(0).optional().or(z.literal('')), // honeypot
  })
  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      })
      if (!res.ok) throw new Error('request_failed')
      toast.success(successMessage)
      reset()
    } catch {
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid max-w-xl gap-5" noValidate>
      {/* Honeypot — hidden from real users, bots fill it */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        {...register('company')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mono-label mb-2 block text-ink-muted">
            {t('nameLabel')}
          </label>
          <input id="cf-name" className={cn(fieldClasses, errors.name && 'border-accent-strong')} {...register('name')} />
          {errors.name ? <p className="mt-1.5 text-sm text-accent-strong">{errors.name.message}</p> : null}
        </div>
        <div>
          <label htmlFor="cf-email" className="mono-label mb-2 block text-ink-muted">
            {t('emailLabel')}
          </label>
          <input
            id="cf-email"
            type="email"
            className={cn(fieldClasses, errors.email && 'border-accent-strong')}
            {...register('email')}
          />
          {errors.email ? <p className="mt-1.5 text-sm text-accent-strong">{errors.email.message}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className="mono-label mb-2 block text-ink-muted">
          {t('messageLabel')}
        </label>
        <textarea
          id="cf-message"
          rows={5}
          className={cn(fieldClasses, 'resize-y', errors.message && 'border-accent-strong')}
          {...register('message')}
        />
        {errors.message ? <p className="mt-1.5 text-sm text-accent-strong">{errors.message.message}</p> : null}
      </div>

      <Button type="submit" disabled={submitting} className="justify-self-start">
        {submitting ? t('submitting') : t('submitLabel')}
      </Button>
    </form>
  )
}
