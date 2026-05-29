'use client'

import { memo } from 'react'
import Image from 'next/image'
import { ExternalLink, LINK_TYPE_CONFIG } from '@/types'

/**
 * ExternalLinkCard 컴포넌트 Props
 */
interface ExternalLinkCardProps {
  /** 외부 링크 데이터 */
  link: ExternalLink
  /** 클릭 핸들러 (선택) */
  onClick?: () => void
}

/**
 * ExternalLinkCard 컴포넌트
 *
 * 외부 링크를 카드 형태로 표시합니다.
 * 링크 타입별 아이콘/색상을 표시하고, 새 탭에서 열기 기능을 제공합니다.
 *
 * Requirements:
 * - 2.3: 외부 링크를 클릭 가능한 버튼/카드로 표시
 * - 2.4: 새 탭에서 열기
 */
export const ExternalLinkCard = memo(function ExternalLinkCard({
  link,
  onClick,
}: ExternalLinkCardProps) {
  const config = LINK_TYPE_CONFIG[link.type]

  const handleClick = () => {
    onClick?.()
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-all hover:border-primary-300 hover:shadow-md"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: config.color,
      }}
    >
      {/* 아이콘 */}
      <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: config.color, opacity: 0.08 }}
        />
        <Image
          src={config.icon}
          alt={config.label}
          width={24}
          height={24}
          className="relative z-10"
        />
      </span>

      {/* 텍스트 영역 */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text-primary">{link.label}</p>
        <p className="truncate text-sm text-muted">{config.label}</p>
      </div>

      {/* 화살표 아이콘 */}
      <svg
        className="h-5 w-5 flex-shrink-0 text-muted transition-transform group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </button>
  )
})
