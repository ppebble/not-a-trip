'use client'

import Link from 'next/link'

/**
 * CTA(Call-To-Action) 버튼 컴포넌트
 * next/link 기반 클라이언트 사이드 라우팅, 시맨틱 컬러 사용
 * Requirements: 1.6, 1.7, 1.8, 7.5
 */

interface CTAButtonProps {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
}

const variantStyles = {
  primary:
    'bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600 focus-visible:ring-primary-500',
  secondary:
    'bg-secondary-100 text-secondary-700 shadow-sm hover:bg-secondary-200 focus-visible:ring-secondary-500',
} as const

const sizeStyles = {
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
} as const

export function CTAButton({
  label,
  href,
  variant = 'primary',
  size = 'md',
}: CTAButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} `}
    >
      {label}
    </Link>
  )
}
