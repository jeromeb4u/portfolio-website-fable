import React from 'react'
import { cn } from '@/lib/utils'

const styles = {
  // 01-design-system §5: pill buttons; primary fills accent-strong on hover (AA-safe)
  primary:
    'bg-ink text-bg hover:bg-accent-strong hover:text-white active:scale-[0.98] transition-[background-color,color,transform] duration-300',
  ghost:
    'border border-line text-ink hover:border-ink active:scale-[0.98] transition-[border-color,transform] duration-300',
  inverse:
    'bg-bg text-ink hover:bg-accent hover:text-white active:scale-[0.98] transition-[background-color,color,transform] duration-300',
} as const

type ButtonVariant = keyof typeof styles

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none'

export function buttonClasses(variant: ButtonVariant = 'primary', className?: string) {
  return cn(base, styles[variant], className)
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonClasses(variant, className)} {...props} />
}
