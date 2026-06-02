'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type AdminStatusTone =
  | 'neutral'
  | 'info'
  | 'warning'
  | 'success'
  | 'danger'
  | 'critical'

type AdminStatusBadgeSize = 'xs' | 'sm'

type AdminActionVariant =
  | 'primary'
  | 'secondary'
  | 'approve'
  | 'reject'
  | 'neutral'

const STATUS_TONE_CLASSES: Record<AdminStatusTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  critical: 'bg-purple-100 text-purple-700',
}

const STATUS_SIZE_CLASSES: Record<AdminStatusBadgeSize, string> = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-3 py-1 text-sm',
}

const ACTION_VARIANT_CLASSES: Record<AdminActionVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-700',
  secondary: 'bg-blue-600 text-white hover:bg-blue-700',
  approve: 'bg-green-600 text-white hover:bg-green-700',
  reject: 'bg-red-600 text-white hover:bg-red-700',
  neutral: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
}

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export function AdminStatusBadge({
  children,
  tone = 'neutral',
  size = 'xs',
  className,
}: {
  children: ReactNode
  tone?: AdminStatusTone
  size?: AdminStatusBadgeSize
  className?: string
}) {
  return (
    <span
      className={mergeClassNames(
        'inline-flex items-center rounded-full font-medium',
        STATUS_SIZE_CLASSES[size],
        STATUS_TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

export function AdminActionButton({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminActionVariant
}) {
  return (
    <button
      type={type}
      className={mergeClassNames(
        'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
        ACTION_VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
